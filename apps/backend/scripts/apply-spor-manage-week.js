/* Guarded local operator entrypoint. Dry-run by default; uses the product service. */
require('reflect-metadata');
const assert = require('node:assert/strict');
const { PrismaService } = require('../node_modules/.cache/ngcs-quality-build/prisma/prisma.service');
const { PlanningService } = require('../node_modules/.cache/ngcs-quality-build/planning/planning.service');

async function main() {
  const url = new URL(process.env.DATABASE_URL || 'http://invalid');
  assert(['localhost','127.0.0.1'].includes(url.hostname), 'Exact loopback database required');
  assert(['/ngcs_local_session_dev','/ngcs_week_planning_restore_test'].includes(url.pathname), 'Dedicated approved local target required');
  assert(process.env.NODE_ENV !== 'production', 'Production is excluded');
  const apply = process.argv.includes('--apply');
  if (apply) assert.equal(process.env.NGCS_APPLY_WEEK_PROGRAM,'true','Explicit process opt-in required');
  assert(process.env.NGCS_WEEK_ACTOR_EMAIL, 'Explicit existing actor required');
  const db = new PrismaService();
  try {
    const user = await db.user.findUniqueOrThrow({where:{email:process.env.NGCS_WEEK_ACTOR_EMAIL},select:{id:true,email:true,role:true,status:true,clubId:true}});
    assert.equal(user.role,'SYSTEM_ADMIN');assert.equal(user.status,'ACTIVE');
    const actor={...user,userId:user.id};
    const clubs=await db.club.findMany({where:{name:'Spor Manage'},select:{id:true}});assert.equal(clubs.length,1);
    const clubId=clubs[0].id;
    const seasons=await db.season.findMany({where:{clubId,name:'2026-2027'},include:{group:true},orderBy:{id:'asc'}});
    assert.equal(seasons.length,10);
    assert.deepEqual(seasons.map(s=>s.group.ageGroup).sort(),['SENIOR','U8','U9','U10','U11','U12','U13','U14','U15','U16'].sort());
    const service=new PlanningService(db), requestId='d2086f60-27b0-4fc3-8f45-bc1020261019';
    const saved=await service.status(actor,requestId);
    if(saved.state==='completed'){console.log(JSON.stringify({state:'unchanged-replay',teams:saved.teamCount,training:saved.trainingCount,meetings:saved.meetingCount,events:saved.eventCount}));return;}
    const fixtures=await db.match.findMany({where:{season:{clubId}},orderBy:{id:'asc'}});assert.equal(fixtures.length,36);
    assert(fixtures.some(m=>m.opponent==='Beşiktaş'&&m.date.toISOString()==='2026-10-25T13:00:00.000Z'));
    const users=await db.user.count();const people=await db.person.count({where:{clubId}});const grants=await db.roleCapability.count();
    const oldPlans=await db.trainingPlan.count({where:{clubId}}),oldPhases=await db.planDrill.count({where:{trainingPlan:{clubId}}});
    const program={weekStart:'2026-10-19',seasonIds:seasons.map(s=>s.id)};
    const preview=await service.preview(actor,program);assert.deepEqual(preview.conflicts,[]);
    const counts={teams:preview.teams.length,training:preview.teams.flatMap(t=>t.events).filter(e=>['TRAINING','RECOVERY','TACTICAL'].includes(e.kind)).length,meetings:preview.teams.flatMap(t=>t.events).filter(e=>e.kind==='TOPLANTI').length,events:preview.teams.flatMap(t=>t.events).length};
    assert.equal(counts.training,51);assert.equal(counts.meetings,13);
    if(!apply){console.log(JSON.stringify({state:'dry-run',...counts}));return;}
    const result=await service.apply(actor,{requestId,previewToken:preview.token,program});
    assert.deepEqual(await db.match.findMany({where:{season:{clubId}},orderBy:{id:'asc'}}),fixtures);
    assert.equal(await db.user.count(),users);assert.equal(await db.person.count({where:{clubId}}),people);assert.equal(await db.roleCapability.count(),grants);
    assert.equal(await db.trainingPlan.count({where:{clubId}}),oldPlans+51);
    assert.equal(await db.planDrill.count({where:{trainingPlan:{clubId}}}),oldPhases+204);
    const plans=await db.trainingPlan.findMany({where:{id:{in:result.planIds}},include:{drills:{include:{drill:true}},dayPlans:true}});
    for(const plan of plans){assert.equal(plan.drills.reduce((sum,p)=>sum+p.drill.durationMin,0),plan.totalDuration);assert.equal(plan.dayPlans.length,1);}
    console.log(JSON.stringify({state:result.state,...counts,preservedMatches:fixtures.length,phases:204}));
  } finally {await db.$disconnect();}
}
main().catch(()=>{console.error('LOCAL_WEEK_PROGRAM_FAILED');process.exitCode=1;});

const fs = require('fs');
const path = require('path');

const filePath = '/Users/celebigil/Dev/ngcs/apps/frontend/src/app/season-planner/[id]/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Unify filteredMatchesForCard logic
const matchesForCardOld = `      let matchesTeam = true;
      if (filters.teamFilter === 'A_TAKIM') {
        matchesTeam = match.group?.category === 'A_TAKIM' || 
                      match.group?.name.toLowerCase().includes('a takım') ||
                      match.group?.name.toLowerCase().includes('a takim') ||
                      !match.group;
      } else if (filters.teamFilter === 'GROUPS') {
        matchesTeam = (!!match.group && match.group.category !== 'A_TAKIM') || !match.group;
      }
      return matchesSearch && matchesTeam;`;

const matchesForCardNew = `      let matchesTeam = true;
      const isATeamMatch = !match.group || 
                           match.group.category === 'A_TAKIM' || 
                           match.group.name.toLowerCase().includes('a takım') || 
                           match.group.name.toLowerCase().includes('a takim');

      if (filters.teamFilter === 'A_TAKIM') {
        matchesTeam = isATeamMatch;
      } else if (filters.teamFilter === 'GROUPS') {
        matchesTeam = !isATeamMatch;
      }
      return matchesSearch && matchesTeam;`;

content = content.replace(matchesForCardOld, matchesForCardNew);

// 2. Unify filteredDayPlans logic
const dayPlansOld = `                        let matchesTeam = true;
                        if (filters.teamFilter === 'A_TAKIM') {
                          if (plan.trainingPlan?.group) {
                            matchesTeam = plan.trainingPlan.group.category === 'A_TAKIM' || 
                                          plan.trainingPlan.group.name.toLowerCase().includes('a takım');
                          } else if (plan.type === 'MATCH') {
                            matchesTeam = true; 
                          } else {
                            matchesTeam = false;
                          }
                        } else if (filters.teamFilter === 'GROUPS') {
                          if (plan.trainingPlan?.group) {
                            const isATeam = plan.trainingPlan.group.category === 'A_TAKIM' || 
                                            plan.trainingPlan.group.name.toLowerCase().includes('a takım');
                            matchesTeam = !isATeam;
                          } else if (plan.type === 'MATCH') {
                            matchesTeam = true;
                          } else {
                            matchesTeam = false;
                          }
                        }`;

const dayPlansNew = `                        let matchesTeam = true;
                        const groupPlan = plan.trainingPlan?.group;
                        const isATeamPlan = !groupPlan || 
                                        groupPlan.category === 'A_TAKIM' || 
                                        groupPlan.name.toLowerCase().includes('a takım') || 
                                        groupPlan.name.toLowerCase().includes('a takim');

                        if (filters.teamFilter === 'A_TAKIM') {
                          matchesTeam = isATeamPlan;
                        } else if (filters.teamFilter === 'GROUPS') {
                          matchesTeam = !isATeamPlan;
                        }`;

content = content.replace(dayPlansOld, dayPlansNew);

fs.writeFileSync(filePath, content);
console.log('File updated successfully');

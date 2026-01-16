const fs = require('fs');
const path = '/Users/celebigil/Dev/ngcs/apps/frontend/src/app/season-planner/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replacement 1: stats matches filter
const old1 = `    const filteredMatchesForStats = season.matches.filter(match => {
      let matchesTeam = true;
      if (filters.teamFilter === 'A_TAKIM') {
        matchesTeam = match.group?.category === 'A_TAKIM' || !match.group;
      } else if (filters.teamFilter === 'GROUPS') {
        matchesTeam = (!!match.group && match.group.category !== 'A_TAKIM') || !match.group;
      }
      return matchesTeam;
    });`;
const new1 = `    const filteredMatchesForStats = season.matches.filter(match => {
      let matchesTeam = true;
      const isATeam = !match.group || 
                      match.group.category === 'A_TAKIM' || 
                      match.group.name.toLowerCase().includes('a takım') || 
                      match.group.name.toLowerCase().includes('a takim');
                      
      if (filters.teamFilter === 'A_TAKIM') {
        matchesTeam = isATeam;
      } else if (filters.teamFilter === 'GROUPS') {
        matchesTeam = !isATeam;
      }
      return matchesTeam;
    });`;

// Replacement 2: stats dayPlans loop
const old2 = `        if (filters.teamFilter === 'A_TAKIM') {
          if (day.trainingPlan?.group) {
            matchesTeam = day.trainingPlan.group.category === 'A_TAKIM';
          } else if (day.type === 'MATCH') {
            matchesTeam = true;
          } else {
            matchesTeam = false;
          }
        } else if (filters.teamFilter === 'GROUPS') {
          if (day.trainingPlan?.group) {
            matchesTeam = day.trainingPlan.group.category !== 'A_TAKIM';
          } else if (day.type === 'MATCH') {
            matchesTeam = true;
          } else {
            matchesTeam = false;
          }
        }`;
const new2 = `        const group = day.trainingPlan?.group;
        const isATeam = !group || 
                        group.category === 'A_TAKIM' || 
                        group.name.toLowerCase().includes('a takım') || 
                        group.name.toLowerCase().includes('a takim');

        if (filters.teamFilter === 'A_TAKIM') {
          matchesTeam = isATeam;
        } else if (filters.teamFilter === 'GROUPS') {
          matchesTeam = !isATeam;
        }`;

// Replacement 3: filteredMatchesForCard
const old3 = `      if (filters.teamFilter === 'A_TAKIM') {
        matchesTeam = match.group?.category === 'A_TAKIM' || 
                      match.group?.name.toLowerCase().includes('a takım') ||
                      match.group?.name.toLowerCase().includes('a takim') ||
                      !match.group;
      } else if (filters.teamFilter === 'GROUPS') {
        matchesTeam = (!!match.group && match.group.category !== 'A_TAKIM') || !match.group;
      }`;
const new3 = `      const isATeam = !match.group || 
                      match.group.category === 'A_TAKIM' || 
                      match.group.name.toLowerCase().includes('a takım') || 
                      match.group.name.toLowerCase().includes('a takim');

      if (filters.teamFilter === 'A_TAKIM') {
        matchesTeam = isATeam;
      } else if (filters.teamFilter === 'GROUPS') {
        matchesTeam = !isATeam;
      }`;

// Replacement 4: filteredDayPlans in calendar
const old4 = `                        if (filters.teamFilter === 'A_TAKIM') {
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
const new4 = `                        const group = plan.trainingPlan?.group;
                        const isATeam = !group || 
                                        group.category === 'A_TAKIM' || 
                                        group.name.toLowerCase().includes('a takım') || 
                                        group.name.toLowerCase().includes('a takim');

                        if (filters.teamFilter === 'A_TAKIM') {
                          matchesTeam = isATeam;
                        } else if (filters.teamFilter === 'GROUPS') {
                          matchesTeam = !isATeam;
                        }`;

// Replacement 5: filteredDayMatches in calendar
const old5 = `                        if (filters.teamFilter === 'A_TAKIM') {
                          matchesTeam = match.group?.category === 'A_TAKIM' || 
                                        match.group?.name.toLowerCase().includes('a takım') || 
                                        !match.group;
                        } else if (filters.teamFilter === 'GROUPS') {
                          matchesTeam = (!!match.group && match.group.category !== 'A_TAKIM') || !match.group;
                        }`;
const new5 = `                        const isATeam = !match.group || 
                                          match.group.category === 'A_TAKIM' || 
                                          match.group.name.toLowerCase().includes('a takım') || 
                                          match.group.name.toLowerCase().includes('a takim');

                          if (filters.teamFilter === 'A_TAKIM') {
                            matchesTeam = isATeam;
                          } else if (filters.teamFilter === 'GROUPS') {
                            matchesTeam = !isATeam;
                          }`;

content = content.replace(old1, new1);
content = content.replace(old2, new2);
content = content.replace(old3, new3);
content = content.replace(old4, new4);
content = content.replace(old5, new5);

fs.writeFileSync(path, content);
console.log('Successfully updated page.tsx via surgical string replacement');

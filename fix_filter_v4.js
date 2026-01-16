const fs = require('fs');
const path = '/Users/celebigil/Dev/ngcs/apps/frontend/src/app/season-planner/[id]/page.tsx';
let c = fs.readFileSync(path, 'utf8');

const isATeamLogic = `!match.group || 
                      match.group.category === 'A_TAKIM' || 
                      match.group.name.toLowerCase().includes('a takım') || 
                      match.group.name.toLowerCase().includes('a takim')`;

const isATeamPlanLogic = `!group || 
                        group.category === 'A_TAKIM' || 
                        group.name.toLowerCase().includes('a takım') || 
                        group.name.toLowerCase().includes('a takim')`;

// Fix stats matches filter
c = c.replace(/if \(filters\.teamFilter === 'A_TAKIM'\) \{\s+matchesTeam = \(!match\.group \|\| match\.group\.category === "A_TAKIM" \|\| match\.group\.name\.toLowerCase\(\)\.includes\("a takım"\) \|\| match\.group\.name\.toLowerCase\(\)\.includes\("a takim"\)\);\s+\} else if \(filters\.teamFilter === 'GROUPS'\) \{\s+matchesTeam = \(!!match\.group && match\.group\.category !== 'A_TAKIM'\) \|\| !match\.group;\s+\}/, 
    `const isATeam = ${isATeamLogic};
      if (filters.teamFilter === 'A_TAKIM') {
        matchesTeam = isATeam;
      } else if (filters.teamFilter === 'GROUPS') {
        matchesTeam = !isATeam;
      }`);

// Fix stats dayPlans loop
c = c.replace(/if \(filters\.teamFilter === 'A_TAKIM'\) \{\s+if \(day\.trainingPlan\?\.group\) \{\s+matchesTeam = day\.trainingPlan\.group\.category === 'A_TAKIM';\s+\} else if \(day\.type === 'MATCH'\) \{\s+matchesTeam = true;\s+\} else \{\s+matchesTeam = false;\s+\}\s+\} else if \(filters\.teamFilter === 'GROUPS'\) \{\s+if \(day\.trainingPlan\?\.group\) \{\s+matchesTeam = day\.trainingPlan\.group\.category !== 'A_TAKIM';\s+\} else if \(day\.type === 'MATCH'\) \{\s+matchesTeam = true;\s+\} else \{\s+matchesTeam = false;\s+\}\s+\}/,
    `const group = day.trainingPlan?.group;
        const isATeam = ${isATeamPlanLogic};
        if (filters.teamFilter === 'A_TAKIM') {
          matchesTeam = isATeam;
        } else if (filters.teamFilter === 'GROUPS') {
          matchesTeam = !isATeam;
        }`);

// Fix filteredMatchesForCard
c = c.replace(/if \(filters\.teamFilter === 'A_TAKIM'\) \{\s+matchesTeam = match\.group\?\.category === 'A_TAKIM' \|\| \s+match\.group\?\.name\.toLowerCase\(\)\.includes\('a takım'\) \|\|\s+match\.group\?\.name\.toLowerCase\(\)\.includes\('a takim'\) \|\|\s+!match\.group;\s+\} else if \(filters\.teamFilter === 'GROUPS'\) \{\s+matchesTeam = \(!!match\.group && match\.group\.category !== 'A_TAKIM'\) \|\| !match\.group;\s+\}/,
    `const isATeam = ${isATeamLogic};
      if (filters.teamFilter === 'A_TAKIM') {
        matchesTeam = isATeam;
      } else if (filters.teamFilter === 'GROUPS') {
        matchesTeam = !isATeam;
      }`);

// Fix filteredDayPlans in calendar
c = c.replace(/if \(filters\.teamFilter === 'A_TAKIM'\) \{\s+if \(plan\.trainingPlan\?\.group\) \{\s+matchesTeam = plan\.trainingPlan\.group\.category === 'A_TAKIM' \|\| \s+plan\.trainingPlan\.group\.name\.toLowerCase\(\)\.includes\('a takım'\);\s+\} else if \(plan\.type === 'MATCH'\) \{\s+matchesTeam = true; \s+\} else \{\s+matchesTeam = false;\s+\}\s+\} else if \(filters\.teamFilter === 'GROUPS'\) \{\s+if \(plan\.trainingPlan\?\.group\) \{\s+const isATeam = plan\.trainingPlan\.group\.category === 'A_TAKIM' \|\| \s+plan\.trainingPlan\.group\.name\.toLowerCase\(\)\.includes\('a takım'\);\s+matchesTeam = !isATeam;\s+\} else if \(plan\.type === 'MATCH'\) \{\s+matchesTeam = true;\s+\} else \{\s+matchesTeam = false;\s+\}\s+\}/,
    `const groupPlan = plan.trainingPlan?.group;
                        const isATeamPlan = !groupPlan || 
                                        groupPlan.category === 'A_TAKIM' || 
                                        groupPlan.name.toLowerCase().includes('a takım') || 
                                        groupPlan.name.toLowerCase().includes('a takim');
                        if (filters.teamFilter === 'A_TAKIM') {
                          matchesTeam = isATeamPlan;
                        } else if (filters.teamFilter === 'GROUPS') {
                          matchesTeam = !isATeamPlan;
                        }`);

// Fix filteredDayMatches in calendar
c = c.replace(/if \(filters\.teamFilter === 'A_TAKIM'\) \{\s+matchesTeam = match\.group\?\.category === 'A_TAKIM' \|\| \s+match\.group\?\.name\.toLowerCase\(\)\.includes\('a takım'\) \|\|\s+!match\.group;\s+\} else if \(filters\.teamFilter === 'GROUPS'\) \{\s+matchesTeam = \(!!match\.group && match\.group\.category !== 'A_TAKIM'\) \|\| !match\.group;\s+\}/,
    `const isATeamMatch = ${isATeamLogic.replace(/match/g, 'match')};
                          if (filters.teamFilter === 'A_TAKIM') {
                            matchesTeam = isATeamMatch;
                          } else if (filters.teamFilter === 'GROUPS') {
                            matchesTeam = !isATeamMatch;
                          }`);

fs.writeFileSync(path, c);
console.log('Finished');

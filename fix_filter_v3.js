const fs = require('fs');
const path = '/Users/celebigil/Dev/ngcs/apps/frontend/src/app/season-planner/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const replacements = [
    {
        name: 'stats matches filter',
        regex: /const filteredMatchesForStats = season\.matches\.filter\(match => \{\s+let matchesTeam = true;\s+if \(filters\.teamFilter === 'A_TAKIM'\) \{\s+matchesTeam = match\.group\?\.category === 'A_TAKIM' \|\| !match\.group;\s+\} else if \(filters\.teamFilter === 'GROUPS'\) \{\s+matchesTeam = \(!!match\.group && match\.group\.category !== 'A_TAKIM'\) \|\| !match\.group;\s+\}\s+return matchesTeam;\s+\}\);/,
        newText: `const filteredMatchesForStats = season.matches.filter(match => {
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
    });`
    },
    {
        name: 'stats dayPlans loop',
        regex: /if \(filters\.teamFilter === 'A_TAKIM'\) \{\s+if \(day\.trainingPlan\?\.group\) \{\s+matchesTeam = day\.trainingPlan\.group\.category === 'A_TAKIM';\s+\} else if \(day\.type === 'MATCH'\) \{\s+matchesTeam = true;\s+\} else \{\s+matchesTeam = false;\s+\}\s+\} else if \(filters\.teamFilter === 'GROUPS'\) \{\s+if \(day\.trainingPlan\?\.group\) \{\s+matchesTeam = day\.trainingPlan\.group\.category !== 'A_TAKIM';\s+\} else if \(day\.type === 'MATCH'\) \{\s+matchesTeam = true;\s+\} else \{\s+matchesTeam = false;\s+\}\s+\}/,
        newText: `const group = day.trainingPlan?.group;
        const isATeam = !group || 
                        group.category === 'A_TAKIM' || 
                        group.name.toLowerCase().includes('a takım') || 
                        group.name.toLowerCase().includes('a takim');

        if (filters.teamFilter === 'A_TAKIM') {
          matchesTeam = isATeam;
        } else if (filters.teamFilter === 'GROUPS') {
          matchesTeam = !isATeam;
        }`
    },
    {
        name: 'filteredMatchesForCard',
        regex: /if \(filters\.teamFilter === 'A_TAKIM'\) \{\s+matchesTeam = match\.group\?\.category === 'A_TAKIM' \|\|\s+match\.group\?\.name\.toLowerCase\(\)\.includes\('a takım'\) \|\|\s+(match\.group\?\.name\.toLowerCase\(\)\.includes\('a takim'\) \|\|\s+)?!match\.group;\s+\} else if \(filters\.teamFilter === 'GROUPS'\) \{\s+matchesTeam = \(!!match\.group && match\.group\.category !== 'A_TAKIM'\) \|\| !match\.group;\s+\}/,
        newText: `const isATeam = !match.group || 
                      match.group.category === 'A_TAKIM' || 
                      match.group.name.toLowerCase().includes('a takım') || 
                      match.group.name.toLowerCase().includes('a takim');

      if (filters.teamFilter === 'A_TAKIM') {
        matchesTeam = isATeam;
      } else if (filters.teamFilter === 'GROUPS') {
        matchesTeam = !isATeam;
      }`
    },
    {
        name: 'filteredDayPlans',
        regex: /if \(filters\.teamFilter === 'A_TAKIM'\) \{\s+if \(plan\.trainingPlan\?\.group\) \{\s+matchesTeam = plan\.trainingPlan\.group\.category === 'A_TAKIM' \|\|\s+plan\.trainingPlan\.group\.name\.toLowerCase\(\)\.includes\('a takım'\);\s+\} else if \(plan\.type === 'MATCH'\) \{\s+matchesTeam = true;\s+\} else \{\s+matchesTeam = false;\s+\}\s+\} else if \(filters\.teamFilter === 'GROUPS'\) \{\s+if \(plan\.trainingPlan\?\.group\) \{\s+const isATeam = plan\.trainingPlan\.group\.category === 'A_TAKIM' \|\|\s+plan\.trainingPlan\.group\.name\.toLowerCase\(\)\.includes\('a takım'\);\s+matchesTeam = !isATeam;\s+\} else if \(plan\.type === 'MATCH'\) \{\s+matchesTeam = true;\s+\} else \{\s+matchesTeam = false;\s+\}\s+\}/,
        newText: `const groupPlan = plan.trainingPlan?.group;
                        const isATeamPlan = !groupPlan || 
                                        groupPlan.category === 'A_TAKIM' || 
                                        groupPlan.name.toLowerCase().includes('a takım') || 
                                        groupPlan.name.toLowerCase().includes('a takim');

                        if (filters.teamFilter === 'A_TAKIM') {
                          matchesTeam = isATeamPlan;
                        } else if (filters.teamFilter === 'GROUPS') {
                          matchesTeam = !isATeamPlan;
                        }`
    },
    {
        name: 'filteredDayMatches',
        regex: /if \(filters\.teamFilter === 'A_TAKIM'\) \{\s+matchesTeam = match\.group\?\.category === 'A_TAKIM' \|\|\s+match\.group\?\.name\.toLowerCase\(\)\.includes\('a takım'\) \|\|\s+!match\.group;\s+\} else if \(filters\.teamFilter === 'GROUPS'\) \{\s+matchesTeam = \(!!match\.group && match\.group\.category !== 'A_TAKIM'\) \|\| !match\.group;\s+\}/,
        newText: `const isATeamMatch = !match.group || 
                                          match.group.category === 'A_TAKIM' || 
                                          match.group.name.toLowerCase().includes('a takım') || 
                                          match.group.name.toLowerCase().includes('a takim');

                          if (filters.teamFilter === 'A_TAKIM') {
                            matchesTeam = isATeamMatch;
                          } else if (filters.teamFilter === 'GROUPS') {
                            matchesTeam = !isATeamMatch;
                          }`
    }
];

replacements.forEach(r => {
    if (r.regex.test(content)) {
        content = content.replace(r.regex, r.newText);
        console.log(`Updated ${r.name}`);
    } else {
        console.log(`Could not find ${r.name}`);
    }
});

fs.writeFileSync(path, content);
console.log('Finished processing.');

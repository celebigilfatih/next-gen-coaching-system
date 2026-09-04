const fs = require('fs');
const path = '/Users/celebigil/Dev/ngcs/apps/frontend/src/app/season-planner/[id]/page.tsx';
let c = fs.readFileSync(path, 'utf8');

const oldStr = `                        if (filters.teamFilter === 'A_TAKIM') {
                          matchesTeam = match.group?.category === 'A_TAKIM' || 
                                        match.group?.name.toLowerCase().includes('a takım') ||
                                        !match.group;
                        } else if (filters.teamFilter === 'GROUPS') {
                          matchesTeam = (!!match.group && match.group.category !== 'A_TAKIM') || !match.group;
                        }`;

const newStr = `const isATeamMatch = !match.group || 
                                          match.group.category === 'A_TAKIM' || 
                                          match.group.name.toLowerCase().includes('a takım') || 
                                          match.group.name.toLowerCase().includes('a takim');

                          if (filters.teamFilter === 'A_TAKIM') {
                            matchesTeam = isATeamMatch;
                          } else if (filters.teamFilter === 'GROUPS') {
                            matchesTeam = !isATeamMatch;
                          }`;

if (c.includes(oldStr)) {
    c = c.replace(oldStr, newStr);
    fs.writeFileSync(path, c);
    console.log('Successfully updated page.tsx');
} else {
    console.log('Could not find exact string match');
    // Try a more flexible replacement if exact fails
    const regex = /if \(filters\.teamFilter === 'A_TAKIM'\) \{\s+matchesTeam = match\.group\?\.category === 'A_TAKIM' \|\| \s+match\.group\?\.name\.toLowerCase\(\)\.includes\('a takım'\) \|\|\s+!match\.group;\s+\} else if \(filters\.teamFilter === 'GROUPS'\) \{\s+matchesTeam = \(!!match\.group && match\.group\.category !== 'A_TAKIM'\) \|\| !match\.group;\s+\}/;
    if (regex.test(c)) {
        c = c.replace(regex, newStr);
        fs.writeFileSync(path, c);
        console.log('Successfully updated page.tsx via regex');
    } else {
        console.log('Regex also failed');
    }
}

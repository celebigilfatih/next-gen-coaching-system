async function testAnalytics() {
  try {
    const API_URL = 'http://localhost:9001';
    
    console.log('--- Logging in ---');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@ngcs.com',
        password: 'admin123'
      })
    });
    const loginData = await loginRes.json();
    const token = loginData.access_token;
    if (!token) {
        console.error('Login failed, no token returned:', loginData);
        return;
    }
    console.log('Logged in successfully');

    const headers = { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 1. Fetch Groups and Players
    console.log('\n--- Fetching Groups ---');
    const groupsRes = await fetch(`${API_URL}/groups`, { headers });
    const groups = await groupsRes.json();
    console.log(`Found ${groups.length} groups`);
    
    if (groups.length > 0) {
      const groupId = groups[0].id;
      console.log(`\n--- Fetching Players for Group ${groupId} ---`);
      const membersRes = await fetch(`${API_URL}/groups/${groupId}/members`, { headers });
      const members = await membersRes.json();
      const players = members.map(m => m.user).filter(u => u && u.role === 'PLAYER');
      console.log(`Found ${players.length} players`);

      if (players.length > 0) {
        const playerId = players[0].id;
        console.log(`\n--- Creating Internal Analysis for Player ${players[0].name} ---`);
        const internalData = {
          playerId: playerId,
          analysisType: 'INTERNAL',
          date: new Date().toISOString(),
          speed: 80,
          technique: 75,
          rating: 7.8,
          notes: 'Test internal analysis'
        };
        const createInternalRes = await fetch(`${API_URL}/analytics/player-performance`, {
          method: 'POST',
          headers,
          body: JSON.stringify(internalData)
        });
        const createdInternal = await createInternalRes.json();
        console.log('Internal analysis created:', createdInternal.id);
      } else {
        console.log('No players found in the first group. Skipping internal analysis test.');
      }
    } else {
        console.log('No groups found. Skipping group-based tests.');
    }

    // 2. Create External Scouting Report
    console.log('\n--- Creating External Scouting Report ---');
    const externalData = {
      externalPlayerName: 'External Player Test',
      externalPlayerTeam: 'Test FC',
      externalPlayerPosition: 'FORVET',
      analysisType: 'EXTERNAL',
      date: new Date().toISOString(),
      speed: 90,
      technique: 85,
      rating: 8.5,
      notes: 'Test external scouting report'
    };
    const createExternalRes = await fetch(`${API_URL}/analytics/player-performance`, {
      method: 'POST',
      headers,
      body: JSON.stringify(externalData)
    });
    const createdExternal = await createExternalRes.json();
    console.log('External analysis created:', createdExternal.id);

    // 3. Fetch all and verify
    console.log('\n--- Fetching All Performances ---');
    const allRes = await fetch(`${API_URL}/analytics/player-performance`, { headers });
    const performances = await allRes.json();
    console.log(`Total performances: ${performances.length}`);
    
    const internal = performances.find(p => p.analysisType === 'INTERNAL' && p.notes === 'Test internal analysis');
    const external = performances.find(p => p.analysisType === 'EXTERNAL' && p.externalPlayerName === 'External Player Test');
    
    console.log('\nVerification Results:');
    console.log('Internal Record Found:', !!internal);
    if (internal) console.log('Internal Player Name:', internal.player?.name);
    
    console.log('External Record Found:', !!external);
    if (external) {
        console.log('External Player Name:', external.externalPlayerName);
        console.log('External Player Team:', external.externalPlayerTeam);
        console.log('External Player Position:', external.externalPlayerPosition);
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testAnalytics();

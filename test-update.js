async function testUpdate() {
  try {
    const API_URL = 'http://localhost:9001';
    
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@ngcs.com', password: 'admin123' })
    });
    const { access_token: token } = await loginRes.json();
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    const allRes = await fetch(`${API_URL}/analytics/player-performance`, { headers });
    const performances = await allRes.json();
    const external = performances.find(p => p.analysisType === 'EXTERNAL' && p.externalPlayerName === 'External Player Test');

    if (external) {
        console.log(`\n--- Updating External Analysis ${external.id} ---`);
        const updateData = { ...external, notes: 'Updated notes for external player' };
        const updateRes = await fetch(`${API_URL}/analytics/player-performance/${external.id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(updateData)
        });
        const updated = await updateRes.json();
        console.log('Update result:', updated.notes === 'Updated notes for external player' ? 'SUCCESS' : 'FAILED');
    }

  } catch (error) {
    console.error('Update test failed:', error.message);
  }
}

testUpdate();

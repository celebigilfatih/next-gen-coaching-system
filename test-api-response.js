async function testApiResponse() {
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
      console.error('Login failed:', loginData);
      return;
    }

    const headers = { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log('\n--- Fetching Player Performances ---');
    const res = await fetch(`${API_URL}/analytics/player-performance`, { headers });
    const data = await res.json();
    
    console.log(`Total records received: ${data.length}`);
    data.forEach((p, i) => {
      console.log(`[${i}] ID: ${p.id}, Type: ${p.analysisType}, Name: ${p.analysisType === 'EXTERNAL' ? p.externalPlayerName : p.player?.name}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testApiResponse();

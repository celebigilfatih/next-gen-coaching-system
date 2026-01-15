async function addExamplePlayers() {
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

    const players = [
      {
        externalPlayerName: 'Arda Güler',
        externalPlayerTeam: 'Real Madrid',
        externalPlayerPosition: 'ORTA_SAHA',
        analysisType: 'EXTERNAL',
        date: new Date().toISOString(),
        speed: 85,
        technique: 92,
        endurance: 78,
        tactical: 88,
        form: 80,
        rating: 9.0,
        notes: 'Gelecek vaat eden yüksek teknik kapasiteli bir oyuncu. Oyun görüşü ve pas kalitesi elit seviyede.'
      },
      {
        externalPlayerName: 'Kenan Yıldız',
        externalPlayerTeam: 'Juventus',
        externalPlayerPosition: 'FORVET',
        analysisType: 'EXTERNAL',
        date: new Date().toISOString(),
        speed: 88,
        technique: 86,
        endurance: 82,
        tactical: 84,
        form: 85,
        rating: 8.8,
        notes: 'Dripling yeteneği ve patlayıcı gücü ile fark yaratıyor. Son vuruşlarda soğukkanlı.'
      }
    ];

    console.log('\n--- Adding Example Players ---');
    for (const player of players) {
      const res = await fetch(`${API_URL}/analytics/player-performance`, {
        method: 'POST',
        headers,
        body: JSON.stringify(player)
      });
      const data = await res.json();
      console.log(`Added: ${player.externalPlayerName} (${data.id})`);
    }

    console.log('\nDone!');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

addExamplePlayers();

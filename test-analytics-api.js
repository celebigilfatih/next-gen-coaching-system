async function checkAnalytics() {
  const apiUrl = 'http://localhost:3000'; // Default backend port
  try {
    const res = await fetch(`${apiUrl}/analytics/player-performance`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    console.log('Player Performances Count:', data.length);
    if (data.length > 0) {
      console.log('Sample Performance:', JSON.stringify(data[0], null, 2));
    }
  } catch (error) {
    console.error('Error fetching analytics:', error.message);
  }
}

checkAnalytics();

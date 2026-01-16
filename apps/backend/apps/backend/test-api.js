const axios = require('axios');
async function test() {
  try {
    const res = await axios.get('http://localhost:9000/seasons/cmkdvnkaa000oqd01rj8ylu4a');
    const season = res.data;
    console.log('Matches:', season.matches.length);
    if (season.matches.length > 0) {
      console.log('First match group:', JSON.stringify(season.matches[0].group, null, 2));
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
}
test();

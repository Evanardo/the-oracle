const https = require('https');
const IGDB_CLIENT_ID = 'f1pxzxrb2e1elgcf9t129qyb2ruzt3';
const IGDB_ACCESS_TOKEN = 'kkzfrkani8ulbb2qbycrca5tam4kub';

// Generate 150 random IDs
const ids = Array.from({length: 150}, (_, i) => i + 1000);

const req1 = https.request('https://api.igdb.com/v4/games', {
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'text/plain',
    'Client-ID': IGDB_CLIENT_ID,
    'Authorization': `Bearer ${IGDB_ACCESS_TOKEN}`,
  }
}, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => console.log('Syntax 1:', res.statusCode));
});
req1.write(`fields name; where rating > 80 & rating_count > 100 & cover != null & id != (${ids.join(',')}); sort rating_count desc; limit 25;`);
req1.end();

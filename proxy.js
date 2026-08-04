const http = require('http');
const https = require('https');

require('dotenv').config();

const PORT = 3001;
const IGDB_CLIENT_ID = process.env.IGDB_CLIENT_ID;
const IGDB_ACCESS_TOKEN = process.env.IGDB_ACCESS_TOKEN;

const server = http.createServer((req, res) => {
  // Allow browser CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Client-ID, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    const defaultQuery = `
      fields name, summary, rating, rating_count, first_release_date, cover.image_id, genres.name, platforms.name, game_modes.name, themes.name, player_perspectives.name, involved_companies.company.name, involved_companies.developer, similar_games.name; 
      where rating > 80 & rating_count > 100 & cover != null; 
      sort rating_count desc; 
      limit 25;
    `;

    const igdbReq = https.request('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'text/plain',
        'Client-ID': IGDB_CLIENT_ID,
        'Authorization': `Bearer ${IGDB_ACCESS_TOKEN}`,
      }
    }, (igdbRes) => {
      res.writeHead(igdbRes.statusCode, { 'Content-Type': 'application/json' });
      igdbRes.pipe(res);
    });

    igdbReq.on('error', (err) => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    });

    igdbReq.write(body || defaultQuery);
    igdbReq.end();
  });
});

// Bind to 0.0.0.0 so local network devices (e.g. Mobile Safari on Wi-Fi) can access http://<IP>:3001
server.listen(PORT, '0.0.0.0', () => {
  console.log(`[IGDB Proxy] Running on http://0.0.0.0:${PORT}`);
});

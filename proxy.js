require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

// 1. Security Headers configured for Cross-Origin API access
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: false,
}));

// 2. CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept']
}));

// 3. Rate Limiting (Generous for development and search indexing)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // Generous limit for search queries
  standardHeaders: true, 
  legacyHeaders: false, 
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/', apiLimiter);

// 4. Body parser for text (IGDB queries are plain text)
app.use(express.text({ type: '*/*' }));

// 5. Proxy Route
app.post('/', async (req, res) => {
  const IGDB_CLIENT_ID = process.env.IGDB_CLIENT_ID;
  const IGDB_ACCESS_TOKEN = process.env.IGDB_ACCESS_TOKEN;

  if (!IGDB_CLIENT_ID || !IGDB_ACCESS_TOKEN) {
    return res.status(500).json({ error: 'Server configuration error: Missing IGDB credentials.' });
  }

  const defaultQuery = `
    fields name, summary, rating, rating_count, first_release_date, cover.image_id, genres.name, platforms.name, game_modes.name, themes.name, player_perspectives.name, involved_companies.company.name, involved_companies.developer, similar_games.name; 
    where rating > 80 & rating_count > 100 & cover != null; 
    sort rating_count desc; 
    limit 25;
  `;

  const bodyQuery = req.body || defaultQuery;
  console.log(`[${new Date().toISOString()}] Received request from ${req.ip} with body:`, bodyQuery.substring(0, 50) + '...');

  try {
    const response = await axios({
      method: 'post',
      url: 'https://api.igdb.com/v4/games',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'text/plain',
        'Client-ID': IGDB_CLIENT_ID,
        'Authorization': `Bearer ${IGDB_ACCESS_TOKEN}`,
      },
      data: bodyQuery
    });
    
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('[IGDB Proxy Error]:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Failed to communicate with IGDB API.' });
    }
  }
});

// Bind to 0.0.0.0 so local network devices can access it
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[IGDB Proxy] Secure Express Server running on http://0.0.0.0:${PORT}`);
});

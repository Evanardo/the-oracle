import { VIBES } from '../utils/constants';

const fetchWithTimeout = async (url, options = {}, timeoutMs = 3000) => {
  if (typeof AbortController === 'undefined') {
    return fetch(url, options);
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
};

const mapIGDBToAppFormat = (igdbGame) => {
  const developerObj = igdbGame.involved_companies?.find(c => c.developer);
  const developer = developerObj?.company?.name || 'Unknown Developer';
  
  const tags = igdbGame.genres?.slice(0, 2).map(g => g.name).join(' • ') || 'Uncategorized';
  
  const ratingScore = igdbGame.rating ? Math.round(igdbGame.rating) : null;
  
  const releaseYear = igdbGame.first_release_date 
    ? new Date(igdbGame.first_release_date * 1000).getFullYear()
    : null;

  const platformList = igdbGame.platforms?.map(p => {
    let n = p.name;
    if (n.includes('PC')) return 'PC';
    if (n.includes('PlayStation 5')) return 'PS5';
    if (n.includes('PlayStation 4')) return 'PS4';
    if (n.includes('Nintendo Switch')) return 'Switch';
    if (n.includes('Xbox Series')) return 'Xbox Series X';
    if (n.includes('Xbox One')) return 'Xbox One';
    return n;
  });
  const platforms = platformList ? Array.from(new Set(platformList)).slice(0, 3).join(' • ') : 'Console / PC';

  const similarGames = igdbGame.similar_games?.slice(0, 3).map(s => s.name).join(' • ') || null;
  const gameModes = igdbGame.game_modes?.slice(0, 2).map(m => m.name).join(' • ') || 'Single Player';
  const perspective = igdbGame.player_perspectives?.map(p => p.name).join(', ') || 'Standard';

  const coverUrl = igdbGame.cover?.image_id 
    ? `https://images.igdb.com/igdb/image/upload/t_720p/${igdbGame.cover.image_id}.jpg` 
    : null;

  let screenshots = igdbGame.screenshots
    ? igdbGame.screenshots.map(s => `https://images.igdb.com/igdb/image/upload/t_720p/${s.image_id}.jpg`)
    : [];
    
  if (screenshots.length === 0 && coverUrl) {
    screenshots = [coverUrl];
  }

  return {
    id: igdbGame.id ? igdbGame.id.toString() : Math.random().toString(),
    title: igdbGame.name || 'Untitled Game',
    developer,
    releaseYear,
    ratingScore,
    platforms,
    similarGames,
    gameModes,
    perspective,
    tags,
    vibe: VIBES[Math.floor(Math.random() * VIBES.length)],
    time: 'Flexible', 
    isPauseable: true,
    description: igdbGame.summary || 'No description available.',
    coverUrl,
    screenshots
  };
};

export const fetchGamesFromIGDB = async (filterMode, library) => {
  const currentHost = (typeof window !== 'undefined' && window.location?.hostname) 
    ? window.location.hostname 
    : 'localhost';

  const endpoints = [
    `http://${currentHost}:3001`,
    'http://localhost:3001'
  ];

  const savedIds = (library || [])
    .map(g => g.id)
    .filter(id => id && /^\d+$/.test(id)); 
    
  const excludeClause = savedIds.length > 0 ? ` & id != (${savedIds.join(',')})` : '';

  const bodyQuery = filterMode === 'popular'
    ? `fields name, summary, rating, rating_count, first_release_date, cover.image_id, screenshots.image_id, genres.name, platforms.name, game_modes.name, themes.name, player_perspectives.name, involved_companies.company.name, involved_companies.developer, similar_games.name; where rating > 80 & rating_count > 100 & cover != null${excludeClause}; sort rating_count desc; limit 25;`
    : `fields name, summary, rating, rating_count, first_release_date, cover.image_id, screenshots.image_id, genres.name, platforms.name, game_modes.name, themes.name, player_perspectives.name, involved_companies.company.name, involved_companies.developer, similar_games.name; where rating > 80 & rating_count > 15 & cover != null${excludeClause}; sort rating desc; limit 25;`;

  let successData = null;

  for (const url of endpoints) {
    try {
      const response = await fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'text/plain'
        },
        body: bodyQuery
      }, 3000);

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0 && data[0]?.id) {
          successData = data;
          break;
        }
      }
    } catch (err) {
      // Continue to next endpoint option
    }
  }

  if (successData) {
    const libraryIdSet = new Set((library || []).map(g => g.id));
    const formattedGames = successData
      .map(mapIGDBToAppFormat)
      .filter(game => !libraryIdSet.has(game.id));
    return { data: formattedGames, error: false };
  } else {
    return { data: [], error: true };
  }
};

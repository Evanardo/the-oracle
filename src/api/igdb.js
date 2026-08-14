import Constants from 'expo-constants';
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

const determineVibe = (igdbGame) => {
  try {
    const genres = (igdbGame?.genres || []).map(g => (g?.name || '').toLowerCase()).filter(Boolean);
    const themes = (igdbGame?.themes || []).map(t => (t?.name || '').toLowerCase()).filter(Boolean);
    
    const has = (arr, keywords) => keywords.some(k => arr.some(item => item.includes(k)));

    // Dark
    if (has(genres, ['horror']) || has(themes, ['horror'])) return 'Dark';
    // Relaxing
    if (has(genres, ['simulator', 'puzzle', 'music', 'casual']) || has(themes, ['educational', 'kids'])) return 'Relaxing';
    // Sweaty
    if (has(genres, ['moba', 'fighting', 'sport']) || has(themes, ['competitive', 'esports'])) return 'Sweaty';
    // Strategic
    if (has(genres, ['strategy', 'tactical', 'turn-based', 'card', 'board', 'rts'])) return 'Strategic';
    // Narrative
    if (has(genres, ['role-playing', 'rpg', 'point-and-click', 'visual novel']) || has(themes, ['mystery', 'drama'])) return 'Narrative';
    // Brain-Off
    if (has(genres, ['platform', 'arcade', 'pinball', 'racing'])) return 'Brain-Off';
    // Intense (Action default)
    if (has(genres, ['shooter', 'hack and slash', 'action'])) return 'Intense';

    return 'Narrative';
  } catch (e) {
    return 'Narrative';
  }
};

const determineIsPauseable = (igdbGame) => {
  try {
    const name = (igdbGame?.name || '').toLowerCase();
    
    // Souls-like games notoriously don't have a pause menu
    const unpauseableFranchises = ['dark souls', 'bloodborne', 'elden ring', 'sekiro', "demon's souls", 'nioh', 'lies of p'];
    if (unpauseableFranchises.some(f => name.includes(f))) {
      return false;
    }
    
    // Check if it's strictly multiplayer/MMO
    const modes = (igdbGame?.game_modes || []).map(m => (m?.name || '').toLowerCase()).filter(Boolean);
    if (modes.includes('massively multiplayer online (mmo)') || 
       (modes.includes('multiplayer') && !modes.includes('single player'))) {
      return false;
    }
    
    return true;
  } catch (e) {
    return true;
  }
};

const mapIGDBToAppFormat = (igdbGame) => {
  try {
    if (!igdbGame) return null;
    const developerObj = (igdbGame.involved_companies || []).find(c => c?.developer);
    const developer = developerObj?.company?.name || 'Unknown Developer';
    
    const tags = (igdbGame.genres || [])
      .slice(0, 2)
      .map(g => g?.name)
      .filter(Boolean)
      .join(' • ') || 'Uncategorized';
    
    const ratingScore = (typeof igdbGame.rating === 'number' && !isNaN(igdbGame.rating))
      ? Math.round(igdbGame.rating)
      : null;
    
    const releaseYear = igdbGame.first_release_date 
      ? new Date(igdbGame.first_release_date * 1000).getFullYear()
      : null;

    const platformList = (igdbGame.platforms || [])
      .map(p => {
        const n = p?.name;
        if (!n || typeof n !== 'string') return null;
        if (n.includes('PC')) return 'PC';
        if (n.includes('PlayStation 5')) return 'PS5';
        if (n.includes('PlayStation 4')) return 'PS4';
        if (n.includes('Nintendo Switch')) return 'Switch';
        if (n.includes('Xbox Series')) return 'Xbox Series X';
        if (n.includes('Xbox One')) return 'Xbox One';
        return n;
      })
      .filter(Boolean);

    const platforms = platformList.length > 0
      ? Array.from(new Set(platformList)).slice(0, 3).join(' • ')
      : 'Console / PC';

    const similarGames = (igdbGame.similar_games || [])
      .slice(0, 3)
      .map(s => s?.name)
      .filter(Boolean)
      .join(' • ') || null;

    const gameModes = (igdbGame.game_modes || [])
      .slice(0, 2)
      .map(m => m?.name)
      .filter(Boolean)
      .join(' • ') || 'Single Player';

    const perspective = (igdbGame.player_perspectives || [])
      .map(p => p?.name)
      .filter(Boolean)
      .join(', ') || 'Standard';

    const coverUrl = igdbGame.cover?.image_id 
      ? `https://images.igdb.com/igdb/image/upload/t_720p/${igdbGame.cover.image_id}.jpg` 
      : null;

    let screenshots = (igdbGame.screenshots || [])
      .filter(s => s?.image_id)
      .map(s => `https://images.igdb.com/igdb/image/upload/t_720p/${s.image_id}.jpg`);
      
    if (screenshots.length === 0 && coverUrl) {
      screenshots = [coverUrl];
    }

    return {
      id: igdbGame.id ? String(igdbGame.id) : Math.random().toString(),
      title: igdbGame.name || 'Untitled Game',
      developer,
      releaseYear: isNaN(releaseYear) ? null : releaseYear,
      ratingScore,
      platforms,
      similarGames,
      gameModes,
      perspective,
      tags,
      vibe: determineVibe(igdbGame),
      time: 'Flexible', 
      isPauseable: determineIsPauseable(igdbGame),
      description: igdbGame.summary || 'No description available.',
      coverUrl,
      screenshots
    };
  } catch (err) {
    console.error('[mapIGDBToAppFormat error]:', err);
    return {
      id: igdbGame?.id ? String(igdbGame.id) : Math.random().toString(),
      title: igdbGame?.name || 'Untitled Game',
      developer: 'Unknown Developer',
      releaseYear: null,
      ratingScore: null,
      platforms: 'Console / PC',
      similarGames: null,
      gameModes: 'Single Player',
      perspective: 'Standard',
      tags: 'Uncategorized',
      vibe: 'Narrative',
      time: 'Flexible',
      isPauseable: true,
      description: igdbGame?.summary || 'No description available.',
      coverUrl: null,
      screenshots: []
    };
  }
};

const getProxyEndpoints = () => {
  if (process.env.EXPO_PUBLIC_PROXY_URL) {
    return [process.env.EXPO_PUBLIC_PROXY_URL];
  }

  const endpoints = [];
  if (typeof window !== 'undefined' && window.location?.hostname) {
    endpoints.push(`http://${window.location.hostname}:3001`);
  }
  if (Constants.expoConfig?.hostUri) {
    const host = Constants.expoConfig.hostUri.split(':')[0];
    endpoints.push(`http://${host}:3001`);
  }
  endpoints.push('http://localhost:3001');
  endpoints.push('http://127.0.0.1:3001');

  return Array.from(new Set(endpoints));
};

export const fetchGamesFromIGDB = async (filterMode, library) => {
  const endpoints = getProxyEndpoints();

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

export const searchGamesFromIGDB = async (query) => {
  const endpoints = getProxyEndpoints();

  const safeQuery = (query || '').replace(/["\\]/g, '').trim();
  if (!safeQuery) {
    return { data: [], error: false };
  }

  const bodyQuery = `search "${safeQuery}"; fields name, summary, rating, rating_count, first_release_date, cover.image_id, screenshots.image_id, genres.name, platforms.name, game_modes.name, themes.name, player_perspectives.name, involved_companies.company.name, involved_companies.developer, similar_games.name; limit 25;`;

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
      }, 8000);

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          successData = data;
          break;
        }
      }
    } catch (err) {
      console.warn(`[IGDB Search proxy error at ${url}]:`, err?.message || err);
    }
  }

  if (successData) {
    const formattedGames = successData.map(mapIGDBToAppFormat);
    return { data: formattedGames, error: false };
  } else {
    return { data: [], error: true };
  }
};

import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  Animated, 
  PanResponder, 
  Dimensions,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  ActivityIndicator
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// ==========================================
// IGDB API CONFIGURATION
// Paste your Twitch credentials here for the MVP
// ==========================================
const IGDB_CLIENT_ID = 'f1pxzxrb2e1elgcf9t129qyb2ruzt3';
const IGDB_ACCESS_TOKEN = 'kkzfrkani8ulbb2qbycrca5tam4kub';

const Tab = createBottomTabNavigator();

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SWIPE_THRESHOLD = 100;
const SWIPE_OUT_DURATION = 250;
const VIBES = ['Relaxing', 'Intense', 'Sweaty', 'Brain-Off'];

// Curated fallback games deck used as a bulletproof safety net if network/proxy is unreachable
const FALLBACK_GAMES = [
  {
    id: 'fb-1',
    title: 'Elden Ring',
    developer: 'FromSoftware',
    tags: 'Action • RPG',
    vibe: 'Intense',
    time: '60+ hrs',
    isPauseable: false,
    description: 'THE CRITICALLY ACCLAIMED FANTASY ACTION RPG. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between.',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_720p/co4jni.jpg'
  },
  {
    id: 'fb-2',
    title: 'The Legend of Zelda: Tears of the Kingdom',
    developer: 'Nintendo',
    tags: 'Adventure • Action',
    vibe: 'Relaxing',
    time: '50+ hrs',
    isPauseable: true,
    description: 'An epic adventure across the land and skies of Hyrule awaits in The Legend of Zelda: Tears of the Kingdom.',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_720p/co5vzv.jpg'
  },
  {
    id: 'fb-3',
    title: 'Hades II',
    developer: 'Supergiant Games',
    tags: 'Roguelike • Action',
    vibe: 'Sweaty',
    time: '30+ hrs',
    isPauseable: true,
    description: 'Battle beyond the Underworld using dark sorcery to take on the Titan of Time.',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_720p/co5xar.jpg'
  },
  {
    id: 'fb-4',
    title: 'Baldur\'s Gate 3',
    developer: 'Larian Studios',
    tags: 'RPG • Strategy',
    vibe: 'Brain-Off',
    time: '100+ hrs',
    isPauseable: true,
    description: 'An expansive, story-rich RPG set in the universe of Dungeons & Dragons.',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_720p/co670h.jpg'
  },
  {
    id: 'fb-5',
    title: 'Cyberpunk 2077',
    developer: 'CD Projekt Red',
    tags: 'Action • Sci-Fi',
    vibe: 'Intense',
    time: '40+ hrs',
    isPauseable: true,
    description: 'An open-world, action-adventure RPG set in the megalopolis of Night City.',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_720p/co801k.jpg'
  },
  {
    id: 'fb-6',
    title: 'Stardew Valley',
    developer: 'ConcernedApe',
    tags: 'Simulation • RPG',
    vibe: 'Relaxing',
    time: '40+ hrs',
    isPauseable: true,
    description: 'You\'ve inherited your grandfather\'s old farm plot in Stardew Valley. Armed with hand-me-down tools and a few coins, set out to begin your new life!',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_720p/co1vcp.jpg'
  }
];

// Helper to fetch with timeout so requests fail fast if blocked or unreachable
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

// --- 1. THE STACK (Live IGDB API Swipe Engine) ---
const StackScreen = ({ library, onSaveToLibrary }) => {
  const [gamesStack, setGamesStack] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;

  // Refs to prevent PanResponder stale closures
  const gamesStackRef = useRef(gamesStack);
  const currentIndexRef = useRef(currentIndex);

  useEffect(() => {
    gamesStackRef.current = gamesStack;
  }, [gamesStack]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Fetch from IGDB on mount
  useEffect(() => {
    fetchIGDBGames();
  }, []);

  const fetchIGDBGames = async () => {
    setLoading(true);

    // Dynamically resolve hostname for Mobile Safari / LAN access (e.g. 192.168.x.x:3001)
    const currentHost = (typeof window !== 'undefined' && window.location?.hostname) 
      ? window.location.hostname 
      : 'localhost';

    const endpoints = [
      `http://${currentHost}:3001`,
      'http://localhost:3001',
      'https://api.igdb.com/v4/games'
    ];

    let successData = null;

    for (const url of endpoints) {
      try {
        const response = await fetchWithTimeout(url, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'text/plain',
            'Client-ID': IGDB_CLIENT_ID,
            'Authorization': `Bearer ${IGDB_ACCESS_TOKEN}`,
          },
          body: `
            fields name, summary, rating, rating_count, first_release_date, cover.image_id, genres.name, platforms.name, game_modes.name, themes.name, player_perspectives.name, involved_companies.company.name, involved_companies.developer, similar_games.name; 
            where rating > 75 & cover != null; 
            sort popularity desc; 
            limit 25;
          `
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
      const formattedGames = successData.map(mapIGDBToAppFormat);
      setGamesStack(formattedGames);
    } else {
      console.warn("Using curated fallback deck for Mobile Safari / Offline support.");
      setGamesStack(FALLBACK_GAMES);
    }
    
    setCurrentIndex(0);
    setLoading(false);
  };

  const mapIGDBToAppFormat = (igdbGame) => {
    const developerObj = igdbGame.involved_companies?.find(c => c.developer);
    const developer = developerObj?.company?.name || 'Unknown Developer';
    
    const tags = igdbGame.genres?.slice(0, 2).map(g => g.name).join(' • ') || 'Uncategorized';
    
    // Rating score formatted cleanly (e.g. 88%)
    const ratingScore = igdbGame.rating ? Math.round(igdbGame.rating) : null;
    
    // Release year
    const releaseYear = igdbGame.first_release_date 
      ? new Date(igdbGame.first_release_date * 1000).getFullYear()
      : null;

    // Supported platforms (e.g. PC, Switch, PS5, Xbox)
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

    // Similar games list for quick decision making (e.g. "Similar to: Hades • Dead Cells")
    const similarGames = igdbGame.similar_games?.slice(0, 3).map(s => s.name).join(' • ') || null;

    // Game modes (Single Player, Co-op, etc.)
    const gameModes = igdbGame.game_modes?.slice(0, 2).map(m => m.name).join(' • ') || 'Single Player';

    // Player perspective
    const perspective = igdbGame.player_perspectives?.map(p => p.name).join(', ') || 'Standard';

    // High-res cover image URL
    const coverUrl = igdbGame.cover?.image_id 
      ? `https://images.igdb.com/igdb/image/upload/t_720p/${igdbGame.cover.image_id}.jpg` 
      : null;

    return {
      id: igdbGame.id ? igdbGame.id.toString() : Math.random().toString(),
      title: igdbGame.name || 'Untitled Game',
      developer: developer,
      releaseYear: releaseYear,
      ratingScore: ratingScore,
      platforms: platforms,
      similarGames: similarGames,
      gameModes: gameModes,
      perspective: perspective,
      tags: tags,
      vibe: VIBES[Math.floor(Math.random() * VIBES.length)],
      time: 'Flexible', 
      isPauseable: true,
      description: igdbGame.summary || 'No description available.',
      coverUrl: coverUrl
    };
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        position.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: (evt, gestureState) => {
        const dx = gestureState.dx;
        const dy = gestureState.dy;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        if (absDx > absDy && absDx > SWIPE_THRESHOLD) {
          forceSwipe(dx > 0 ? 'right' : 'left', dx, dy);
        } else if (absDy > absDx && absDy > SWIPE_THRESHOLD) {
          forceSwipe(dy > 0 ? 'down' : 'up', dx, dy);
        } else {
          resetPosition();
        }
      }
    })
  ).current;

  const forceSwipe = (direction, dx, dy) => {
    let toValue = { x: 0, y: 0 };
    if (direction === 'right') toValue = { x: SCREEN_WIDTH * 1.5, y: dy };
    if (direction === 'left') toValue = { x: -SCREEN_WIDTH * 1.5, y: dy };
    if (direction === 'down') toValue = { x: dx, y: SCREEN_HEIGHT * 1.5 };
    if (direction === 'up') toValue = { x: dx, y: -SCREEN_HEIGHT * 1.5 };

    Animated.timing(position, {
      toValue,
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = (direction) => {
    const currentStack = gamesStackRef.current;
    const idx = currentIndexRef.current;
    const currentGame = currentStack[idx];
    
    let status = null;
    if (direction === 'right') status = 'played';
    if (direction === 'down') status = 'backlog';
    if (direction === 'up') status = 'wishlist';

    if (status && currentGame) {
      onSaveToLibrary({
        ...currentGame,
        status,
        loggedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }

    position.setValue({ x: 0, y: 0 });
    setCurrentIndex(prev => prev + 1);
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 5,
      useNativeDriver: false,
    }).start();
  };

  const opacityRight = position.x.interpolate({ inputRange: [0, SWIPE_THRESHOLD], outputRange: [0, 1], extrapolate: 'clamp' });
  const opacityLeft = position.x.interpolate({ inputRange: [-SWIPE_THRESHOLD, 0], outputRange: [1, 0], extrapolate: 'clamp' });
  const opacityDown = position.y.interpolate({ inputRange: [0, SWIPE_THRESHOLD], outputRange: [0, 1], extrapolate: 'clamp' });
  const opacityUp = position.y.interpolate({ inputRange: [-SWIPE_THRESHOLD, 0], outputRange: [1, 0], extrapolate: 'clamp' });

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const renderCards = () => {
    if (loading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color="#bf5af2" />
          <Text style={styles.emptyStateSubtext}>Consulting IGDB Database...</Text>
        </View>
      );
    }

    if (currentIndex >= gamesStack.length) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-done-circle-outline" size={64} color="#32d74b" />
          <Text style={styles.emptyStateText}>Stack Sorted!</Text>
          <TouchableOpacity onPress={fetchIGDBGames} style={{marginTop: 20}}>
            <Text style={{color: '#bf5af2', fontWeight: 'bold', fontSize: 16}}>Fetch More Games</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return gamesStack.map((item, i) => {
      if (i < currentIndex) return null;

      const isTopCard = i === currentIndex;

      return (
        <FlippableCard
          key={item.id}
          item={item}
          isTopCard={isTopCard}
          panHandlers={panResponder.panHandlers}
          position={position}
          rotate={rotate}
          opacityRight={opacityRight}
          opacityLeft={opacityLeft}
          opacityUp={opacityUp}
          opacityDown={opacityDown}
          stackDepth={i - currentIndex}
        />
      );
    }).reverse();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Discover</Text>
      </View>
      <View style={styles.cardContainer}>{renderCards()}</View>
    </SafeAreaView>
  );
};

// 3D Flippable Card Component
const FlippableCard = ({ 
  item, 
  isTopCard, 
  panHandlers, 
  position, 
  rotate, 
  opacityRight, 
  opacityLeft, 
  opacityUp, 
  opacityDown,
  stackDepth = 0,
  customStyle
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;

  // Reset flip when card changes
  useEffect(() => {
    setIsFlipped(false);
    animatedValue.setValue(0);
  }, [item.id]);

  const toggleFlip = () => {
    const toValue = isFlipped ? 0 : 180;
    Animated.spring(animatedValue, {
      toValue,
      friction: 8,
      tension: 10,
      useNativeDriver: false,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const frontInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontOpacity = animatedValue.interpolate({
    inputRange: [89, 90],
    outputRange: [1, 0],
  });

  const backOpacity = animatedValue.interpolate({
    inputRange: [89, 90],
    outputRange: [0, 1],
  });

  let cardStyle = [styles.card];
  if (customStyle) {
    cardStyle = [styles.card, customStyle];
  } else if (isTopCard && position) {
    cardStyle = [styles.card, { transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }] }];
  } else {
    cardStyle = [styles.card, { zIndex: -stackDepth, top: 10 * stackDepth }];
  }

  return (
    <Animated.View style={cardStyle} {...(isTopCard && panHandlers ? panHandlers : {})}>
      {/* Front Face */}
      <Animated.View 
        style={[
          styles.cardFace, 
          { transform: [{ rotateY: frontInterpolate }], opacity: frontOpacity }
        ]}
      >
        <CardContent item={item} onFlip={toggleFlip} />
      </Animated.View>

      {/* Back Face */}
      <Animated.View 
        style={[
          styles.cardFace, 
          styles.cardBackFace, 
          { transform: [{ rotateY: backInterpolate }], opacity: backOpacity }
        ]}
      >
        <CardBackContent item={item} onFlip={toggleFlip} />
      </Animated.View>

      {/* Swipe Overlays */}
      {isTopCard && (
        <>
          <Animated.View style={[styles.overlayRight, { opacity: opacityRight }]}><Text style={styles.overlayTextRight}>PLAYED</Text></Animated.View>
          <Animated.View style={[styles.overlayLeft, { opacity: opacityLeft }]}><Text style={styles.overlayTextLeft}>PASS</Text></Animated.View>
          <Animated.View style={[styles.overlayUp, { opacity: opacityUp }]}><Text style={styles.overlayTextUp}>WISHLIST</Text></Animated.View>
          <Animated.View style={[styles.overlayDown, { opacity: opacityDown }]}><Text style={styles.overlayTextDown}>BACKLOG</Text></Animated.View>
        </>
      )}
    </Animated.View>
  );
};

const CardContent = ({ item, onFlip }) => (
  <View style={styles.cardContentLayout}>
    {item.coverUrl ? (
      <Image source={{ uri: item.coverUrl }} style={styles.artImage} resizeMode="cover" />
    ) : (
      <View style={styles.artPlaceholder}>
        <Ionicons name="game-controller-outline" size={48} color="#333" />
      </View>
    )}
    
    {/* Dark gradient overlay so white text is readable over varied cover art */}
    <View style={styles.gradientOverlay} />

    {/* Top Left Score Badge */}
    {item.ratingScore ? (
      <View style={styles.scoreBadge}>
        <Ionicons name="star" size={12} color="#ffd60a" style={{ marginRight: 4 }} />
        <Text style={styles.scoreBadgeText}>{item.ratingScore}%</Text>
      </View>
    ) : null}

    {/* Info Flip Button on top right */}
    <TouchableOpacity onPress={onFlip} style={styles.infoFlipButton}>
      <Ionicons name="information-circle-outline" size={20} color="#fff" style={{ marginRight: 4 }} />
      <Text style={styles.infoFlipButtonText}>Details</Text>
    </TouchableOpacity>
    
    <View style={styles.cardFooter}>
      <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.cardDeveloper} numberOfLines={1}>
        {item.developer} {item.releaseYear ? `• ${item.releaseYear}` : ''}
      </Text>
      <View style={styles.footerPillRow}>
        <View style={styles.tagPill}>
          <Text style={styles.tagText}>{item.tags}</Text>
        </View>
        <View style={styles.platformPill}>
          <Text style={styles.platformText} numberOfLines={1}>{item.platforms}</Text>
        </View>
      </View>
    </View>
  </View>
);

const CardBackContent = ({ item, onFlip }) => (
  <View style={styles.cardBackLayout}>
    <View style={styles.cardBackHeader}>
      <View style={styles.cardBackTitleRow}>
        <Text style={styles.cardBackTitle} numberOfLines={2}>{item.title}</Text>
        {item.ratingScore ? (
          <View style={styles.cardBackScoreBadge}>
            <Ionicons name="trophy" size={14} color="#ffd60a" style={{ marginRight: 4 }} />
            <Text style={styles.cardBackScoreText}>{item.ratingScore}%</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.cardBackDeveloper}>
        {item.developer} {item.releaseYear ? `(${item.releaseYear})` : ''}
      </Text>

      <View style={styles.footerPillRow}>
        <View style={styles.tagPill}>
          <Text style={styles.tagText}>{item.tags}</Text>
        </View>
      </View>
    </View>

    <ScrollView style={styles.cardBackScroll} showsVerticalScrollIndicator={false}>
      {/* Similar Games Quick Context */}
      {item.similarGames ? (
        <View style={styles.similarBox}>
          <Ionicons name="git-compare-outline" size={16} color="#bf5af2" style={{ marginRight: 6 }} />
          <Text style={styles.similarText} numberOfLines={2}>
            <Text style={{ fontWeight: 'bold', color: '#bf5af2' }}>Similar to: </Text>
            {item.similarGames}
          </Text>
        </View>
      ) : null}

      <Text style={styles.cardBackSectionTitle}>GAME OVERVIEW</Text>
      <Text style={styles.cardBackDescription}>{item.description}</Text>

      <View style={styles.divider} />

      <Text style={styles.cardBackSectionTitle}>SYSTEMS & PLAY SPECS</Text>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Platforms</Text>
        <Text style={styles.detailValue}>{item.platforms}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Play Modes</Text>
        <Text style={styles.detailValue}>{item.gameModes}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Camera & Style</Text>
        <Text style={styles.detailValue}>{item.perspective}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Vibe</Text>
        <Text style={[styles.detailValue, { color: '#bf5af2' }]}>{item.vibe}</Text>
      </View>
    </ScrollView>

    <TouchableOpacity onPress={onFlip} style={styles.flipBackFooter}>
      <Ionicons name="swap-horizontal-outline" size={18} color="#bf5af2" style={{ marginRight: 6 }} />
      <Text style={styles.flipBackFooterText}>Tap to Flip Cover</Text>
    </TouchableOpacity>
  </View>
);

// --- 2. THE ORACLE (Decision Engine) ---
const OracleScreen = ({ library }) => {
  const [selectedVibe, setSelectedVibe] = useState(null);
  const [source, setSource] = useState('backlog');
  const [recommendation, setRecommendation] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleConsultOracle = () => {
    setErrorMsg('');
    setRecommendation(null);

    const candidates = library.filter(
      game => game.status === source && (!selectedVibe || game.vibe === selectedVibe)
    );

    if (candidates.length === 0) {
      setErrorMsg(`The Oracle is silent. You have no ${source} games matching this vibe.`);
      return;
    }

    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    
    setTimeout(() => {
      setRecommendation(pick);
    }, 400);
  };

  if (recommendation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>The Oracle Speaks</Text>
        </View>
        <View style={styles.oracleResultContainer}>
          <FlippableCard 
            item={recommendation} 
            customStyle={{ position: 'relative', shadowOpacity: 0.8, shadowColor: '#bf5af2' }}
          />
          <TouchableOpacity 
            style={[styles.oracleButton, { marginTop: 40, backgroundColor: '#333' }]} 
            onPress={() => setRecommendation(null)}
          >
            <Ionicons name="refresh-outline" size={20} color="#fff" style={{ marginRight: 10 }} />
            <Text style={styles.oracleButtonText}>Ask Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Consult The Oracle</Text>
      </View>
      <View style={styles.oracleFormContainer}>
        
        <Text style={styles.oracleLabel}>What are you looking for?</Text>
        <View style={styles.sourceToggleRow}>
          <TouchableOpacity 
            style={[styles.sourceToggle, source === 'backlog' && styles.sourceToggleActive]}
            onPress={() => setSource('backlog')}
          >
            <Text style={[styles.sourceToggleText, source === 'backlog' && styles.sourceToggleTextActive]}>Play Tonight</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sourceToggle, source === 'wishlist' && styles.sourceToggleActive]}
            onPress={() => setSource('wishlist')}
          >
            <Text style={[styles.sourceToggleText, source === 'wishlist' && styles.sourceToggleTextActive]}>Buy Today</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.oracleLabel}>What's the vibe?</Text>
        <View style={styles.vibeGrid}>
          {VIBES.map(vibe => (
            <TouchableOpacity 
              key={vibe} 
              style={[styles.vibeChip, selectedVibe === vibe && styles.vibeChipActive]}
              onPress={() => setSelectedVibe(vibe === selectedVibe ? null : vibe)}
            >
              <Text style={[styles.vibeChipText, selectedVibe === vibe && styles.vibeChipTextActive]}>{vibe}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

        <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 40 }}>
          <TouchableOpacity style={styles.oracleButton} onPress={handleConsultOracle}>
            <Ionicons name="sparkles" size={20} color="#fff" style={{ marginRight: 10 }} />
            <Text style={styles.oracleButtonText}>Reveal Game</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
};

// --- 3. THE LIBRARY (Timeline View & Passport Modal) ---
const LibraryScreen = ({ library }) => {
  const [selectedGame, setSelectedGame] = useState(null);

  const getBadgeStyle = (status) => {
    if (status === 'played') return { color: '#32d74b', borderColor: '#32d74b', label: 'PLAYED' };
    if (status === 'backlog') return { color: '#0a84ff', borderColor: '#0a84ff', label: 'BACKLOG' };
    if (status === 'wishlist') return { color: '#bf5af2', borderColor: '#bf5af2', label: 'WISHLIST' };
    return { color: '#888', borderColor: '#888', label: status };
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Vault & Timeline</Text>
      </View>

      {library.length === 0 ? (
        <View style={styles.centerStage}>
          <Ionicons name="archive-outline" size={64} color="#333" />
          <Text style={styles.emptyStateText}>Library Empty</Text>
          <Text style={styles.subText}>Swipe games on The Stack to build your timeline.</Text>
        </View>
      ) : (
        <FlatList
          data={library}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => {
            const badge = getBadgeStyle(item.status);
            return (
              <TouchableOpacity style={styles.timelineItem} onPress={() => setSelectedGame(item)}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <View style={styles.timelineHeaderRow}>
                    <Text style={styles.timelineTitle} numberOfLines={1}>{item.title}</Text>
                    <View style={[styles.statusBadge, { borderColor: badge.borderColor }]}>
                      <Text style={[styles.statusBadgeText, { color: badge.color }]}>{badge.label}</Text>
                    </View>
                  </View>
                  <Text style={styles.timelineSub}>{item.developer} • Logged {item.loggedAt}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      <Modal visible={!!selectedGame} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.passportContainer}>
            {selectedGame && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.passportHeader}>
                  <Text style={styles.passportTitle}>{selectedGame.title}</Text>
                  <TouchableOpacity onPress={() => setSelectedGame(null)}>
                    <Ionicons name="close-circle" size={32} color="#555" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.passportDev}>{selectedGame.developer}</Text>
                <Text style={styles.passportDesc}>{selectedGame.description}</Text>

                <View style={styles.divider} />

                <Text style={styles.specsHeader}>PLAYER RESPECT SPECS</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Est. Session</Text>
                  <Text style={styles.detailValue}>{selectedGame.time}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Pause Anytime</Text>
                  <Text style={[styles.detailValue, selectedGame.isPauseable && { color: '#32d74b' }]}>
                    {selectedGame.isPauseable ? 'Yes' : 'No'}
                  </Text>
                </View>

                {/* Trojan Horse Phase Placeholder */}
                <View style={styles.trojanBox}>
                  <Ionicons name="document-text-outline" size={20} color="#666" />
                  <Text style={styles.trojanText}>Session Notes & Vault Documents (Trojan Horse Phase)</Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// --- MAIN NAVIGATION APP ---
export default function App() {
  const [library, setLibrary] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = window.localStorage.getItem('oracle_library');
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem('oracle_library', JSON.stringify(library));
      } catch (e) {}
    }
  }, [library]);

  const handleSaveToLibrary = (game) => {
    setLibrary((prev) => {
      const exists = prev.find(g => g.id === game.id);
      if (exists) {
        return prev.map(g => g.id === game.id ? game : g);
      }
      return [game, ...prev]; 
    });
  };

  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === 'Stack') iconName = focused ? 'albums' : 'albums-outline';
              else if (route.name === 'Oracle') iconName = focused ? 'sparkles' : 'sparkles-outline';
              else if (route.name === 'Library') iconName = focused ? 'library' : 'library-outline';
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#fff',
            tabBarInactiveTintColor: '#555',
            tabBarStyle: {
              backgroundColor: '#121212',
              borderTopWidth: 1,
              borderTopColor: '#2a2a2a',
              paddingTop: 10,
              paddingBottom: 30,
              height: 90,
            },
            tabBarLabelStyle: { fontSize: 12, fontWeight: '600', marginTop: 5 }
          })}
        >
          <Tab.Screen name="Stack">
            {(props) => <StackScreen {...props} library={library} onSaveToLibrary={handleSaveToLibrary} />}
          </Tab.Screen>
          <Tab.Screen name="Oracle">
            {(props) => <OracleScreen {...props} library={library} />}
          </Tab.Screen>
          <Tab.Screen name="Library">
            {(props) => <LibraryScreen {...props} library={library} />}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}

// --- GLOBAL STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  centerStage: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  screenHeader: { padding: 20, paddingTop: 40, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  screenTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', letterSpacing: 1 },
  fallbackBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#261b33', borderColor: '#bf5af2', borderWidth: 1, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12, marginTop: 6 },
  fallbackBadgeText: { color: '#bf5af2', fontSize: 11, fontWeight: '600' },
  subText: { color: '#888', fontSize: 16, textAlign: 'center' },
  
  // Stack UI
  cardContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 10 },
  emptyState: { alignItems: 'center', justifyContent: 'center' },
  emptyStateText: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 15 },
  emptyStateSubtext: { color: '#888', fontSize: 14, marginTop: 10, textAlign: 'center' },
  
  // Card UI & 3D Flip
  card: { position: 'absolute', width: SCREEN_WIDTH * 0.9, height: SCREEN_HEIGHT * 0.65, backgroundColor: '#1e1e1e', borderRadius: 20, borderWidth: 1, borderColor: '#333', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 5, overflow: 'hidden' },
  cardFace: { position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden' },
  cardBackFace: { backgroundColor: '#181818', borderRadius: 20 },
  cardContentLayout: { flex: 1, justifyContent: 'flex-end' },
  artImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  artPlaceholder: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#252525', justifyContent: 'center', alignItems: 'center' },
  gradientOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '50%', backgroundColor: 'rgba(0,0,0,0.6)' },
  
  // Score Badge & Buttons
  scoreBadge: { position: 'absolute', top: 15, left: 15, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.75)', borderWidth: 1, borderColor: '#ffd60a', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 20, zIndex: 10 },
  scoreBadgeText: { color: '#ffd60a', fontSize: 13, fontWeight: 'bold' },
  infoFlipButton: { position: 'absolute', top: 15, right: 15, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.65)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, zIndex: 10 },
  infoFlipButtonText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  
  cardFooter: { padding: 20, backgroundColor: 'transparent' },
  cardTitle: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 5, textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  cardDeveloper: { fontSize: 16, color: '#ddd', marginBottom: 12, textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  footerPillRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
  tagPill: { backgroundColor: 'rgba(0,0,0,0.7)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 15, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#444' },
  tagText: { color: '#ddd', fontSize: 13, fontWeight: '600' },
  platformPill: { backgroundColor: 'rgba(191, 90, 242, 0.2)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 15, borderWidth: 1, borderColor: '#bf5af2' },
  platformText: { color: '#bf5af2', fontSize: 12, fontWeight: '600' },

  // Card Back Layout
  cardBackLayout: { flex: 1, padding: 25, justifyContent: 'space-between' },
  cardBackHeader: { borderBottomWidth: 1, borderBottomColor: '#2a2a2a', paddingBottom: 15, marginBottom: 15 },
  cardBackTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardBackTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', flex: 1, marginRight: 10, marginBottom: 4 },
  cardBackScoreBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2b2310', borderWidth: 1, borderColor: '#ffd60a', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 },
  cardBackScoreText: { color: '#ffd60a', fontSize: 13, fontWeight: 'bold' },
  cardBackDeveloper: { fontSize: 15, color: '#888', fontWeight: '500', marginBottom: 10 },
  similarBox: { backgroundColor: '#211529', borderWidth: 1, borderColor: '#5c227e', borderRadius: 12, padding: 12, marginBottom: 15, flexDirection: 'row', alignItems: 'center' },
  similarText: { color: '#e0c0f8', fontSize: 13, flex: 1, lineHeight: 18 },
  cardBackScroll: { flex: 1, marginVertical: 5 },
  cardBackSectionTitle: { color: '#666', fontSize: 11, fontWeight: 'bold', letterSpacing: 1, marginBottom: 8, marginTop: 10 },
  cardBackDescription: { color: '#ccc', fontSize: 14, lineHeight: 21 },
  flipBackFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#251b33', borderWidth: 1, borderColor: '#bf5af2', paddingVertical: 12, borderRadius: 14, marginTop: 10 },
  flipBackFooterText: { color: '#bf5af2', fontSize: 14, fontWeight: 'bold' },

  // Overlays
  overlayRight: { position: 'absolute', top: 40, left: 40, transform: [{ rotate: '-15deg' }] },
  overlayTextRight: { borderWidth: 4, borderColor: '#32d74b', color: '#32d74b', fontSize: 28, fontWeight: 'bold', padding: 8, borderRadius: 10, letterSpacing: 2, backgroundColor: 'rgba(0,0,0,0.5)' },
  overlayLeft: { position: 'absolute', top: 40, right: 40, transform: [{ rotate: '15deg' }] },
  overlayTextLeft: { borderWidth: 4, borderColor: '#ff453a', color: '#ff453a', fontSize: 28, fontWeight: 'bold', padding: 8, borderRadius: 10, letterSpacing: 2, backgroundColor: 'rgba(0,0,0,0.5)' },
  overlayUp: { position: 'absolute', bottom: 180, alignSelf: 'center' },
  overlayTextUp: { borderWidth: 4, borderColor: '#bf5af2', color: '#bf5af2', fontSize: 28, fontWeight: 'bold', padding: 8, borderRadius: 10, letterSpacing: 2, backgroundColor: 'rgba(0,0,0,0.5)' },
  overlayDown: { position: 'absolute', top: 120, alignSelf: 'center' },
  overlayTextDown: { borderWidth: 4, borderColor: '#0a84ff', color: '#0a84ff', fontSize: 28, fontWeight: 'bold', padding: 8, borderRadius: 10, letterSpacing: 2, backgroundColor: 'rgba(0,0,0,0.5)' },

  // Oracle UI
  oracleFormContainer: { flex: 1, padding: 20, paddingTop: 40 },
  oracleLabel: { color: '#888', fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15, marginTop: 20 },
  sourceToggleRow: { flexDirection: 'row', backgroundColor: '#1e1e1e', borderRadius: 12, padding: 4, borderWidth: 1, borderColor: '#333' },
  sourceToggle: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
  sourceToggleActive: { backgroundColor: '#333' },
  sourceToggleText: { color: '#888', fontWeight: 'bold' },
  sourceToggleTextActive: { color: '#fff' },
  vibeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  vibeChip: { backgroundColor: '#1e1e1e', borderWidth: 1, borderColor: '#333', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 20 },
  vibeChipActive: { backgroundColor: '#bf5af2', borderColor: '#bf5af2' },
  vibeChipText: { color: '#aaa', fontWeight: '600' },
  vibeChipTextActive: { color: '#fff' },
  oracleButton: { backgroundColor: '#bf5af2', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRadius: 16, shadowColor: '#bf5af2', shadowOpacity: 0.4, shadowOffset: { width: 0, height: 5 }, shadowRadius: 10 },
  oracleButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
  oracleResultContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  errorText: { color: '#ff453a', marginTop: 20, textAlign: 'center', fontSize: 15 },

  // Timeline UI (Library Tab)
  timelineItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, backgroundColor: '#1e1e1e', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#2a2a2a' },
  timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#0a84ff', marginRight: 15 },
  timelineContent: { flex: 1 },
  timelineHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  timelineTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', flexShrink: 1, marginRight: 10 },
  timelineSub: { color: '#888', fontSize: 13 },
  statusBadge: { borderWidth: 1, paddingVertical: 2, paddingHorizontal: 8, borderRadius: 10 },
  statusBadgeText: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },

  // Passport Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  passportContainer: { backgroundColor: '#1e1e1e', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 25, maxHeight: SCREEN_HEIGHT * 0.8, borderWidth: 1, borderColor: '#333' },
  passportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  passportTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', flex: 1, marginRight: 10 },
  passportDev: { fontSize: 16, color: '#888', marginBottom: 15 },
  passportDesc: { fontSize: 15, color: '#ccc', lineHeight: 22, marginBottom: 20 },
  divider: { height: 1, backgroundColor: '#333', marginVertical: 15 },
  specsHeader: { color: '#666', fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 10 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  detailLabel: { color: '#aaa', fontSize: 15 },
  detailValue: { color: '#fff', fontSize: 15, fontWeight: '600' },
  trojanBox: { marginTop: 25, padding: 15, backgroundColor: '#161616', borderRadius: 10, borderStyle: 'dashed', borderWidth: 1, borderColor: '#333', flexDirection: 'row', alignItems: 'center', gap: 10 },
  trojanText: { color: '#666', fontSize: 13, flex: 1 }
});
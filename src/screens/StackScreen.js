import React, { useState, useRef, useEffect } from 'react';
import { View, Text, SafeAreaView, Animated, PanResponder, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchGamesFromIGDB } from '../api/igdb';
import { FlippableCard } from '../components/FlippableCard';
import { styles } from '../styles/theme';
import { SCREEN_WIDTH, SCREEN_HEIGHT, SWIPE_THRESHOLD, SWIPE_OUT_DURATION } from '../utils/constants';

export const StackScreen = ({ library, isLoaded = true, onSaveToLibrary, onRemoveFromLibrary }) => {
  const [gamesStack, setGamesStack] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [deckFilter, setDeckFilter] = useState('popular');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeHistory, setSwipeHistory] = useState([]);
  const position = useRef(new Animated.ValueXY()).current;

  const gamesStackRef = useRef(gamesStack);
  const currentIndexRef = useRef(currentIndex);

  useEffect(() => {
    gamesStackRef.current = gamesStack;
  }, [gamesStack]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    if (isLoaded) {
      loadGames();
    }
  }, [deckFilter, isLoaded]);

  const loadGames = async () => {
    setLoading(true);
    setSwipeHistory([]);
    const { data, error } = await fetchGamesFromIGDB(deckFilter, library);
    if (error) {
      setError(true);
      setGamesStack([]);
    } else {
      setGamesStack(data);
      setError(false);
    }
    setCurrentIndex(0);
    setLoading(false);
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
    if (direction === 'skip') toValue = { x: SCREEN_WIDTH * 1.5, y: -SCREEN_HEIGHT * 1.5 }; // Diagonal exit

    Animated.timing(position, {
      toValue,
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: true, // Optimized for native thread
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
    if (direction === 'left') status = 'passed';

    if (status && currentGame) {
      onSaveToLibrary({
        ...currentGame,
        status,
        loggedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }

    if (direction === 'skip') {
      // Re-add to the end of the queue so it renders later
      setGamesStack(prev => [...prev, currentGame]);
    }

    setSwipeHistory(prev => [...prev, { index: idx, direction, game: currentGame }]);

    position.setValue({ x: 0, y: 0 });
    setCurrentIndex(prev => prev + 1);
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 5,
      useNativeDriver: true, // Optimized for native thread
    }).start();
  };

  const handleRewind = () => {
    if (swipeHistory.length === 0) return;
    
    const lastSwipe = swipeHistory[swipeHistory.length - 1];
    
    if (lastSwipe.direction === 'skip') {
      // Remove the duplicated game from the end of the stack
      setGamesStack(prev => prev.slice(0, -1));
    } else if (lastSwipe.direction !== 'left') {
      onRemoveFromLibrary(lastSwipe.game.id);
    }
    
    // Position it off-screen in the direction it was swiped
    let startValue = { x: 0, y: 0 };
    if (lastSwipe.direction === 'right') startValue = { x: SCREEN_WIDTH * 1.5, y: 0 };
    if (lastSwipe.direction === 'left') startValue = { x: -SCREEN_WIDTH * 1.5, y: 0 };
    if (lastSwipe.direction === 'down') startValue = { x: 0, y: SCREEN_HEIGHT * 1.5 };
    if (lastSwipe.direction === 'up') startValue = { x: 0, y: -SCREEN_HEIGHT * 1.5 };
    if (lastSwipe.direction === 'skip') startValue = { x: SCREEN_WIDTH * 1.5, y: -SCREEN_HEIGHT * 1.5 };

    position.setValue(startValue);
    setCurrentIndex(lastSwipe.index);
    setSwipeHistory(prev => prev.slice(0, -1));
    
    // Animate it back to the center after a slight delay to allow the card to remount
    setTimeout(() => {
      Animated.spring(position, {
        toValue: { x: 0, y: 0 },
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }, 50);
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
    if (!isLoaded || loading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.emptyStateSubtext}>Consulting IGDB...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="wifi-outline" size={64} color="#ff453a" />
          <Text style={styles.emptyStateText}>No Connection</Text>
          <Text style={styles.emptyStateSubtext}>The Stack requires an active internet connection to discover new games.</Text>
          <TouchableOpacity onPress={loadGames} style={{marginTop: 20, padding: 10, borderWidth: 0.5, borderColor: '#fff', borderRadius: 8}}>
            <Text style={{color: '#fff', fontWeight: '500', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1}}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (currentIndex >= gamesStack.length) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-done-circle-outline" size={64} color="#32d74b" />
          <Text style={styles.emptyStateText}>Stack Sorted!</Text>
          <TouchableOpacity onPress={loadGames} style={{marginTop: 20, padding: 10, borderWidth: 0.5, borderColor: '#fff', borderRadius: 8}}>
            <Text style={{color: '#fff', fontWeight: '500', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1}}>Fetch More Games</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return gamesStack.slice(currentIndex, currentIndex + 3).map((item, relIndex) => {
      const isTopCard = relIndex === 0;
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
          stackDepth={relIndex}
        />
      );
    }).reverse();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Discover</Text>
        <View style={styles.deckFilterRow}>
          <TouchableOpacity 
            style={[styles.deckFilterChip, deckFilter === 'popular' && styles.deckFilterChipActive]}
            onPress={() => setDeckFilter('popular')}
          >
            <Ionicons name="flame" size={13} color={deckFilter === 'popular' ? '#fff' : '#888'} style={{ marginRight: 5 }} />
            <Text style={[styles.deckFilterText, deckFilter === 'popular' && styles.deckFilterTextActive]}>Headliners</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.deckFilterChip, deckFilter === 'discover' && styles.deckFilterChipActive]}
            onPress={() => setDeckFilter('discover')}
          >
            <Ionicons name="sparkles" size={13} color={deckFilter === 'discover' ? '#fff' : '#888'} style={{ marginRight: 5 }} />
            <Text style={[styles.deckFilterText, deckFilter === 'discover' && styles.deckFilterTextActive]}>Hidden Gems</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.cardContainer}>{renderCards()}</View>
      {!loading && !error && currentIndex < gamesStack.length && (
        <View style={styles.stackActionBar}>
          <TouchableOpacity 
            style={[styles.stackActionButtonRewind, swipeHistory.length === 0 && { opacity: 0.25 }]} 
            onPress={handleRewind}
            disabled={swipeHistory.length === 0}
          >
            <Ionicons name="play-back" size={20} color={swipeHistory.length === 0 ? "#555" : "#fff"} />
            <Text style={{ color: '#666', fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, marginTop: 6, fontWeight: '500' }}>Undo</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.stackActionButton, styles.stackActionButtonSkip]} 
            onPress={() => forceSwipe('skip', SCREEN_WIDTH, -SCREEN_HEIGHT)}
          >
            <Ionicons name="play-skip-forward" size={20} color="#fff" />
            <Text style={{ color: '#888', fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, marginTop: 6, fontWeight: '500' }}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.stackActionButton, styles.stackActionButtonPass]} 
            onPress={() => forceSwipe('left', -SCREEN_WIDTH, 0)}
          >
            <Ionicons name="close" size={22} color="#888" />
            <Text style={{ color: '#888', fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, marginTop: 6, fontWeight: '500' }}>Pass</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.stackActionButton, styles.stackActionButtonBacklog]} 
            onPress={() => forceSwipe('down', 0, SCREEN_HEIGHT)}
          >
            <Ionicons name="layers-outline" size={20} color="#aaa" />
            <Text style={{ color: '#aaa', fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, marginTop: 6, fontWeight: '500' }}>Backlog</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.stackActionButton, styles.stackActionButtonWishlist]} 
            onPress={() => forceSwipe('up', 0, -SCREEN_HEIGHT)}
          >
            <Ionicons name="gift-outline" size={20} color="#ccc" />
            <Text style={{ color: '#ccc', fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, marginTop: 6, fontWeight: '500' }}>Wishlist</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.stackActionButton, styles.stackActionButtonPlayed]} 
            onPress={() => forceSwipe('right', SCREEN_WIDTH, 0)}
          >
            <Ionicons name="checkmark" size={22} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, marginTop: 6, fontWeight: '500' }}>Played</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

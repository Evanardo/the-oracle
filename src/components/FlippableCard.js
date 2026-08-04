import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Animated, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/theme';
import { ScreenshotGallery } from './ScreenshotGallery';

export const FlippableCard = React.memo(({ 
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
      useNativeDriver: true, // Optimized for native thread
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
});

const CardContent = ({ item, onFlip }) => (
  <View style={styles.cardContentLayout}>
    {item.coverUrl ? (
      <Image source={{ uri: item.coverUrl }} style={styles.artImage} resizeMode="cover" />
    ) : (
      <View style={styles.artPlaceholder}>
        <Ionicons name="game-controller-outline" size={48} color="#333" />
      </View>
    )}
    
    <View style={styles.gradientOverlay} />

    {item.ratingScore ? (
      <View style={styles.scoreBadge}>
        <Ionicons name="star" size={12} color="#ffd60a" style={{ marginRight: 4 }} />
        <Text style={styles.scoreBadgeText}>{item.ratingScore}%</Text>
      </View>
    ) : null}

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
      {item.similarGames ? (
        <View style={styles.similarBox}>
          <Ionicons name="git-compare-outline" size={16} color="#bf5af2" style={{ marginRight: 6 }} />
          <Text style={styles.similarText} numberOfLines={2}>
            <Text style={{ fontWeight: 'bold', color: '#bf5af2' }}>Similar to: </Text>
            {item.similarGames}
          </Text>
        </View>
      ) : null}

      {item.screenshots && item.screenshots.length > 0 && (
        <View style={{ marginBottom: 15 }}>
          <Text style={styles.cardBackSectionTitle}>SCREENSHOTS</Text>
          <ScreenshotGallery screenshots={item.screenshots} />
        </View>
      )}

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

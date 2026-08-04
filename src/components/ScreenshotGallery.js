import React, { useState } from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/theme';

export const ScreenshotGallery = React.memo(({ screenshots }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  if (!screenshots || screenshots.length === 0) return null;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % screenshots.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  };

  return (
    <View style={styles.galleryContainer}>
      <Image source={{ uri: screenshots[currentIndex] }} style={styles.galleryImage} resizeMode="cover" />
      
      {screenshots.length > 1 && (
        <>
          <TouchableOpacity style={styles.galleryNavLeft} onPress={handlePrev}>
            <Ionicons name="chevron-back-circle" size={32} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.galleryNavRight} onPress={handleNext}>
            <Ionicons name="chevron-forward-circle" size={32} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>

          <View style={styles.galleryDotsContainer}>
            {screenshots.map((_, i) => (
              <View key={i} style={[styles.galleryDot, i === currentIndex && styles.galleryDotActive]} />
            ))}
          </View>
        </>
      )}
    </View>
  );
});

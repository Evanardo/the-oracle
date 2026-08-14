import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/theme';

export const ScreenshotGallery = React.memo(({ screenshots }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  
  const validScreenshots = (screenshots || []).filter(s => typeof s === 'string' && s.trim().length > 0);
  
  if (validScreenshots.length === 0) return null;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % validScreenshots.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + validScreenshots.length) % validScreenshots.length);
  };

  const currentUri = validScreenshots[currentIndex] || validScreenshots[0];

  return (
    <>
      <View style={styles.galleryContainer}>
        <TouchableOpacity activeOpacity={0.9} onPress={() => setModalVisible(true)} style={{ flex: 1 }}>
          <Image source={{ uri: currentUri }} style={styles.galleryImage} resizeMode="cover" />
        </TouchableOpacity>
        
        {validScreenshots.length > 1 && (
          <>
            <TouchableOpacity style={styles.galleryNavLeft} onPress={handlePrev}>
              <Ionicons name="chevron-back-circle" size={32} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.galleryNavRight} onPress={handleNext}>
              <Ionicons name="chevron-forward-circle" size={32} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>

            <View style={styles.galleryDotsContainer}>
              {validScreenshots.map((_, i) => (
                <View key={i} style={[styles.galleryDot, i === currentIndex && styles.galleryDotActive]} />
              ))}
            </View>
          </>
        )}
      </View>

      <Modal visible={modalVisible} transparent={true} animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.fullscreenModalBackground}>
          <TouchableOpacity style={styles.fullscreenModalClose} onPress={() => setModalVisible(false)}>
            <Ionicons name="close" size={32} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.fullscreenImageContainer}>
            <Image source={{ uri: currentUri }} style={styles.fullscreenImage} resizeMode="contain" />
            
            {validScreenshots.length > 1 && (
              <>
                <TouchableOpacity style={styles.galleryNavLeft} onPress={handlePrev}>
                  <Ionicons name="chevron-back-circle" size={48} color="rgba(255,255,255,0.8)" />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.galleryNavRight} onPress={handleNext}>
                  <Ionicons name="chevron-forward-circle" size={48} color="rgba(255,255,255,0.8)" />
                </TouchableOpacity>

                <View style={styles.galleryDotsContainer}>
                  {validScreenshots.map((_, i) => (
                    <View key={i} style={[styles.galleryDot, i === currentIndex && styles.galleryDotActive]} />
                  ))}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
});

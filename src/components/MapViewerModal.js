import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function MapViewerModal({ visible, map, title, onClose }) {
  const [scale, setScale] = useState(1);

  if (!map || !map.localUri) return null;

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.5, 1));
  };

  const handleResetZoom = () => {
    setScale(1);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={18} color="#fff" style={{ marginRight: 4 }} />
            <Text style={styles.closeBtnText}>Close Map</Text>
          </TouchableOpacity>

          <View style={styles.titleArea}>
            <Text style={styles.mapTitle} numberOfLines={1}>
              {title ? `${title} Map` : map.name || 'Game Map'}
            </Text>
            <Text style={styles.scaleIndicator}>{scale.toFixed(1)}x Zoom</Text>
          </View>

          <TouchableOpacity style={styles.resetBtn} onPress={handleResetZoom}>
            <Text style={styles.resetBtnText}>↺ Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Map Viewport Area */}
        <View style={styles.viewport}>
          {Platform.OS === 'web' ? (
            <div style={styles.webContainer}>
              <img
                src={map.localUri}
                alt="Game Map"
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.2s ease-out',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
              />
            </div>
          ) : (
            <View style={styles.nativeContainer}>
              <Image
                source={{ uri: map.localUri }}
                style={[
                  styles.mapImage,
                  {
                    transform: [{ scale: scale }],
                  },
                ]}
                resizeMode="contain"
              />
            </View>
          )}
        </View>

        {/* Floating Zoom Control Bar */}
        <View style={styles.zoomBar}>
          <TouchableOpacity style={styles.zoomBtn} onPress={handleZoomOut} disabled={scale <= 1}>
            <Text style={[styles.zoomBtnText, scale <= 1 && styles.zoomBtnDisabled]}>−</Text>
          </TouchableOpacity>

          <View style={styles.scalePill}>
            <Text style={styles.scalePillText}>{Math.round(scale * 100)}%</Text>
          </View>

          <TouchableOpacity style={styles.zoomBtn} onPress={handleZoomIn} disabled={scale >= 4}>
            <Text style={[styles.zoomBtnText, scale >= 4 && styles.zoomBtnDisabled]}>+</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 0.5,
    borderBottomColor: '#222222',
    zIndex: 100,
  },
  closeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#333333',
  },
  closeBtnText: {
    color: '#ffffff',
    fontWeight: '500',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  titleArea: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  mapTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  scaleIndicator: {
    color: '#888888',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '300',
  },
  resetBtn: {
    backgroundColor: '#111111',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#333333',
  },
  resetBtnText: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '500',
  },
  viewport: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  webContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'auto',
  },
  nativeContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapImage: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.7,
  },
  zoomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 14,
    backgroundColor: '#0a0a0a',
    borderTopWidth: 0.5,
    borderTopColor: '#222222',
  },
  zoomBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#111111',
    borderWidth: 0.5,
    borderColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomBtnText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  zoomBtnDisabled: {
    color: '#444444',
  },
  scalePill: {
    backgroundColor: '#111111',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#333333',
  },
  scalePillText: {
    color: '#ffffff',
    fontWeight: '500',
    fontSize: 13,
  },
});

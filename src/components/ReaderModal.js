import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ReaderModal({ visible, manual, onClose }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setCurrentPage(0);
      setImageLoading(true);
    }
  }, [visible, manual]);

  useEffect(() => {
    setImageLoading(true);
  }, [currentPage]);

  if (!manual) return null;

  const totalPages = manual.pageCount || (manual.pages ? manual.pages.length : 1);
  const isMultiPage = totalPages > 1;

  const getCurrentPageUri = () => {
    if (manual.pages && manual.pages[currentPage]) {
      return manual.pages[currentPage].localUri;
    }
    return manual.coverUri || manual.localUri;
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const currentPageUri = getCurrentPageUri();

  return (
    <Modal visible={visible} animationType="fade" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={20} color="#fff" style={{ marginRight: 4 }} />
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={styles.manualTitle} numberOfLines={1}>
              {manual.name || 'Game Manual'}
            </Text>
            {isMultiPage && (
              <Text style={styles.pageCountText}>
                Page {currentPage + 1} of {totalPages}
              </Text>
            )}
          </View>
        </View>

        {/* Viewer Content Area */}
        <View style={styles.viewerContainer}>
          {imageLoading && Platform.OS !== 'web' && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}

          {currentPageUri ? (
            Platform.OS === 'web' ? (
              <img
                key={`${manual.id}_${currentPage}`}
                src={currentPageUri}
                alt={`Page ${currentPage + 1}`}
                style={styles.webImageStyle}
              />
            ) : (
              <Image
                key={`${manual.id}_${currentPage}`}
                source={{ uri: currentPageUri }}
                style={styles.pageImage}
                resizeMode="contain"
                fadeDuration={0}
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
                onError={(err) => {
                  console.warn('Image load error for page:', currentPageUri, err);
                  setImageLoading(false);
                }}
              />
            )
          ) : (
            <View style={styles.fallbackContainer}>
              <Ionicons name="book-outline" size={56} color="#555" />
              <Text style={styles.fallbackText}>No page content available</Text>
            </View>
          )}

          {/* Floating Navigation Arrows */}
          {isMultiPage && (
            <>
              {currentPage > 0 && (
                <TouchableOpacity style={[styles.arrowButton, styles.leftArrow]} onPress={handlePrevPage}>
                  <Ionicons name="chevron-back" size={24} color="#fff" />
                </TouchableOpacity>
              )}

              {currentPage < totalPages - 1 && (
                <TouchableOpacity style={[styles.arrowButton, styles.rightArrow]} onPress={handleNextPage}>
                  <Ionicons name="chevron-forward" size={24} color="#fff" />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {/* Bottom Control Bar */}
        {isMultiPage && (
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={[styles.navBtn, currentPage === 0 && styles.navBtnDisabled]}
              onPress={handlePrevPage}
              disabled={currentPage === 0}
            >
              <Text style={styles.navBtnText}>‹ Previous</Text>
            </TouchableOpacity>

            <View style={styles.pagePill}>
              <Text style={styles.pagePillText}>
                {currentPage + 1} / {totalPages}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.navBtn, currentPage === totalPages - 1 && styles.navBtnDisabled]}
              onPress={handleNextPage}
              disabled={currentPage === totalPages - 1}
            >
              <Text style={styles.navBtnText}>Next ›</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const webImageStyle = {
  maxWidth: '100%',
  maxHeight: '100%',
  objectFit: 'contain',
  userSelect: 'none',
  WebkitUserSelect: 'none',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#222222',
    backgroundColor: '#0a0a0a',
    zIndex: 100,
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#111111',
    borderWidth: 0.5,
    borderColor: '#333333',
  },
  closeText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 14,
  },
  manualTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  pageCountText: {
    color: '#888888',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '300',
  },
  viewerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  webImageStyle: webImageStyle,
  pageImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.75,
  },
  loaderContainer: {
    position: 'absolute',
    zIndex: 10,
    alignItems: 'center',
  },
  fallbackContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  fallbackText: {
    color: '#666666',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
    fontWeight: '300',
  },
  arrowButton: {
    position: 'absolute',
    top: '45%',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderWidth: 0.5,
    borderColor: '#555555',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
  },
  leftArrow: {
    left: 16,
  },
  rightArrow: {
    right: 16,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#0a0a0a',
    borderTopWidth: 0.5,
    borderTopColor: '#222222',
    zIndex: 100,
  },
  navBtn: {
    backgroundColor: '#111111',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#333333',
  },
  navBtnDisabled: {
    opacity: 0.3,
  },
  navBtnText: {
    color: '#ffffff',
    fontWeight: '400',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  pagePill: {
    backgroundColor: '#111111',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#333333',
  },
  pagePillText: {
    color: '#ffffff',
    fontWeight: '500',
    fontSize: 13,
  },
});

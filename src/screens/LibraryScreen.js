import React, { useState, useRef, useEffect } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, Modal, ScrollView, Image, TextInput, Alert, ActivityIndicator, LayoutAnimation, Platform, UIManager, Animated } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/theme';
import { ScreenshotGallery } from '../components/ScreenshotGallery';
import { searchGamesFromIGDB } from '../api/igdb';

export const LibraryScreen = ({ library, onSaveToLibrary, onRemoveFromLibrary }) => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [sortOption, setSortOption] = useState('recent');
  const [showSort, setShowSort] = useState(false);
  const sortAnim = useRef(new Animated.Value(0)).current;
  const listOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(sortAnim, {
      toValue: showSort ? 1 : 0,
      friction: 8,
      tension: 60,
      useNativeDriver: false,
    }).start();
  }, [showSort]);

  // Add Game Modal States
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [addSearchQuery, setAddSearchQuery] = useState('');
  const [addSearchResults, setAddSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Collection Stats (Owned = Played + Backlog)
  const playedCount = library.filter(g => g.status === 'played').length;
  const backlogCount = library.filter(g => g.status === 'backlog').length;
  const wishlistCount = library.filter(g => g.status === 'wishlist').length;
  const allCount = library.filter(g => g.status !== 'passed').length;
  const totalOwnedCount = playedCount + backlogCount;

  const tabs = [
    { id: 'all', label: 'All', count: allCount },
    { id: 'backlog', label: 'Backlog', count: backlogCount },
    { id: 'wishlist', label: 'Wishlist', count: wishlistCount },
    { id: 'played', label: 'Played', count: playedCount },
  ];

  const handleSearchIGDB = async () => {
    if (!addSearchQuery.trim()) return;
    setIsSearching(true);
    const { data, error } = await searchGamesFromIGDB(addSearchQuery);
    if (!error) {
      setAddSearchResults(data);
    } else {
      setAddSearchResults([]);
    }
    setIsSearching(false);
  };

  const handleAddGame = (game, status) => {
    onSaveToLibrary({ ...game, status });
  };

  const getBadgeStyle = (status) => {
    if (status === 'played') return { color: '#32d74b', borderColor: '#32d74b', label: 'PLAYED' };
    if (status === 'backlog') return { color: '#0a84ff', borderColor: '#0a84ff', label: 'BACKLOG' };
    if (status === 'wishlist') return { color: '#fff', borderColor: '#fff', label: 'WISHLIST' };
    return { color: '#888', borderColor: '#888', label: status };
  };

  let visibleLibrary = library.filter(g => {
    if (g.status === 'passed') return false;
    
    // Tab filtering
    if (activeTab !== 'all' && g.status !== activeTab) return false;
    
    // Search filtering
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const titleMatch = g.title && g.title.toLowerCase().includes(q);
      const devMatch = g.developer && g.developer.toLowerCase().includes(q);
      if (!titleMatch && !devMatch) return false;
    }
    
    return true;
  });

  if (sortOption === 'title') {
    visibleLibrary.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  } else if (sortOption === 'rating') {
    visibleLibrary.sort((a, b) => (b.ratingScore || 0) - (a.ratingScore || 0));
  } else if (sortOption === 'year') {
    visibleLibrary.sort((a, b) => (b.releaseYear || 0) - (a.releaseYear || 0));
  }

  const renderItem = ({ item }) => {
    const badge = getBadgeStyle(item.status);
    return (
      <TouchableOpacity style={styles.timelineItem} onPress={() => setSelectedGame(item)}>
        {item.coverUrl ? (
          <Image source={{ uri: item.coverUrl }} style={styles.timelineImage} />
        ) : (
          <View style={styles.timelineImagePlaceholder}>
            <Ionicons name="game-controller-outline" size={24} color="#555" />
          </View>
        )}
        <View style={styles.timelineContent}>
          <View style={styles.timelineHeaderRow}>
            <Text style={styles.timelineTitle} numberOfLines={2}>{item.title}</Text>
            {activeTab === 'all' && (
              <View style={[styles.statusBadge, { borderColor: badge.borderColor }]}>
                <Text style={[styles.statusBadgeText, { color: badge.color }]}>{badge.label}</Text>
              </View>
            )}
          </View>
          <Text style={styles.timelineSub} numberOfLines={1}>{item.developer}</Text>
          <Text style={styles.timelineDate}>Logged {item.loggedAt}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    let icon = 'archive-outline';
    let title = 'Library Empty';
    let sub = 'Swipe games on The Stack to build your timeline.';

    if (activeTab === 'backlog') {
      icon = 'layers-outline';
      title = 'Backlog Clear';
      sub = 'You have no games in your backlog. Time to hit The Stack!';
    } else if (activeTab === 'wishlist') {
      icon = 'gift-outline';
      title = 'Wishlist Empty';
      sub = 'Swipe UP on The Stack to add games you want to buy.';
    } else if (activeTab === 'played') {
      icon = 'game-controller-outline';
      title = 'No Games Played';
      sub = 'Swipe RIGHT on The Stack to log games you\'ve beaten.';
    }

    return (
      <View style={styles.centerStage}>
        <Ionicons name={icon} size={64} color="#333" />
        <Text style={styles.emptyStateText}>{title}</Text>
        <Text style={styles.subText}>{sub}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screenHeader}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Text style={styles.screenTitle}>Vault & Timeline</Text>
          <TouchableOpacity onPress={() => setIsAddModalVisible(true)}>
            <Ionicons name="add-circle" size={32} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Collection Total Stat Banner */}
        <View style={styles.collectionStatBanner}>
          <Ionicons name="library-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.collectionStatTitle}>Collection Total:</Text>
          <Text style={styles.collectionStatCount}>{totalOwnedCount} {totalOwnedCount === 1 ? 'Game' : 'Games'} Owned</Text>
          <Text style={styles.collectionStatBreakdown}>({playedCount} Played • {backlogCount} Backlog)</Text>
        </View>
      </View>

      {/* Search Bar & Sort Toggle */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 15, marginTop: 15, alignItems: 'center' }}>
        <View style={[styles.searchBarContainer, { flex: 1, marginTop: 0, marginHorizontal: 0 }]}>
          <Ionicons name="search" size={20} color="#888" />
          <TextInput
            style={styles.searchBarInput}
            placeholder="Search your library..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>
        <TouchableOpacity 
          style={{ marginLeft: 10, padding: 10, backgroundColor: '#0a0a0a', borderRadius: 8, borderWidth: 0.5, borderColor: showSort ? '#fff' : '#333' }}
          onPress={() => setShowSort(!showSort)}
        >
          <Ionicons name="filter" size={20} color={showSort ? '#fff' : '#888'} />
        </TouchableOpacity>
      </View>

      {/* Sort Options Row */}
      <Animated.View style={{ 
        height: sortAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 60] }), 
        opacity: sortAnim,
        overflow: 'hidden' 
      }}>
        <View style={{ height: 45, marginTop: 10, marginBottom: 5 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 15 }} contentContainerStyle={{ paddingRight: 30, alignItems: 'center' }}>
            {[
            { id: 'recent', label: 'Recently Added' },
            { id: 'title', label: 'A-Z' },
            { id: 'rating', label: 'Top Rated' },
            { id: 'year', label: 'Newest Release' }
          ].map(opt => (
            <TouchableOpacity 
              key={opt.id}
              style={[styles.libraryTab, { marginRight: 10 }, sortOption === opt.id && styles.libraryTabActive]}
              onPress={() => {
                if (sortOption === opt.id) return;
                Animated.timing(listOpacity, {
                  toValue: 0,
                  duration: 150,
                  useNativeDriver: true
                }).start(() => {
                  setSortOption(opt.id);
                  Animated.timing(listOpacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();
                });
              }}
            >
              <Text style={[styles.libraryTabText, sortOption === opt.id && styles.libraryTabTextActive]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
          </ScrollView>
        </View>
      </Animated.View>

      {/* Segmented Control */}
      <View style={styles.libraryTabsRow}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.libraryTab, activeTab === tab.id && styles.libraryTabActive]}
            onPress={() => {
              if (activeTab === tab.id) return;
              Animated.timing(listOpacity, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true
              }).start(() => {
                setActiveTab(tab.id);
                Animated.timing(listOpacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();
              });
            }}
          >
            <Text style={[styles.libraryTabText, activeTab === tab.id && styles.libraryTabTextActive]}>
              {tab.label} ({tab.count})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Animated.View style={{ flex: 1, opacity: listOpacity }}>
        {visibleLibrary.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={visibleLibrary}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
          />
        )}
      </Animated.View>

      <Modal visible={!!selectedGame} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.passportContainer}>
            {selectedGame && (
              <>
                <View style={styles.passportHeader}>
                  <Text style={styles.passportTitle}>{selectedGame.title}</Text>
                  <TouchableOpacity onPress={() => setSelectedGame(null)}>
                    <Ionicons name="close-circle" size={32} color="#555" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.passportDev}>{selectedGame.developer}</Text>
                
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={styles.passportDesc}>{selectedGame.description}</Text>

                {(selectedGame.screenshots?.length > 0 || selectedGame.coverUrl) && (
                  <View style={{ marginBottom: 15, marginTop: 10 }}>
                    <Text style={styles.specsHeader}>SCREENSHOTS</Text>
                    <ScreenshotGallery screenshots={selectedGame.screenshots?.length > 0 ? selectedGame.screenshots : [selectedGame.coverUrl]} />
                  </View>
                )}

                <View style={styles.divider} />

                <Text style={styles.specsHeader}>PLAYER RESPECT SPECS</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Category</Text>
                  <Text style={styles.detailValue}>{selectedGame.vibe}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Est. Session</Text>
                  <Text style={styles.detailValue}>{selectedGame.time}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Pause Anytime</Text>
                  <Text style={[styles.detailValue, { color: selectedGame.isPauseable ? '#32d74b' : '#ff453a' }]}>
                    {selectedGame.isPauseable ? 'Yes' : 'No'}
                  </Text>
                </View>

                {/* Trojan Horse Phase Placeholder */}
                <View style={styles.trojanBox}>
                  <Ionicons name="document-text-outline" size={20} color="#666" />
                  <Text style={styles.trojanText}>Session Notes & Vault Documents (Trojan Horse Phase)</Text>
                </View>

                {/* Edit Controls */}
                <View style={styles.editStatusContainer}>
                  <Text style={styles.specsHeader}>EDIT STATUS</Text>
                  <View style={styles.editStatusRow}>
                    <TouchableOpacity 
                      style={[styles.editStatusButton, selectedGame.status === 'backlog' && styles.editStatusButtonActive]}
                      onPress={() => {
                        const updatedGame = { ...selectedGame, status: 'backlog' };
                        setSelectedGame(updatedGame);
                        onSaveToLibrary(updatedGame);
                      }}
                    >
                      <Ionicons name="layers-outline" size={20} color={selectedGame.status === 'backlog' ? '#000' : '#888'} />
                      <Text style={[styles.editStatusButtonText, selectedGame.status === 'backlog' && styles.editStatusButtonTextActive]}>Backlogged</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.editStatusButton, selectedGame.status === 'wishlist' && styles.editStatusButtonActive]}
                      onPress={() => {
                        const updatedGame = { ...selectedGame, status: 'wishlist' };
                        setSelectedGame(updatedGame);
                        onSaveToLibrary(updatedGame);
                      }}
                    >
                      <Ionicons name="gift-outline" size={20} color={selectedGame.status === 'wishlist' ? '#000' : '#888'} />
                      <Text style={[styles.editStatusButtonText, selectedGame.status === 'wishlist' && styles.editStatusButtonTextActive]}>Wishlisted</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.editStatusButton, selectedGame.status === 'played' && styles.editStatusButtonActive]}
                      onPress={() => {
                        const updatedGame = { ...selectedGame, status: 'played' };
                        setSelectedGame(updatedGame);
                        onSaveToLibrary(updatedGame);
                      }}
                    >
                      <Ionicons name="game-controller-outline" size={20} color={selectedGame.status === 'played' ? '#000' : '#888'} />
                      <Text style={[styles.editStatusButtonText, selectedGame.status === 'played' && styles.editStatusButtonTextActive]}>Playing/Played</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Remove Button */}
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => setIsConfirmingDelete(true)}
                >
                  <Ionicons name="trash-outline" size={20} color="#ff453a" />
                  <Text style={styles.removeButtonText}>Remove from Library</Text>
                </TouchableOpacity>

              </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Custom Confirmation Modal */}
      <Modal visible={isConfirmingDelete} transparent={true} animationType="fade">
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmDialog}>
            <Ionicons name="warning-outline" size={48} color="#ff453a" style={{ marginBottom: 15 }} />
            <Text style={styles.confirmTitle}>Remove Game?</Text>
            <Text style={styles.confirmText}>
              Are you sure you want to remove {selectedGame?.title} from your library? This cannot be undone.
            </Text>
            <View style={styles.confirmButtonRow}>
              <TouchableOpacity 
                style={styles.confirmCancelBtn} 
                onPress={() => setIsConfirmingDelete(false)}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmDeleteBtn} 
                onPress={() => {
                  onRemoveFromLibrary(selectedGame.id);
                  setIsConfirmingDelete(false);
                  setSelectedGame(null);
                }}
              >
                <Text style={styles.confirmDeleteText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Game Modal */}
      <Modal visible={isAddModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.addModalContainer}>
            <View style={styles.addModalHeader}>
              <Text style={styles.addModalTitle}>Add Game</Text>
              <TouchableOpacity onPress={() => {
                setIsAddModalVisible(false);
                setAddSearchQuery('');
                setAddSearchResults([]);
              }}>
                <Ionicons name="close-circle" size={32} color="#555" />
              </TouchableOpacity>
            </View>

            <View style={styles.addSearchRow}>
              <TextInput
                style={styles.addSearchInput}
                placeholder="Search database..."
                placeholderTextColor="#666"
                value={addSearchQuery}
                onChangeText={setAddSearchQuery}
                onSubmitEditing={handleSearchIGDB}
                returnKeyType="search"
                autoFocus={true}
              />
              <TouchableOpacity style={styles.addSearchBtn} onPress={handleSearchIGDB}>
                <Ionicons name="search" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {isSearching ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
            ) : (
              <FlatList
                data={addSearchResults}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={() => (
                  addSearchQuery.length > 0 && addSearchResults.length === 0 ? (
                    <Text style={styles.addEmptyText}>No games found.</Text>
                  ) : null
                )}
                renderItem={({ item }) => {
                  const isInLibrary = library.some(g => g.id === item.id);
                  return (
                    <View style={styles.addResultItem}>
                      {item.coverUrl ? (
                        <Image source={{ uri: item.coverUrl }} style={styles.addResultImage} />
                      ) : (
                        <View style={styles.addResultImage} />
                      )}
                      <View style={styles.addResultInfo}>
                        <Text style={styles.addResultTitle} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.addResultDev} numberOfLines={1}>{item.developer}</Text>
                      </View>
                      {isInLibrary ? (
                        <View style={[styles.addResultBtn, styles.addResultBtnAdded]}>
                          <Text style={[styles.addResultBtnText, styles.addResultBtnTextAdded]}>Added</Text>
                        </View>
                      ) : (
                        <TouchableOpacity 
                          style={styles.addResultBtn}
                          onPress={() => handleAddGame(item, 'backlog')}
                        >
                          <Text style={styles.addResultBtnText}>+ Add</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                }}
              />
            )}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

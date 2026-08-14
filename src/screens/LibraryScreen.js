import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, Modal, ScrollView, Image, TextInput, Alert, ActivityIndicator, LayoutAnimation, Platform, UIManager, Animated } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/theme';
import ReaderModal from '../components/ReaderModal';
import MapViewerModal from '../components/MapViewerModal';
import AddGameProfileModal from '../components/AddGameProfileModal';
import EditGameProfileModal from '../components/EditGameProfileModal';
import { UpdateJournalModal } from '../components/UpdateJournalModal';
import { ScreenshotGallery } from '../components/ScreenshotGallery';
import { processGameProfileAsset } from '../utils/vaultStorage';

const CONSOLE_FILTERS = [
  'ALL',
  'NES', 'SNES', 'N64', 'GameCube', 'Wii', 'Wii U', 'Switch',
  'Game Boy', 'Game Boy Color', 'Game Boy Advance', 'Nintendo DS', 'Nintendo 3DS',
  'PS1', 'PS2', 'PS3', 'PS4', 'PS5', 'PSP', 'PS Vita',
  'Xbox', 'Xbox 360', 'Xbox One', 'Xbox Series X/S',
  'Sega Master System', 'Genesis', 'Sega CD', 'Sega Saturn', 'Dreamcast', 'Game Gear',
  'Atari 2600', 'Atari 5200', 'Atari 7800', 'Atari Jaguar', 'Atari Lynx',
  'Neo Geo', 'Neo Geo Pocket', 'TurboGrafx-16', '3DO', 'CD-i', 'Intellivision', 'ColecoVision',
  'Amiga', 'Commodore 64', 'ZX Spectrum', 'MSX',
  'Arcade', 'PC', 'Mac', 'Linux', 'Mobile', 'Other'
];

export const LibraryScreen = ({ library, onSaveToLibrary, onRemoveFromLibrary, onResetLibrary }) => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const [sortOption, setSortOption] = useState('recent');
  const [selectedSystemFilter, setSelectedSystemFilter] = useState('ALL');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [isPassportSystemModalVisible, setIsPassportSystemModalVisible] = useState(false);
  const [isJournalModalVisible, setIsJournalModalVisible] = useState(false);
  const [activeManual, setActiveManual] = useState(null);
  const [activeMap, setActiveMap] = useState(null);
  const [isCustomAddVisible, setIsCustomAddVisible] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const listOpacity = useRef(new Animated.Value(1)).current;

  // Add Game Modal States
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [addSearchQuery, setAddSearchQuery] = useState('');
  const [addSearchResults, setAddSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Single-pass Collection Stats (Owned = Playing + Backlog + Played)
  const { playingCount, backlogCount, wishlistCount, playedCount, allCount, totalOwnedCount } = useMemo(() => {
    let playing = 0;
    let backlog = 0;
    let wishlist = 0;
    let played = 0;
    for (let i = 0; i < library.length; i++) {
      const status = library[i].status;
      if (status === 'playing') playing++;
      else if (status === 'backlog') backlog++;
      else if (status === 'wishlist') wishlist++;
      else if (status === 'played') played++;
    }
    return {
      playingCount: playing,
      backlogCount: backlog,
      wishlistCount: wishlist,
      playedCount: played,
      allCount: playing + backlog + wishlist + played,
      totalOwnedCount: playing + backlog + played,
    };
  }, [library]);

  const tabs = [
    { id: 'all', label: 'All', count: allCount },
    { id: 'playing', label: 'Playing', count: playingCount },
    { id: 'backlog', label: 'Backlog', count: backlogCount },
    { id: 'wishlist', label: 'Wishlist', count: wishlistCount },
    { id: 'played', label: 'Played', count: playedCount },
  ];

  const handleSearchIGDB = async () => {
    const trimmed = addSearchQuery.trim();
    if (!trimmed) {
      setAddSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const { data, error } = await searchGamesFromIGDB(trimmed);
    if (!error && data) {
      setAddSearchResults(data);
    } else {
      setAddSearchResults([]);
    }
    setIsSearching(false);
  };

  // Debounced auto-search as the user types
  useEffect(() => {
    if (!isAddModalVisible) return;
    const trimmed = addSearchQuery.trim();
    if (!trimmed) {
      setAddSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      const { data, error } = await searchGamesFromIGDB(trimmed);
      if (!error && data) {
        setAddSearchResults(data);
      } else {
        setAddSearchResults([]);
      }
      setIsSearching(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [addSearchQuery, isAddModalVisible]);

  const handleAddGame = (game, status) => {
    onSaveToLibrary({ ...game, status });
    setSearchQuery('');
    setActiveTab(status === 'passed' ? 'all' : status);
  };

  const getBadgeStyle = (status) => {
    if (status === 'playing') return { color: '#ff9f0a', borderColor: '#ff9f0a', label: 'NOW PLAYING' };
    if (status === 'played') return { color: '#32d74b', borderColor: '#32d74b', label: 'PLAYED' };
    if (status === 'backlog') return { color: '#0a84ff', borderColor: '#0a84ff', label: 'BACKLOG' };
    if (status === 'wishlist') return { color: '#fff', borderColor: '#fff', label: 'WISHLIST' };
    return { color: '#888', borderColor: '#888', label: status };
  };

  const visibleLibrary = useMemo(() => {
    let filtered = library.filter(g => {
      if (g.status === 'passed') return false;
      
      // Tab filtering
      if (activeTab !== 'all' && g.status !== activeTab) return false;

      // Console System filtering
      if (selectedSystemFilter !== 'ALL') {
        const sys = (g.system || g.developer || '').toUpperCase();
        if (!sys.includes(selectedSystemFilter.toUpperCase())) return false;
      }
      
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
      return [...filtered].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (sortOption === 'rating') {
      return [...filtered].sort((a, b) => (b.ratingScore || 0) - (a.ratingScore || 0));
    } else if (sortOption === 'year') {
      return [...filtered].sort((a, b) => (b.releaseYear || 0) - (a.releaseYear || 0));
    }

    return filtered;
  }, [library, activeTab, searchQuery, sortOption, selectedSystemFilter]);

  const renderItem = ({ item }) => {
    const badge = getBadgeStyle(item.status);
    const coverUri = (item.coverUrl || item.coverUri || '').trim();
    return (
      <TouchableOpacity style={styles.timelineItem} onPress={() => setSelectedGame(item)}>
        {coverUri.length > 0 ? (
          <Image source={{ uri: coverUri }} style={styles.timelineImage} />
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

    if (activeTab === 'playing') {
      icon = 'play-circle-outline';
      title = 'No Games In Progress';
      sub = 'Mark games as Now Playing to track what you\'re active on this week.';
    } else if (activeTab === 'backlog') {
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
      sub = 'Swipe RIGHT on The Stack or mark games as Played once you\'ve played them.';
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
          <Text style={styles.collectionStatBreakdown}>({playingCount} Playing • {backlogCount} Backlog • {playedCount} Played)</Text>
        </View>
      </View>

      {/* Search Bar & Filter Toggle */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 15, marginTop: 15, alignItems: 'center' }}>
        <View style={[styles.searchBarContainer, { flex: 1, marginTop: 0, marginHorizontal: 0, marginBottom: 0 }]}>
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
          style={{ marginLeft: 10, padding: 10, backgroundColor: '#0a0a0a', borderRadius: 8, borderWidth: 0.5, borderColor: '#333' }}
          onPress={() => setIsFilterModalVisible(true)}
        >
          <Ionicons name="filter" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Segmented Control / Disposition Tabs */}
      <View style={[styles.libraryTabsRow, { marginTop: 15, flexWrap: 'wrap' }]}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.libraryTab, activeTab === tab.id && styles.libraryTabActive]}
            onPress={() => {
              if (activeTab === tab.id) return;
              setSearchQuery('');
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
                  <Text style={styles.passportTitle}>{selectedGame.title || selectedGame.name || 'Untitled Game'}</Text>
                  <TouchableOpacity onPress={() => {
                    if (selectedGame) onSaveToLibrary(selectedGame);
                    setSelectedGame(null);
                  }}>
                    <Ionicons name="close-circle" size={32} color="#555" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.passportDev}>{selectedGame.developer || selectedGame.system || 'Unknown Developer'}</Text>
                
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={styles.passportDesc}>{selectedGame.description || selectedGame.summary || 'No overview available for this game profile.'}</Text>

                {(() => {
                  const coverUri = (selectedGame.coverUrl || selectedGame.coverUri || '').trim();
                  const validScreenshots = (selectedGame.screenshots || []).filter(s => typeof s === 'string' && s.trim().length > 0);
                  const galleryImages = validScreenshots.length > 0 ? validScreenshots : (coverUri ? [coverUri] : []);
                  if (galleryImages.length === 0) return null;
                  return (
                    <View style={{ marginBottom: 15, marginTop: 10 }}>
                      <Text style={styles.specsHeader}>SCREENSHOTS</Text>
                      <ScreenshotGallery screenshots={galleryImages} />
                    </View>
                  );
                })()}

                <View style={styles.divider} />

                <Text style={styles.specsHeader}>PLAYER RESPECT SPECS</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Category</Text>
                  <Text style={styles.detailValue}>{selectedGame.vibe || 'Classic Retro'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Est. Session</Text>
                  <Text style={styles.detailValue}>{selectedGame.time || '30-45 mins'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Pause Anytime</Text>
                  <Text style={[styles.detailValue, { color: selectedGame.isPauseable !== false ? '#32d74b' : '#ff453a' }]}>
                    {selectedGame.isPauseable !== false ? 'Yes' : 'No'}
                  </Text>
                </View>

                {/* Session Notes & Vault Journal Suite */}
                <View style={{ marginTop: 20 }}>
                  <Text style={styles.specsHeader}>SESSION NOTES & VAULT JOURNAL</Text>
                  
                  {/* Console System Selector (Passport) */}
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: '#0a0a0a',
                      borderWidth: 0.5,
                      borderColor: '#333',
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderRadius: 8,
                      marginVertical: 12
                    }}
                    onPress={() => setIsPassportSystemModalVisible(true)}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="game-controller-outline" size={18} color="#888" style={{ marginRight: 8 }} />
                      <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>
                        {selectedGame.system || 'Unknown'}
                      </Text>
                    </View>
                    <Ionicons name="chevron-down" size={18} color="#888" />
                  </TouchableOpacity>

                  {/* Update Journal Button */}
                  <TouchableOpacity 
                    style={{ backgroundColor: '#111', borderWidth: 0.5, borderColor: '#fff', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginBottom: 15 }}
                    onPress={() => setIsJournalModalVisible(true)}
                  >
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '500', letterSpacing: 1.5, textTransform: 'uppercase' }}>Update Journal Entry</Text>
                  </TouchableOpacity>

                  {/* Vault Document Launchers */}
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
                    {selectedGame.manual && (
                       <TouchableOpacity 
                        style={{ flex: 1, backgroundColor: '#111', borderWidth: 0.5, borderColor: '#fff', paddingVertical: 11, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
                        onPress={() => setActiveManual(selectedGame.manual)}
                      >
                        <Ionicons name="book-outline" size={15} color="#fff" style={{ marginRight: 6 }} />
                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '500', letterSpacing: 1, textTransform: 'uppercase' }}>Read Manual</Text>
                      </TouchableOpacity>
                    )}

                    {selectedGame.map && (
                      <TouchableOpacity 
                        style={{ flex: 1, backgroundColor: '#111', borderWidth: 0.5, borderColor: '#fff', paddingVertical: 11, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
                        onPress={() => setActiveMap(selectedGame.map)}
                      >
                        <Ionicons name="map-outline" size={15} color="#fff" style={{ marginRight: 6 }} />
                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '500', letterSpacing: 1, textTransform: 'uppercase' }}>View Map</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity 
                      style={{ backgroundColor: '#111', borderWidth: 0.5, borderColor: '#444', paddingVertical: 11, paddingHorizontal: 14, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
                      onPress={() => setEditingProfile(selectedGame)}
                    >
                      <Ionicons name="create-outline" size={15} color="#aaa" style={{ marginRight: 4 }} />
                      <Text style={{ color: '#aaa', fontSize: 12, fontWeight: '500', letterSpacing: 1, textTransform: 'uppercase' }}>Edit Profile</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Edit Controls */}
                <View style={styles.editStatusContainer}>
                  <Text style={styles.specsHeader}>EDIT STATUS</Text>
                  <View style={styles.editStatusRow}>
                    <TouchableOpacity 
                      style={[styles.editStatusButton, selectedGame.status === 'playing' && styles.editStatusButtonActive]}
                      onPress={() => {
                        const updatedGame = { ...selectedGame, status: 'playing' };
                        setSelectedGame(updatedGame);
                        onSaveToLibrary(updatedGame);
                      }}
                    >
                      <Ionicons name="play-circle-outline" size={20} color={selectedGame.status === 'playing' ? '#000' : '#888'} />
                      <Text style={[styles.editStatusButtonText, selectedGame.status === 'playing' && styles.editStatusButtonTextActive]}>Now Playing</Text>
                    </TouchableOpacity>

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
                      <Text style={[styles.editStatusButtonText, selectedGame.status === 'played' && styles.editStatusButtonTextActive]}>Played</Text>
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

      {/* Passport System Selection Modal */}
      <Modal visible={isPassportSystemModalVisible} transparent={true} animationType="fade">
        <TouchableOpacity 
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' }} 
          activeOpacity={1} 
          onPress={() => setIsPassportSystemModalVisible(false)}
        >
          <View style={{ width: '85%', maxHeight: '75%', backgroundColor: '#111', borderRadius: 12, borderWidth: 0.5, borderColor: '#333', overflow: 'hidden' }}>
            <View style={{ padding: 15, borderBottomWidth: 0.5, borderBottomColor: '#222', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Select Console System</Text>
              <TouchableOpacity onPress={() => setIsPassportSystemModalVisible(false)}>
                <Ionicons name="close" size={24} color="#888" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={CONSOLE_FILTERS.slice(1)}
              keyExtractor={item => item}
              showsVerticalScrollIndicator={true}
              renderItem={({ item }) => {
                const isActive = selectedGame?.system === item;
                return (
                  <TouchableOpacity
                    style={{ padding: 15, borderBottomWidth: 0.5, borderBottomColor: '#222', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: isActive ? '#1a1a1a' : '#111' }}
                    onPress={() => {
                      if (selectedGame) {
                        const updated = { ...selectedGame, system: item };
                        setSelectedGame(updated);
                        onSaveToLibrary(updated);
                      }
                      setIsPassportSystemModalVisible(false);
                    }}
                  >
                    <Text style={{ color: isActive ? '#fff' : '#ccc', fontSize: 15, fontWeight: isActive ? 'bold' : 'normal' }}>{item}</Text>
                    {isActive && <Ionicons name="checkmark" size={20} color="#fff" />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Filter & Sort Selection Modal */}
      <Modal visible={isFilterModalVisible} transparent={true} animationType="fade">
        <TouchableOpacity 
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end', alignItems: 'center' }} 
          activeOpacity={1} 
          onPress={() => setIsFilterModalVisible(false)}
        >
          <View style={{ width: '100%', maxHeight: '85%', backgroundColor: '#111', borderTopLeftRadius: 16, borderTopRightRadius: 16, borderWidth: 0.5, borderColor: '#333', overflow: 'hidden' }}>
            <View style={{ padding: 15, borderBottomWidth: 0.5, borderBottomColor: '#222', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Filter & Sort</Text>
              <TouchableOpacity onPress={() => setIsFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color="#888" />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Sort By Section */}
              <View style={{ padding: 15, borderBottomWidth: 0.5, borderBottomColor: '#222' }}>
                <Text style={{ color: '#888', fontSize: 12, fontWeight: 'bold', marginBottom: 10 }}>SORT BY</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                  {[
                    { id: 'recent', label: 'Recently Added' },
                    { id: 'title', label: 'A-Z' },
                    { id: 'rating', label: 'Top Rated' },
                    { id: 'year', label: 'Newest Release' }
                  ].map(opt => (
                    <TouchableOpacity
                      key={opt.id}
                      style={{
                        paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20,
                        backgroundColor: sortOption === opt.id ? '#fff' : '#1a1a1a',
                        borderWidth: 0.5, borderColor: sortOption === opt.id ? '#fff' : '#333'
                      }}
                      onPress={() => {
                        setSortOption(opt.id);
                        setIsFilterModalVisible(false);
                      }}
                    >
                      <Text style={{ color: sortOption === opt.id ? '#000' : '#888', fontSize: 13, fontWeight: '600' }}>{opt.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* System Filter Section */}
              <View style={{ padding: 15 }}>
                <Text style={{ color: '#888', fontSize: 12, fontWeight: 'bold', marginBottom: 10 }}>FILTER BY SYSTEM</Text>
                {CONSOLE_FILTERS.map((item) => {
                  const isActive = selectedSystemFilter === item;
                  return (
                    <TouchableOpacity
                      key={item}
                      style={{ paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#222', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: isActive ? '#1a1a1a' : 'transparent', paddingHorizontal: isActive ? 10 : 0, borderRadius: isActive ? 6 : 0, marginVertical: 2 }}
                      onPress={() => {
                        setSelectedSystemFilter(item);
                        setIsFilterModalVisible(false);
                      }}
                    >
                      <Text style={{ color: isActive ? '#fff' : '#ccc', fontSize: 15, fontWeight: isActive ? 'bold' : 'normal' }}>{item}</Text>
                      {isActive && <Ionicons name="checkmark" size={20} color="#fff" />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
            
            {/* Danger Zone: Reset Library */}
            <View style={{ padding: 15, borderTopWidth: 0.5, borderTopColor: '#333' }}>
              <TouchableOpacity
                style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#3a0000', paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ff453a' }}
                onPress={() => {
                  setIsFilterModalVisible(false);
                  setIsConfirmingReset(true);
                }}
              >
                <Ionicons name="warning-outline" size={18} color="#ff453a" style={{ marginRight: 8 }} />
                <Text style={{ color: '#ff453a', fontWeight: 'bold' }}>Reset Library Data</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Reset Confirmation Modal */}
      <Modal visible={isConfirmingReset} transparent={true} animationType="fade">
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmDialog}>
            <Ionicons name="skull-outline" size={48} color="#ff453a" style={{ marginBottom: 15 }} />
            <Text style={styles.confirmTitle}>Wipe Entire Library?</Text>
            <Text style={styles.confirmText}>
              This will permanently delete all your saved games, journals, and status tracking. It cannot be undone. Are you sure you want to start fresh?
            </Text>
            <View style={styles.confirmButtonRow}>
              <TouchableOpacity 
                style={styles.confirmCancelBtn} 
                onPress={() => setIsConfirmingReset(false)}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmDeleteBtn} 
                onPress={() => {
                  if (onResetLibrary) onResetLibrary();
                  setIsConfirmingReset(false);
                }}
              >
                <Text style={styles.confirmDeleteText}>Wipe Data</Text>
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

            <TouchableOpacity 
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111', borderWidth: 0.5, borderColor: '#444', paddingVertical: 11, paddingHorizontal: 16, borderRadius: 8, marginVertical: 10 }}
              onPress={() => {
                setIsAddModalVisible(false);
                setIsCustomAddVisible(true);
              }}
            >
              <Ionicons name="add-circle-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '500', letterSpacing: 1.2, textTransform: 'uppercase' }}>Create Custom Profile (Manuals & Maps)</Text>
            </TouchableOpacity>

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

      {/* Retro Vault Document Modals */}
      <ReaderModal
        visible={!!activeManual}
        manual={activeManual}
        onClose={() => setActiveManual(null)}
      />

      <MapViewerModal
        visible={!!activeMap}
        map={activeMap}
        title={selectedGame ? selectedGame.title : ''}
        onClose={() => setActiveMap(null)}
      />

      <UpdateJournalModal 
        visible={isJournalModalVisible}
        game={selectedGame}
        onClose={() => setIsJournalModalVisible(false)}
        onSave={(updated) => {
          setSelectedGame(updated);
          onSaveToLibrary(updated);
        }}
      />

      <AddGameProfileModal
        visible={isCustomAddVisible}
        onClose={() => setIsCustomAddVisible(false)}
        onSave={async (profileData) => {
          const gameProfile = await processGameProfileAsset(profileData);
          onSaveToLibrary(gameProfile);
          setActiveTab('backlog');
        }}
      />

      <EditGameProfileModal
        visible={!!editingProfile}
        profile={editingProfile}
        onClose={() => setEditingProfile(null)}
        onSave={async (id, updateData) => {
          const updatedProfile = await processGameProfileAsset({ id, ...updateData, existingProfile: editingProfile });
          setSelectedGame(updatedProfile);
          onSaveToLibrary(updatedProfile);
        }}
      />

    </SafeAreaView>
  );
};

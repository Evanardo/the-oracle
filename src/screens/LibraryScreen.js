import React, { useState } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, Modal, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/theme';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'backlog', label: 'Backlog' },
  { id: 'wishlist', label: 'Wishlist' },
  { id: 'played', label: 'Played' },
];

export const LibraryScreen = ({ library }) => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const getBadgeStyle = (status) => {
    if (status === 'played') return { color: '#32d74b', borderColor: '#32d74b', label: 'PLAYED' };
    if (status === 'backlog') return { color: '#0a84ff', borderColor: '#0a84ff', label: 'BACKLOG' };
    if (status === 'wishlist') return { color: '#bf5af2', borderColor: '#bf5af2', label: 'WISHLIST' };
    return { color: '#888', borderColor: '#888', label: status };
  };

  // Filter games based on the active tab
  const visibleLibrary = library.filter(g => {
    if (g.status === 'passed') return false;
    if (activeTab === 'all') return true;
    return g.status === activeTab;
  });

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
        <Text style={styles.screenTitle}>Vault & Timeline</Text>
      </View>

      {/* Segmented Control */}
      <View style={styles.libraryTabsRow}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.libraryTab, activeTab === tab.id && styles.libraryTabActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[styles.libraryTabText, activeTab === tab.id && styles.libraryTabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {visibleLibrary.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={visibleLibrary}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
          renderItem={renderItem}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
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

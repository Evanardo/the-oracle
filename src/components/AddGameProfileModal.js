import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';

const CONSOLE_SYSTEMS = [
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

export default function AddGameProfileModal({ visible, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [selectedSystem, setSelectedSystem] = useState('SNES');
  const [coverAsset, setCoverAsset] = useState(null);
  const [manualAssets, setManualAssets] = useState([]);
  const [mapAsset, setMapAsset] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSystemModalVisible, setIsSystemModalVisible] = useState(false);

  const resetForm = () => {
    setTitle('');
    setSelectedSystem('SNES');
    setCoverAsset(null);
    setManualAssets([]);
    setMapAsset(null);
    setIsSaving(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handlePickCover = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCoverAsset(result.assets[0]);
      }
    } catch (e) {
      console.warn('Pick cover failed:', e);
    }
  };

  const handlePickManual = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setManualAssets(result.assets);
      }
    } catch (e) {
      console.warn('Pick manual failed:', e);
    }
  };

  const handlePickMap = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setMapAsset(result.assets[0]);
      }
    } catch (e) {
      console.warn('Pick map failed:', e);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Required Field', 'Please enter a Game Title (e.g. Chrono Trigger).');
      return;
    }

    try {
      setIsSaving(true);
      await onSave({
        title: title.trim(),
        system: selectedSystem,
        coverAsset,
        manualAssets,
        mapAsset,
      });
      handleClose();
    } catch (err) {
      Alert.alert('Save Error', 'Failed to save game profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={handleClose}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Custom Profile</Text>
          <TouchableOpacity style={styles.saveHeaderBtn} onPress={handleSave} disabled={isSaving}>
            {isSaving ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.saveHeaderBtnText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.formContainer}>
          {/* Game Title Input */}
          <Text style={styles.label}>GAME TITLE *</Text>
          <TextInput
            style={[styles.input, { outlineStyle: 'none' }]}
            placeholder="e.g. Chrono Trigger"
            placeholderTextColor="#555555"
            value={title}
            onChangeText={setTitle}
          />

          {/* Console System Selector */}
          <Text style={styles.label}>CONSOLE SYSTEM</Text>
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
              marginBottom: 10
            }}
            onPress={() => setIsSystemModalVisible(true)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="game-controller-outline" size={18} color="#888" style={{ marginRight: 8 }} />
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>
                {selectedSystem}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={18} color="#888" />
          </TouchableOpacity>

          {/* Attachment Slots */}
          <Text style={styles.label}>VAULT ASSETS</Text>

          {/* Slot 1: Cover Image */}
          <View style={styles.slotCard}>
            <View style={styles.slotInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Ionicons name="image-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.slotTitle}>Cover Artwork</Text>
              </View>
              <Text style={styles.slotSubtitle}>
                {coverAsset ? coverAsset.name : 'Optional cover image'}
              </Text>
            </View>
            <TouchableOpacity style={styles.slotBtn} onPress={handlePickCover}>
              <Text style={styles.slotBtnText}>{coverAsset ? '✓ Attached' : '+ Pick Cover'}</Text>
            </TouchableOpacity>
          </View>

          {/* Slot 2: Manual File / Scans */}
          <View style={styles.slotCard}>
            <View style={styles.slotInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Ionicons name="book-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.slotTitle}>Game Manual</Text>
              </View>
              <Text style={styles.slotSubtitle}>
                {manualAssets.length > 0
                  ? `${manualAssets.length} file(s) attached`
                  : 'Multi-page scans or PDF'}
              </Text>
            </View>
            <TouchableOpacity style={styles.slotBtn} onPress={handlePickManual}>
              <Text style={styles.slotBtnText}>
                {manualAssets.length > 0 ? `✓ (${manualAssets.length})` : '+ Pick Manual'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Slot 3: High-Res Map */}
          <View style={styles.slotCard}>
            <View style={styles.slotInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Ionicons name="map-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.slotTitle}>Overworld / Game Map</Text>
              </View>
              <Text style={styles.slotSubtitle}>
                {mapAsset ? mapAsset.name : 'High-res image map'}
              </Text>
            </View>
            <TouchableOpacity style={styles.slotBtn} onPress={handlePickMap}>
              <Text style={styles.slotBtnText}>{mapAsset ? '✓ Attached' : '+ Pick Map'}</Text>
            </TouchableOpacity>
          </View>

          {/* Create Button */}
          <TouchableOpacity style={styles.submitBtn} onPress={handleSave} disabled={isSaving}>
            {isSaving ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={styles.submitBtnText}>Create Game Profile</Text>
            )}
          </TouchableOpacity>
        </ScrollView>

        {/* System Selection Modal */}
        <Modal visible={isSystemModalVisible} transparent={true} animationType="fade">
          <TouchableOpacity 
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' }} 
            activeOpacity={1} 
            onPress={() => setIsSystemModalVisible(false)}
          >
            <View style={{ width: '85%', maxHeight: '75%', backgroundColor: '#111', borderRadius: 12, borderWidth: 0.5, borderColor: '#333', overflow: 'hidden' }}>
              <View style={{ padding: 15, borderBottomWidth: 0.5, borderBottomColor: '#222', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Select Console System</Text>
                <TouchableOpacity onPress={() => setIsSystemModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#888" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={CONSOLE_SYSTEMS}
                keyExtractor={item => item}
                showsVerticalScrollIndicator={true}
                renderItem={({ item }) => {
                  const isActive = selectedSystem === item;
                  return (
                    <TouchableOpacity
                      style={{ padding: 15, borderBottomWidth: 0.5, borderBottomColor: '#222', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: isActive ? '#1a1a1a' : '#111' }}
                      onPress={() => {
                        setSelectedSystem(item);
                        setIsSystemModalVisible(false);
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#222222',
  },
  cancelBtnText: {
    color: '#888888',
    fontSize: 15,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  saveHeaderBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  formContainer: {
    padding: 20,
  },
  label: {
    color: '#888888',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 18,
  },
  input: {
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 15,
    borderWidth: 0.5,
    borderColor: '#333333',
    outlineStyle: 'none',
  },
  systemRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  systemPill: {
    backgroundColor: '#0a0a0a',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: '#333333',
  },
  systemPillActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  systemPillText: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '500',
  },
  systemPillTextActive: {
    color: '#000000',
    fontWeight: '600',
  },
  slotCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: '#333333',
  },
  slotInfo: {
    flex: 1,
  },
  slotTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '400',
  },
  slotSubtitle: {
    color: '#666666',
    fontSize: 12,
  },
  slotBtn: {
    backgroundColor: '#111111',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#333333',
  },
  slotBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  submitBtn: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  submitBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});

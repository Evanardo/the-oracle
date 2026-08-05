import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/theme';
import { VIBES } from '../utils/constants';
import { FlippableCard } from '../components/FlippableCard';

export const OracleScreen = ({ library }) => {
  const [selectedVibe, setSelectedVibe] = useState(null);
  const [source, setSource] = useState('backlog');
  const [recommendation, setRecommendation] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleConsultOracle = () => {
    setErrorMsg('');
    setRecommendation(null);

    const candidates = library.filter(
      game => game.status === source && (!selectedVibe || game.vibe === selectedVibe)
    );

    if (candidates.length === 0) {
      setErrorMsg(`The Oracle is silent. You have no ${source} games matching this vibe.`);
      return;
    }

    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    
    setTimeout(() => {
      setRecommendation(pick);
    }, 400);
  };

  if (recommendation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>The Oracle Speaks</Text>
        </View>
        <View style={styles.oracleResultContainer}>
          <FlippableCard 
            item={recommendation} 
            customStyle={{ position: 'relative', boxShadow: '0px 4px 10px rgba(191, 90, 242, 0.8)' }}
          />
          <TouchableOpacity 
            style={[styles.oracleButton, { marginTop: 40, backgroundColor: '#333' }]} 
            onPress={() => setRecommendation(null)}
          >
            <Ionicons name="refresh-outline" size={20} color="#fff" style={{ marginRight: 10 }} />
            <Text style={styles.oracleButtonText}>Ask Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Consult The Oracle</Text>
      </View>
      <View style={styles.oracleFormContainer}>
        
        <Text style={styles.oracleLabel}>What are you looking for?</Text>
        <View style={styles.sourceToggleRow}>
          <TouchableOpacity 
            style={[styles.sourceToggle, source === 'backlog' && styles.sourceToggleActive]}
            onPress={() => setSource('backlog')}
          >
            <Text style={[styles.sourceToggleText, source === 'backlog' && styles.sourceToggleTextActive]}>Play Tonight</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sourceToggle, source === 'wishlist' && styles.sourceToggleActive]}
            onPress={() => setSource('wishlist')}
          >
            <Text style={[styles.sourceToggleText, source === 'wishlist' && styles.sourceToggleTextActive]}>Buy Today</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.oracleLabel}>What's the vibe?</Text>
        <View style={styles.vibeGrid}>
          {VIBES.map(vibe => (
            <TouchableOpacity 
              key={vibe} 
              style={[styles.vibeChip, selectedVibe === vibe && styles.vibeChipActive]}
              onPress={() => setSelectedVibe(vibe === selectedVibe ? null : vibe)}
            >
              <Text style={[styles.vibeChipText, selectedVibe === vibe && styles.vibeChipTextActive]}>{vibe}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

        <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 40 }}>
          <TouchableOpacity style={styles.oracleButton} onPress={handleConsultOracle}>
            <Ionicons name="sparkles" size={20} color="#fff" style={{ marginRight: 10 }} />
            <Text style={styles.oracleButtonText}>Reveal Game</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
};

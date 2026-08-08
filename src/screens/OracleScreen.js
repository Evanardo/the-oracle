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
  const [isSpinning, setIsSpinning] = useState(false);
  const [rouletteGame, setRouletteGame] = useState(null);

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

    setIsSpinning(true);
    let speed = 50;
    let iterations = 0;
    const maxIterations = 20;
    const finalPick = candidates[Math.floor(Math.random() * candidates.length)];

    const spin = () => {
      const randomDisplay = candidates[Math.floor(Math.random() * candidates.length)];
      setRouletteGame(randomDisplay);

      iterations++;
      
      if (iterations < maxIterations) {
        speed = speed * 1.15; // Gradually slow down
        setTimeout(spin, speed);
      } else {
        // Lock in the final pick
        setRouletteGame(finalPick);
        setTimeout(() => {
          setIsSpinning(false);
          setRecommendation(finalPick);
        }, 600); // Pause on the final pick briefly
      }
    };

    spin();
  };

  if (isSpinning || recommendation) {
    const displayGame = isSpinning ? rouletteGame : recommendation;
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>{isSpinning ? "The Oracle is Thinking..." : "The Oracle Speaks"}</Text>
        </View>
        <View style={styles.oracleResultContainer}>
          {displayGame && (
            <FlippableCard 
              item={displayGame} 
              customStyle={{ position: 'relative', boxShadow: isSpinning ? 'none' : '0px 4px 15px rgba(255, 255, 255, 0.4)' }}
            />
          )}
          
          {!isSpinning && (
            <View style={{ position: 'absolute', bottom: 10, left: 20, right: 20 }}>
              <TouchableOpacity 
                style={styles.oracleButton} 
                onPress={() => setRecommendation(null)}
              >
                <Ionicons name="refresh-outline" size={20} color="#fff" style={{ marginRight: 10 }} />
                <Text style={styles.oracleButtonText}>Ask Again</Text>
              </TouchableOpacity>
            </View>
          )}
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

        <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 10 }}>
          <TouchableOpacity style={styles.oracleButton} onPress={handleConsultOracle}>
            <Ionicons name="sparkles" size={20} color="#fff" style={{ marginRight: 10 }} />
            <Text style={styles.oracleButtonText}>Reveal Game</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
};

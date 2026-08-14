import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PanResponder, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const ScoreSlider = ({ score = 0, onChange }) => {
  const [trackWidth, setTrackWidth] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [inputText, setInputText] = useState(String(score));
  const trackRef = useRef(null);

  useEffect(() => {
    setInputText(String(score));
  }, [score]);

  const handleFinishEditing = () => {
    setIsEditing(false);
    const clean = inputText.replace(/[^0-9]/g, '');
    if (!clean) {
      setInputText(String(score));
      return;
    }
    const numeric = parseInt(clean, 10);
    const valid = Math.max(0, Math.min(100, numeric));
    onChange(valid);
    setInputText(String(valid));
  };

  const handleLayout = (event) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  const updateScoreFromX = (pageX) => {
    if (!trackRef.current || trackWidth <= 0) return;
    trackRef.current.measure((x, y, width, height, pageXOffset) => {
      const touchX = pageX - pageXOffset;
      const percent = Math.max(0, Math.min(1, touchX / width));
      const rawScore = percent * 100;
      const newScore = Math.round(rawScore / 5) * 5; // Snap to 5-point steps
      onChange(newScore);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        updateScoreFromX(evt.nativeEvent.pageX);
      },
      onPanResponderMove: (evt) => {
        updateScoreFromX(evt.nativeEvent.pageX);
      },
    })
  ).current;

  // Score Badge Color Gradient/Tiering
  const getBadgeColor = (val) => {
    if (val >= 90) return '#FFD700'; // Gold
    if (val >= 80) return '#32d74b'; // Green
    if (val >= 70) return '#0a84ff'; // Blue
    if (val >= 50) return '#ff9f0a'; // Orange
    return '#888888'; // Muted Gray
  };

  const quickPresets = [60, 70, 75, 80, 85, 90, 95, 100];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>Overall Rating Score</Text>
        <TouchableOpacity
          onPress={() => setIsEditing(true)}
          activeOpacity={0.7}
          style={[styles.badge, { backgroundColor: getBadgeColor(score) + '25', borderColor: getBadgeColor(score) }]}
        >
          {isEditing ? (
            <View style={styles.badgeInputWrapper}>
              <TextInput
                style={[styles.badgeInput, { color: getBadgeColor(score) }]}
                keyboardType="numeric"
                maxLength={3}
                value={inputText}
                onChangeText={setInputText}
                onBlur={handleFinishEditing}
                onSubmitEditing={handleFinishEditing}
                autoFocus
                selectTextOnFocus
              />
              <Text style={[styles.badgeMax, { color: getBadgeColor(score) }]}>/ 100</Text>
            </View>
          ) : (
            <Text style={[styles.badgeText, { color: getBadgeColor(score) }]}>
              {score} <Text style={styles.badgeMax}>/ 100</Text>
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Interactive Track */}
      <View
        ref={trackRef}
        onLayout={handleLayout}
        style={styles.trackContainer}
        {...panResponder.panHandlers}
      >
        {/* Filled Portion */}
        <View
          style={[
            styles.filledTrack,
            {
              width: `${Math.max(0, Math.min(100, score))}%`,
              backgroundColor: getBadgeColor(score),
            },
          ]}
        />
        {/* Handle Thumb Pill */}
        <View
          style={[
            styles.thumbPill,
            {
              left: `${Math.max(0, Math.min(100, score))}%`,
              borderColor: getBadgeColor(score),
            },
          ]}
        >
          <Text style={styles.thumbText}>{score}</Text>
        </View>
      </View>

      {/* Quick Presets */}
      <View style={styles.presetRow}>
        <Text style={styles.presetLabel}>Quick Sets:</Text>
        <View style={styles.pillGroup}>
          {quickPresets.map((val) => {
            const isActive = score === val;
            return (
              <TouchableOpacity
                key={val}
                onPress={() => onChange(val)}
                style={[
                  styles.presetPill,
                  isActive && { backgroundColor: '#0a84ff', borderColor: '#0a84ff' }
                ]}
              >
                <Text
                  style={[
                    styles.presetPillText,
                    isActive && { color: '#000', fontWeight: '700' }
                  ]}
                >
                  {val}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 0.5,
    borderColor: '#333',
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  badgeMax: {
    fontSize: 12,
    fontWeight: 'normal',
    opacity: 0.8,
  },
  badgeInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeInput: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 0,
    minWidth: 30,
    textAlign: 'center',
    outlineStyle: 'none'
  },
  trackContainer: {
    height: 18,
    borderRadius: 9,
    borderWidth: 0.5,
    borderColor: '#333',
    backgroundColor: '#111',
    justifyContent: 'center',
    marginVertical: 12,
    position: 'relative',
  },
  filledTrack: {
    height: '100%',
    borderRadius: 9,
  },
  thumbPill: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    top: -8,
    marginLeft: -16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  thumbText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
  },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  presetLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: 8,
    color: '#888'
  },
  pillGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    justifyContent: 'flex-end',
    gap: 6,
  },
  presetPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#333',
    backgroundColor: '#111'
  },
  presetPillText: {
    fontSize: 12,
    color: '#ccc'
  },
});

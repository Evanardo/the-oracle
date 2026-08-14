import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScoreSlider } from './ScoreSlider';
import { CompletionDatePicker } from './CompletionDatePicker';

export const UpdateJournalModal = ({ visible, game, onClose, onSave }) => {
  const [score, setScore] = useState(0);
  const [hours, setHours] = useState('');
  const [disposition, setDisposition] = useState('Backlog');
  const [notes, setNotes] = useState('');
  
  // Date picker state
  const [completedYear, setCompletedYear] = useState(undefined);
  const [completedMonth, setCompletedMonth] = useState(undefined);

  useEffect(() => {
    if (game) {
      setScore(game.score || 0);
      setHours(game.hoursPlayed ? String(game.hoursPlayed) : '');
      setDisposition(game.disposition || 'Backlog');
      setNotes(game.notes || '');
      setCompletedYear(game.completedYear || undefined);
      setCompletedMonth(game.completedMonth || undefined);
    }
  }, [game, visible]);

  const handleSave = () => {
    const updatedGame = {
      ...game,
      score,
      hoursPlayed: hours ? parseInt(hours, 10) : 0,
      disposition,
      notes,
      completedYear,
      completedMonth
    };
    onSave(updatedGame);
    onClose();
  };

  const dispositions = ['Playing', 'Backlog', 'On Hold', 'Completed', 'Dropped'];

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={onClose}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Update Journal</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="#888" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              {/* Disposition */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Status</Text>
                <View style={styles.dispositionRow}>
                  {dispositions.map(disp => (
                    <TouchableOpacity
                      key={disp}
                      style={[
                        styles.dispChip,
                        disposition === disp && styles.dispChipActive
                      ]}
                      onPress={() => setDisposition(disp)}
                    >
                      <Text style={[
                        styles.dispChipText,
                        disposition === disp && styles.dispChipTextActive
                      ]}>
                        {disp}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Score Slider */}
              <ScoreSlider score={score} onChange={setScore} />

              {/* Hours Played */}
              <View style={[styles.section, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
                <Text style={styles.sectionTitle}>Hours Played</Text>
                <TextInput
                  style={styles.hoursInput}
                  keyboardType="numeric"
                  value={hours}
                  onChangeText={(text) => setHours(text.replace(/[^0-9]/g, ''))}
                  maxLength={4}
                  placeholder="0"
                  placeholderTextColor="#555"
                />
              </View>

              {/* Completion Date Picker */}
              <CompletionDatePicker 
                completedYear={completedYear}
                completedMonth={completedMonth}
                onChange={(yr, mo) => {
                  setCompletedYear(yr);
                  setCompletedMonth(mo);
                }}
              />

              {/* Session Notes */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Session Notes / Review</Text>
                <TextInput
                  style={styles.notesInput}
                  multiline
                  placeholder="What did you think of the game?"
                  placeholderTextColor="#555"
                  value={notes}
                  onChangeText={setNotes}
                />
              </View>

              {/* Save Button */}
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save Journal</Text>
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#111',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: '90%',
    borderWidth: 0.5,
    borderColor: '#333',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#222',
    paddingBottom: 15,
    marginBottom: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 5,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  dispositionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dispChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    borderWidth: 0.5,
    borderColor: '#333',
  },
  dispChipActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  dispChipText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
  },
  dispChipTextActive: {
    color: '#000',
  },
  hoursInput: {
    width: 80,
    borderWidth: 0.5,
    borderColor: '#333',
    backgroundColor: '#0a0a0a',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    textAlign: 'center',
    outlineStyle: 'none'
  },
  notesInput: {
    borderWidth: 0.5,
    borderColor: '#333',
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    color: '#fff',
    padding: 15,
    height: 120,
    textAlignVertical: 'top',
    fontSize: 14,
    outlineStyle: 'none'
  },
  saveButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

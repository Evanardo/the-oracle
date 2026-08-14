import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const CompletionDatePicker = ({
  completedYear,
  completedMonth,
  completedDay,
  onChange,
}) => {
  const currentYear = new Date().getFullYear();
  const [isRetroactive, setIsRetroactive] = useState(!!completedYear);
  const [yearInput, setYearInput] = useState(completedYear ? String(completedYear) : '');
  const [selectedMonth, setSelectedMonth] = useState(completedMonth);

  useEffect(() => {
    setIsRetroactive(!!completedYear);
    if (completedYear) {
      setYearInput(String(completedYear));
    }
    setSelectedMonth(completedMonth);
  }, [completedYear, completedMonth]);

  const handleToggleMode = (retro) => {
    setIsRetroactive(retro);
    if (!retro) {
      // Revert to default / today
      onChange(undefined, undefined, undefined);
    } else if (!completedYear) {
      // Default retroactive year to previous year or current year
      const defaultYr = currentYear - 1;
      setYearInput(String(defaultYr));
      onChange(defaultYr, selectedMonth, undefined);
    }
  };

  const handleYearChange = (text) => {
    const clean = text.replace(/[^0-9]/g, '');
    setYearInput(clean);
    const numericYear = parseInt(clean, 10);
    if (numericYear > 1950 && numericYear <= currentYear + 1) {
      onChange(numericYear, selectedMonth, undefined);
    } else if (!clean) {
      onChange(undefined, undefined, undefined);
    }
  };

  const handleSelectQuickYear = (yr) => {
    setYearInput(String(yr));
    onChange(yr, selectedMonth, undefined);
  };

  const handleMonthSelect = (mIndex) => {
    const newMonth = selectedMonth === mIndex + 1 ? undefined : mIndex + 1;
    setSelectedMonth(newMonth);
    const yr = parseInt(yearInput, 10);
    if (yr > 1950) {
      onChange(yr, newMonth, undefined);
    }
  };

  const quickYears = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3, currentYear - 4];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Completion Date</Text>
      
      {/* Mode Toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            !isRetroactive && { backgroundColor: '#fff', borderColor: '#fff' }
          ]}
          onPress={() => handleToggleMode(false)}
        >
          <Text style={[
            styles.toggleText,
            !isRetroactive && { color: '#000', fontWeight: '700' }
          ]}>
            Recent / Today
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
            isRetroactive && { backgroundColor: '#fff', borderColor: '#fff' }
          ]}
          onPress={() => handleToggleMode(true)}
        >
          <Ionicons name="calendar-outline" size={14} color={isRetroactive ? '#000' : '#ccc'} />
          <Text style={[
            styles.toggleText,
            isRetroactive && { color: '#000', fontWeight: '700' }
          ]}>
            Retroactive Date
          </Text>
        </TouchableOpacity>
      </View>

      {/* Retroactive Controls */}
      {isRetroactive && (
        <View style={styles.retroSection}>
          <Text style={styles.subLabel}>Year Played / Finished:</Text>
          
          {/* Quick Year Selector */}
          <View style={styles.quickYearRow}>
            {quickYears.map((yr) => {
              const isSelected = parseInt(yearInput, 10) === yr;
              return (
                <TouchableOpacity
                  key={yr}
                  onPress={() => handleSelectQuickYear(yr)}
                  style={[
                    styles.yearPill,
                    isSelected && { backgroundColor: '#fff', borderColor: '#fff' }
                  ]}
                >
                  <Text style={[
                    styles.yearPillText,
                    isSelected && { color: '#000', fontWeight: '700' }
                  ]}>
                    {yr}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Custom Year Input */}
          <View style={styles.customYearRow}>
            <Text style={styles.customYearLabel}>Or Custom Year:</Text>
            <TextInput
              style={styles.yearInput}
              placeholder="e.g. 2018"
              placeholderTextColor="#888"
              keyboardType="numeric"
              maxLength={4}
              value={yearInput}
              onChangeText={handleYearChange}
            />
          </View>

          {/* Optional Month Picker */}
          <Text style={[styles.subLabel, { marginTop: 12 }]}>
            Month (Optional):
          </Text>
          <View style={styles.monthGrid}>
            {MONTH_SHORT.map((m, index) => {
              const isSelected = selectedMonth === index + 1;
              return (
                <TouchableOpacity
                  key={m}
                  onPress={() => handleMonthSelect(index)}
                  style={[
                    styles.monthPill,
                    isSelected && { backgroundColor: '#fff', borderColor: '#fff' }
                  ]}
                >
                  <Text style={[
                    styles.monthPillText,
                    isSelected && { color: '#000', fontWeight: '700' }
                  ]}>
                    {m}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
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
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 0.5,
    borderColor: '#333',
    backgroundColor: '#111',
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ccc',
  },
  retroSection: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: '#333',
  },
  subLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#888',
    marginBottom: 8,
  },
  quickYearRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  yearPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: '#333',
    backgroundColor: '#111',
  },
  yearPillText: {
    fontSize: 13,
    color: '#ccc',
  },
  customYearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  customYearLabel: {
    fontSize: 13,
    color: '#888',
  },
  yearInput: {
    width: 90,
    borderWidth: 0.5,
    borderColor: '#333',
    backgroundColor: '#111',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    textAlign: 'center',
    outlineStyle: 'none'
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  monthPill: {
    width: '23%',
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#333',
    backgroundColor: '#111',
    alignItems: 'center',
  },
  monthPillText: {
    fontSize: 12,
    color: '#ccc',
  },
});

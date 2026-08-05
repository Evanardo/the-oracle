import React, { useState, useEffect } from 'react';
import { Platform, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { StackScreen } from './src/screens/StackScreen';
import { OracleScreen } from './src/screens/OracleScreen';
import { LibraryScreen } from './src/screens/LibraryScreen';

const Tab = createBottomTabNavigator();

// Suppress deprecation warnings from React Native Web caused by third-party libraries (e.g. React Navigation)
LogBox.ignoreLogs([
  'props.pointerEvents is deprecated',
  '"shadow*" style props are deprecated',
  '"textShadow*" style props are deprecated'
]);

export default function App() {
  const [library, setLibrary] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = window.localStorage.getItem('oracle_library');
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem('oracle_library', JSON.stringify(library));
      } catch (e) {}
    }
  }, [library]);

  // One-time Migration to fix previously random vibes
  useEffect(() => {
    const migrationFlag = 'vibe_migration_v1';
    let hasMigrated = false;
    if (typeof window !== 'undefined' && window.localStorage) {
       hasMigrated = window.localStorage.getItem(migrationFlag) === 'true';
    }

    if (!hasMigrated && library.length > 0) {
      const migratedLibrary = library.map(game => {
        const tags = (game.tags || '').toLowerCase();
        let newVibe = 'Intense'; // fallback
        
        if (tags.includes('horror')) newVibe = 'Scary';
        else if (tags.includes('simulator') || tags.includes('puzzle') || tags.includes('casual')) newVibe = 'Relaxing';
        else if (tags.includes('moba') || tags.includes('fighting') || tags.includes('sport')) newVibe = 'Sweaty';
        else if (tags.includes('strategy') || tags.includes('tactical') || tags.includes('turn-based')) newVibe = 'Strategic';
        else if (tags.includes('role-playing') || tags.includes('rpg') || tags.includes('point-and-click') || tags.includes('visual novel')) newVibe = 'Narrative';
        else if (tags.includes('platform') || tags.includes('arcade') || tags.includes('racing')) newVibe = 'Brain-Off';
        else if (tags.includes('shooter') || tags.includes('hack and slash') || tags.includes('action')) newVibe = 'Intense';
        else newVibe = 'Narrative';

        return { ...game, vibe: newVibe };
      });
      
      setLibrary(migratedLibrary);
      if (typeof window !== 'undefined' && window.localStorage) {
         window.localStorage.setItem(migrationFlag, 'true');
      }
    }
  }, []);

  const handleSaveToLibrary = (game) => {
    setLibrary((prev) => {
      const exists = prev.find(g => g.id === game.id);
      if (exists) {
        return prev.map(g => g.id === game.id ? game : g);
      }
      return [game, ...prev]; 
    });
  };

  const handleRemoveFromLibrary = (gameId) => {
    setLibrary((prev) => prev.filter(g => g.id !== gameId));
  };

  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === 'Stack') iconName = focused ? 'albums' : 'albums-outline';
              else if (route.name === 'Oracle') iconName = focused ? 'sparkles' : 'sparkles-outline';
              else if (route.name === 'Library') iconName = focused ? 'library' : 'library-outline';
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#fff',
            tabBarInactiveTintColor: '#555',
            tabBarStyle: {
              backgroundColor: '#121212',
              borderTopWidth: 1,
              borderTopColor: '#2a2a2a',
              height: Platform.OS === 'ios' ? 85 : 65,
              paddingTop: 6,
              paddingBottom: Platform.OS === 'ios' ? 24 : 4,
            },
            tabBarItemStyle: {
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: 2,
            },
            tabBarLabelStyle: { 
              fontSize: 11, 
              fontWeight: '600', 
              marginTop: 1,
              marginBottom: 2,
            }
          })}
        >
          <Tab.Screen name="Stack">
            {(props) => <StackScreen {...props} library={library} onSaveToLibrary={handleSaveToLibrary} />}
          </Tab.Screen>
          <Tab.Screen name="Oracle">
            {(props) => <OracleScreen {...props} library={library} />}
          </Tab.Screen>
          <Tab.Screen name="Library">
            {(props) => (
              <LibraryScreen 
                {...props} 
                library={library} 
                onSaveToLibrary={handleSaveToLibrary}
                onRemoveFromLibrary={handleRemoveFromLibrary}
              />
            )}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}
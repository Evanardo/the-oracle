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

// Override console.warn to also suppress them in the terminal output
const originalWarn = console.warn;
console.warn = (...args) => {
  const message = typeof args[0] === 'string' ? args[0] : '';
  if (
    message.includes('props.pointerEvents is deprecated') ||
    message.includes('"shadow*" style props are deprecated') ||
    message.includes('"textShadow*" style props are deprecated')
  ) {
    return;
  }
  originalWarn(...args);
};

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

  // Migration for vibes and isPauseable
  useEffect(() => {
    const migrationFlag = 'library_migration_v3';
    let hasMigrated = false;
    if (typeof window !== 'undefined' && window.localStorage) {
       hasMigrated = window.localStorage.getItem(migrationFlag) === 'true';
    }

    if (!hasMigrated && library.length > 0) {
      const migratedLibrary = library.map(game => {
        const tags = (game.tags || '').toLowerCase();
        let newVibe = game.vibe || 'Intense'; // fallback
        
        // If it was already set to 'Scary' in v1, convert it to 'Dark'
        if (newVibe === 'Scary') newVibe = 'Dark';
        
        // Original v1 logic, updated for 'Dark'
        if (tags.includes('horror')) newVibe = 'Dark';
        else if (tags.includes('simulator') || tags.includes('puzzle') || tags.includes('casual')) newVibe = 'Relaxing';
        else if (tags.includes('moba') || tags.includes('fighting') || tags.includes('sport')) newVibe = 'Sweaty';
        else if (tags.includes('strategy') || tags.includes('tactical') || tags.includes('turn-based')) newVibe = 'Strategic';
        else if (tags.includes('role-playing') || tags.includes('rpg') || tags.includes('point-and-click') || tags.includes('visual novel')) newVibe = 'Narrative';
        else if (tags.includes('platform') || tags.includes('arcade') || tags.includes('racing')) newVibe = 'Brain-Off';
        else if (tags.includes('shooter') || tags.includes('hack and slash') || tags.includes('action')) newVibe = 'Intense';

        // Recalculate isPauseable for existing games
        const name = (game.title || '').toLowerCase();
        const modes = (game.gameModes || '').toLowerCase();
        const unpauseableFranchises = ['dark souls', 'bloodborne', 'elden ring', 'sekiro', "demon's souls", 'nioh', 'lies of p'];
        let isPauseable = true;
        
        if (unpauseableFranchises.some(f => name.includes(f))) {
          isPauseable = false;
        } else if (modes.includes('massively multiplayer online') || 
                  (modes.includes('multiplayer') && !modes.includes('single player'))) {
          isPauseable = false;
        }

        return { ...game, vibe: newVibe, isPauseable };
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
              backgroundColor: '#000000',
              borderTopWidth: 0.5,
              borderTopColor: '#222',
              height: Platform.OS === 'ios' ? 85 : 72,
              paddingTop: 6,
              paddingBottom: Platform.OS === 'ios' ? 24 : 8,
            },
            tabBarItemStyle: {
              justifyContent: 'center',
              alignItems: 'center',
            },
            tabBarLabelStyle: { 
              fontSize: 11, 
              fontWeight: '600', 
              marginTop: 2,
              marginBottom: 4,
            }
          })}
        >
          <Tab.Screen name="Stack">
            {(props) => <StackScreen {...props} library={library} onSaveToLibrary={handleSaveToLibrary} onRemoveFromLibrary={handleRemoveFromLibrary} />}
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
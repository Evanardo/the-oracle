import React, { useState, useEffect } from 'react';
import { Platform, LogBox } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const [library, setLibrary] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load and migrate library from local AsyncStorage (with fallback for legacy window.localStorage)
  useEffect(() => {
    const loadLibrary = async () => {
      try {
        let saved = await AsyncStorage.getItem('oracle_library');
        if (!saved && typeof window !== 'undefined' && window.localStorage) {
          saved = window.localStorage.getItem('oracle_library');
        }
        let parsedLibrary = saved ? JSON.parse(saved) : [];

        let hasMigrated = await AsyncStorage.getItem('library_migration_v3');
        if (!hasMigrated && typeof window !== 'undefined' && window.localStorage) {
          hasMigrated = window.localStorage.getItem('library_migration_v3') === 'true';
        }

        if (!hasMigrated && parsedLibrary.length > 0) {
          parsedLibrary = parsedLibrary.map(game => {
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
          
          await AsyncStorage.setItem('library_migration_v3', 'true');
        }

        setLibrary(parsedLibrary);
      } catch (e) {
        console.error('Error loading local library:', e);
      } finally {
        setIsLoaded(true);
      }
    };

    loadLibrary();
  }, []);

  // Save library to local AsyncStorage with 300ms debounce to batch rapid swipes
  useEffect(() => {
    if (!isLoaded) return;
    const timeoutId = setTimeout(async () => {
      try {
        await AsyncStorage.setItem('oracle_library', JSON.stringify(library));
      } catch (e) {
        console.error('Error saving local library:', e);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [library, isLoaded]);

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
            {(props) => <StackScreen {...props} library={library} isLoaded={isLoaded} onSaveToLibrary={handleSaveToLibrary} onRemoveFromLibrary={handleRemoveFromLibrary} />}
          </Tab.Screen>
          <Tab.Screen name="Oracle">
            {(props) => <OracleScreen {...props} library={library} onSaveToLibrary={handleSaveToLibrary} />}
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
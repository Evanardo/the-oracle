import React, { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { StackScreen } from './src/screens/StackScreen';
import { OracleScreen } from './src/screens/OracleScreen';
import { LibraryScreen } from './src/screens/LibraryScreen';

const Tab = createBottomTabNavigator();

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

  const handleSaveToLibrary = (game) => {
    setLibrary((prev) => {
      const exists = prev.find(g => g.id === game.id);
      if (exists) {
        return prev.map(g => g.id === game.id ? game : g);
      }
      return [game, ...prev]; 
    });
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
            {(props) => <LibraryScreen {...props} library={library} />}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}
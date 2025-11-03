
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { initDatabase } from './src/database';
import { useEffect } from 'react';
import { Alert } from 'react-native';

export default function App() {
  useEffect(() => {
    initDatabase()
      .then(() => {
        console.log('✅ Database initialized successfully');
      })
      .catch((error) => {
        console.error('❌ Database initialization failed:', error);
        Alert.alert('Error', 'Failed to initialize database');
      });
  }, []);
  
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}

import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Colors } from '../../constants/DesignTokens';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.sage,
        headerShown: false,
        // Hide the tab bar on web — single-tab app, nav lives in the header
        tabBarStyle: Platform.OS === 'web'
          ? { display: 'none' } as any
          : { backgroundColor: Colors.whiteClay, borderTopColor: Colors.mist },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}

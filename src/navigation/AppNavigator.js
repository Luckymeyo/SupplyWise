
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';
import Colors from '../styles/colors';

import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import InventoryScreen from '../screens/InventoryScreen';
import ManagementScreen from '../screens/ManagementScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ title: 'Home', headerShown: false }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
    </Stack.Navigator>
  );
}

function TabIcon({ label, focused }) {
  return (
    <View style={{
      width: 64, height: 64, borderRadius: 32,
      backgroundColor: focused ? '#2E3D46' : '#3B4A53',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <Text style={{ color: 'white', fontSize: 22 }}>{label}</Text>
    </View>
  );
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: Colors.tabBg, height: 82, paddingTop: 8 },
        tabBarShowLabel: false,
      }}
      initialRouteName="HomeTab"
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="🏬" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Management"
        component={ManagementScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="📋" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

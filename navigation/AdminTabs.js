
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import UserManagementScreen from '../screens/AdminControlPanel/UserManagementScreen';
import AnalyticsScreen from '../screens/AdminControlPanel/AnalyticsScreen';
import CreateVenueScreen from '../screens/AdminControlPanel/CreateVenueScreen';
import SettingsScreen from '../screens/AdminControlPanel/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Users: 'people-outline',
            Analytics: 'bar-chart-outline',
            CreateVenue: 'business-outline',
            Settings: 'settings-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={focused ? '#ee2a7b' : 'gray'} />;
        },
        tabBarActiveTintColor: '#ee2a7b',
        tabBarInactiveTintColor: 'gray',
        tabBarLabelStyle: { fontWeight: '600',   },
      })}
    >
              <Tab.Screen
                name="Users"
                component={UserManagementScreen}
                options={{ headerShown: false }}
              />
              <Tab.Screen
                name="Analytics"
                component={AnalyticsScreen}
                options={{ headerShown: false }}
              />
              <Tab.Screen
                name="CreateVenue"
                component={CreateVenueScreen}
                options={{ headerShown: false }}
              />
              <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ headerShown: false }}
              />
    </Tab.Navigator>
  );
}

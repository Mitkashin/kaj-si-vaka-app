import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import CreateScreen from '../screens/CreateScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AnimatedTabIcon from '../components/AnimatedTabIcon';

const Tab = createBottomTabNavigator();

export default function HomeTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarShowLabel: true,
                tabBarIcon: ({ focused, size }) => {
                    const iconMap = {
                        Home: 'home-outline',
                        Map: 'map-outline',
                        Create: 'add-circle-outline',
                        Profile: 'person-outline',
                    };
                    const iconName = iconMap[route.name] || 'ellipse-outline';

                    return (
                        <Ionicons name={iconName} size={size} color={focused ? '#ee2a7b' : 'gray'} />
                    );
                },
                tabBarLabel: ({ focused }) => (
                    <Text style={{
                        fontSize: 12,
                        fontWeight: '600',
                        color: focused ? '#ee2a7b' : 'gray'
                    }}>{route.name}</Text>
                ),
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Map" component={MapScreen} />
            <Tab.Screen name="Create" component={CreateScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

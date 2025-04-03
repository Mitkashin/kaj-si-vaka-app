import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../utils/firebaseConfig';

import GradientHeader from '../components/GradientHeader';
import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import CreateScreen from '../screens/CreateScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AdminPanel from '../screens/AdminPanel';

const Tab = createBottomTabNavigator();

export default function HomeTabs() {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const data = userDoc.data();
          setUserRole(data?.role || null);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  if (loading) return null;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarShowLabel: true,
        tabBarIcon: ({ focused, size }) => {
          const iconMap = {
            Home: 'home-outline',
            Map: 'map-outline',
            Create: 'add-circle-outline',
            Profile: 'person-outline',
            AdminPanel: 'settings-outline',
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
          }}>
            {route.name === 'AdminPanel' ? 'Admin' : route.name}
          </Text>
        ),
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ header: () => <GradientHeader title="Home" /> }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{ header: () => <GradientHeader title="Map" /> }}
      />
      <Tab.Screen
        name="Create"
        component={CreateScreen}
        options={{ header: () => <GradientHeader title="Create" /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      {userRole === 'admin' && (
        <Tab.Screen
          name="AdminPanel"
          component={AdminPanel}
          options={{
            header: () => <GradientHeader title="Admin Panel" />,
          }}
        />
      )}
    </Tab.Navigator>
  );
}

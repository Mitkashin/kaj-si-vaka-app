import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../utils/firebaseConfig';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import GradientHeader from '../components/GradientHeader';
import LoginScreen from '../screens/LoginScreen';
import HomeTabs from '../navigation/HomeTabs';
import WelcomeScreen from '../screens/WelcomeScreen';

const Stack = createNativeStackNavigator();

export default function AuthGate() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#ee2a7b" />
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {showWelcome ? (
        <Stack.Screen
          name="Welcome"
          options={{ header: () => <GradientHeader title="Welcome" /> }}
        >
          {() => <WelcomeScreen onContinue={() => setShowWelcome(false)} />}
        </Stack.Screen>
      ) : user ? (
        <Stack.Screen
          name="HomeTabs"
          component={HomeTabs}
          options={{ header: () => <GradientHeader title="Home" /> }}
        />
      ) : (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ header: () => <GradientHeader title="Login" /> }}
        />
      )}
    </Stack.Navigator>
  );
}

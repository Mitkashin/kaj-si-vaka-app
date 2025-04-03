import React, { useState } from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function GradientHeader({ title = 'Kaj Si Vaka' }) {
  const [logoError, setLogoError] = useState(false);

  return (
    <LinearGradient
      colors={['#f9ce34', '#ee2a7b', '#6228d7']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      {!logoError ? (
        <Image
          source={require('../assets/logo2.png')}
          style={styles.logo}
          resizeMode="contain"
          onError={() => setLogoError(true)}
        />
      ) : (
        <Text style={styles.title}>{title}</Text>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 25,
  },
  logo: {
    height: 60,
    width: 140,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
});

import React from 'react';
import { View, StyleSheet } from 'react-native';
import CustomMap from '../components/CustomMap';

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <CustomMap />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

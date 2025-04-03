import React, { useEffect, useState, useRef } from 'react';
import MapView from 'react-native-maps';
import * as Location from 'expo-location';
import { StyleSheet, Alert } from 'react-native';

export default function CustomMap() {
  const [location, setLocation] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is required to show your position.');
        return;
      }

      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (loc) => {
          setLocation(loc.coords);
          mapRef.current?.animateToRegion({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      );
    })();
  }, []);

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      customMapStyle={mapStyle}
      showsUserLocation={true}
      initialRegion={{
        latitude: location?.latitude || 41.9981,
        longitude: location?.longitude || 21.4254,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
    />
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

const mapStyle = [
  {
    featureType: 'poi',
    stylers: [{ visibility: 'off' }],
  },
];
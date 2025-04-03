import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';

export default function CustomMap() {
  const mapRef = useRef(null);

  useEffect(() => {
    const initMap = () => {
      if (!window.google || !window.google.maps) return;

      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 41.9981, lng: 21.4254 },
        zoom: 13,
        disableDefaultUI: true,
        styles: [
          {
            featureType: 'poi',
            stylers: [{ visibility: 'off' }],
          },
        ],
      });

      // Optional: Add user's browser location (if available)
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          new window.google.maps.Marker({
            position: userLocation,
            map,
            title: 'You are here',
          });
          map.setCenter(userLocation);
        });
      }
    };

    if (!window.google || !window.google.maps) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyA5Asw5WSBoDq9vhbjDfxjlhkAyqsDKWFk&libraries=places`;
      script.async = true;
      script.onload = initMap;
      document.body.appendChild(script);
    } else {
      initMap();
    }
  }, []);

  return <View style={styles.map} ref={mapRef} />;
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

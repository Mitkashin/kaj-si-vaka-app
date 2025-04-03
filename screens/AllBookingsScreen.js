import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Platform,
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';

export default function AllBookingsScreen() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBookings = async () => {
    try {
      const venueSnap = await getDocs(collection(db, 'venues'));
      const venues = venueSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      let all = [];
      for (const venue of venues) {
        const snap = await getDocs(collection(db, 'venues', venue.id, 'bookings'));
        const bookings = snap.docs.map((doc) => ({
          id: doc.id,
          venueName: venue.name,
          ...doc.data(),
        }));
        all.push(...bookings);
      }

      all.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
      setBookings(all);
    } catch (err) {
      console.error('Error loading bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((b) =>
    (b.venueName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (b.userName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (b.userEmail?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ee2a7b" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* 🔍 Gradient Search Bar */}
      <View style={styles.searchWrapper}>
        <LinearGradient
          colors={['#f9ce34', '#ee2a7b', '#6228d7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBorder}
        >
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Search bookings..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
              style={styles.searchInput}
            />
          </View>
        </LinearGradient>
      </View>

      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item, index }) => (
          <View
            style={[
              styles.row,
              index % 2 === 0 ? styles.rowEven : styles.rowOdd,
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.bookingVenue}>{item.venueName}</Text>
              <Text style={styles.bookingDetails}>
                {item.userName || 'Unknown'} ({item.userEmail || 'No email'})
              </Text>
              <Text style={styles.bookingDetails}>
                {item.date} @ {item.time}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
  },
  searchWrapper: {
    padding: 16,
    backgroundColor: '#fff',
  },
  gradientBorder: {
    borderRadius: 14,
    padding: 2,
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 10,
  },searchInput: {
    height: 40,
    fontSize: 15,
    color: '#333',
    outlineStyle: 'none',
    outlineWidth: 0,
    borderWidth: 0,
  },
  
  row: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  rowEven: { backgroundColor: '#f7f7f7' },
  rowOdd: { backgroundColor: '#ffffff' },

  bookingVenue: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  bookingDetails: {
    fontSize: 13,
    color: '#666',
  },
});

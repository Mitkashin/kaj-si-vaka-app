import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db, auth } from '../utils/firebaseConfig';
import GradientButton from '../components/GradientButton';

export default function AdminPanel({ navigation }) {
  const [users, setUsers] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedUserId, setExpandedUserId] = useState(null);

  const [totalUsers, setTotalUsers] = useState(0);
  const [totalVenues, setTotalVenues] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [recentBookings, setRecentBookings] = useState([]);
  const [venueBookingCounts, setVenueBookingCounts] = useState([]);

  const fetchUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(list);
      setTotalUsers(list.length);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchVenues = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'venues'));
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setVenues(list);
      setTotalVenues(list.length);
    } catch (err) {
      console.error('Error fetching venues:', err);
    }
  };

  const fetchBookings = async (venueList) => {
    try {
      let allBookings = [];
      let counts = [];

      for (const venue of venueList) {
        const snap = await getDocs(collection(db, 'venues', venue.id, 'bookings'));
        const bookings = snap.docs.map((doc) => ({
          id: doc.id,
          venueId: venue.id,
          venueName: venue.name,
          ...doc.data(),
        }));
        allBookings.push(...bookings);
        counts.push({ venueName: venue.name, count: bookings.length });
      }

      allBookings.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
      counts.sort((a, b) => b.count - a.count);

      setTotalBookings(allBookings.length);
      setRecentBookings(allBookings.slice(0, 20));
      setVenueBookingCounts(counts.slice(0, 5));
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  const updateUser = async (uid, updates) => {
    try {
      await updateDoc(doc(db, 'users', uid), updates);
      fetchUsers();
    } catch (err) {
      console.error('Error updating user:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Access Denied', 'No user logged in');
        navigation.goBack();
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const data = userDoc.data();

      if (!data || data.role !== 'admin') {
        Alert.alert('Access Denied', 'You are not an admin');
        navigation.goBack();
        return;
      }

      await fetchUsers();
      await fetchVenues();
    };

    init().then(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (venues.length > 0) {
      fetchBookings(venues);
    }
  }, [venues]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ee2a7b" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* STATS */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Users</Text>
          <Text style={styles.statValue}>{totalUsers}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Venues</Text>
          <Text style={styles.statValue}>{totalVenues}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Bookings</Text>
          <Text style={styles.statValue}>{totalBookings}</Text>
        </View>
      </View>

      {/* RECENT BOOKINGS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Bookings</Text>
        {recentBookings.map((booking, index) => (
          <View
            key={booking.id}
            style={[
              styles.bookingRow,
              index % 2 === 0 ? styles.venueEven : styles.venueOdd,
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.bookingVenue}>{booking.venueName}</Text>
              <Text style={styles.bookingDetails}>
                {booking.userName || 'Unknown'} ({booking.userEmail || 'No email'})
              </Text>
              <Text style={styles.bookingDetails}>
                {booking.date} @ {booking.time}
              </Text>
            </View>
          </View>
        ))}
        <View style={styles.centeredButton}>
          <GradientButton
            title="View All"
            onPress={() => navigation.navigate('AllBookings')}
          />
        </View>
      </View>

      {/* TOP VENUES */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔥 Top Booked Venues</Text>
        {venueBookingCounts.map((item, index) => (
          <View key={index} style={styles.topListItem}>
            <Text style={styles.topListText}>
              {index + 1}. {item.venueName}
            </Text>
            <Text style={styles.topListText}>{item.count}</Text>
          </View>
        ))}
      </View>

      {/* USER MANAGEMENT */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Management</Text>
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.email}>
                {item.username ? `${item.username} - ${item.email}` : item.email}
              </Text>

              <Text style={styles.label}>Role:</Text>
              <View style={styles.dropdownRow}>
                {['user', 'owner', 'admin'].map((roleOption) => (
                  <TouchableOpacity
                    key={roleOption}
                    onPress={() => updateUser(item.id, { role: roleOption })}
                    style={[
                      styles.roleButton,
                      item.role === roleOption && styles.roleButtonActive,
                    ]}
                  >
                    <Text
                      style={{
                        color: item.role === roleOption ? '#fff' : '#333',
                        fontWeight: '600',
                      }}
                    >
                      {roleOption}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                onPress={() =>
                  setExpandedUserId(expandedUserId === item.id ? null : item.id)
                }
                style={styles.toggleButton}
              >
                <Ionicons
                  name={expandedUserId === item.id ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color="#333"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.toggleText}>
                  {expandedUserId === item.id ? 'Hide Venues' : 'Show Venues'}
                </Text>
              </TouchableOpacity>

              {expandedUserId === item.id && (
                <>
                  <Text style={styles.label}>Owns Venues:</Text>
                  {venues.map((venue, index) => {
                    const ownsVenue = item.venueIds?.includes(venue.id);
                    const isEven = index % 2 === 0;
                    return (
                      <View
                        key={venue.id}
                        style={[
                          styles.venueRow,
                          isEven ? styles.venueEven : styles.venueOdd,
                        ]}
                      >
                        <Text style={styles.venueName}>{venue.name}</Text>
                        <TouchableOpacity
                          onPress={() => {
                            const updated = ownsVenue
                              ? item.venueIds.filter((id) => id !== venue.id)
                              : [...(item.venueIds || []), venue.id];
                            updateUser(item.id, { venueIds: updated });
                          }}
                          style={[
                            styles.venueButton,
                            ownsVenue && styles.venueButtonActive,
                          ]}
                        >
                          <Text style={{ color: ownsVenue ? '#fff' : '#333' }}>
                            {ownsVenue ? '✓ Remove' : 'Add'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </>
              )}
            </View>
          )}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: '#fafafa',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  statBox: { alignItems: 'center' },
  statLabel: { fontSize: 14, color: '#888' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#333' },

  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },

  bookingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  bookingVenue: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  bookingDetails: {
    fontSize: 13,
    color: '#666',
  },

  topListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#f9f9f9',
    marginBottom: 4,
  },
  topListText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  centeredButton: {
    marginTop: 12,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 400,
  },
  

  card: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  email: { fontWeight: 'bold', marginBottom: 6 },
  label: { fontSize: 14, marginTop: 6, marginBottom: 4 },
  dropdownRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  roleButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#f2f2f2',
    marginRight: 6,
    marginBottom: 6,
  },
  roleButtonActive: {
    backgroundColor: '#ee2a7b',
    borderColor: '#ee2a7b',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    backgroundColor: '#eee',
    borderRadius: 8,
  },
  toggleText: { fontSize: 14, color: '#333', fontWeight: '500' },

  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  venueEven: { backgroundColor: '#f7f7f7' },
  venueOdd: { backgroundColor: '#ffffff' },
  venueName: { flex: 1, fontSize: 15 },
  venueButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  venueButtonActive: { backgroundColor: '#ee2a7b' },
});

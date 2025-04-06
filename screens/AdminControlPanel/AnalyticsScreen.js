import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions, Platform } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../utils/firebaseConfig';
import { BarChart } from 'react-native-chart-kit';

export default function AnalyticsScreen() {
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalVenues, setTotalVenues] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [recentBookings, setRecentBookings] = useState([]);
  const [venueBookingData, setVenueBookingData] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const userSnap = await getDocs(collection(db, 'users'));
        const userList = userSnap.docs.map(d => d.data());
        setTotalUsers(userList.length);

        const venueSnap = await getDocs(collection(db, 'venues'));
        const venueList = venueSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setTotalVenues(venueList.length);

        let allBookings = [];
        for (const v of venueList) {
          const snap = await getDocs(collection(db, 'venues', v.id, 'bookings'));
          const bookings = snap.docs.map(d => ({
            id: d.id,
            venueId: v.id,
            venueName: v.name,
            ...d.data()
          }));
          allBookings.push(...bookings);
        }
        allBookings.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setTotalBookings(allBookings.length);

        const topVenues = venueList.map(v => ({
          name: v.name,
          count: allBookings.filter(b => b.venueId === v.id).length,
        })).sort((a, b) => b.count - a.count).slice(0, 10);

        setVenueBookingData(topVenues);

        const eventsSnap = await getDocs(collection(db, 'events'));
        setTotalEvents(eventsSnap.docs.length);

        setRecentBookings(allBookings.slice(0, 5));
      } catch (err) {
        console.error('Analytics error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ee2a7b" />
      </View>
    );
  }

  const screenWidth = Dimensions.get('window').width;
  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(238, 42, 123, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: { borderRadius: 8 },
    propsForLabels: { fontSize: 10 },
    propsForVerticalLabels: { rotation: 45 },
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statCard}><Text style={styles.statLabel}>Users</Text><Text style={styles.statValue}>{totalUsers}</Text></View>
        <View style={styles.statCard}><Text style={styles.statLabel}>Venues</Text><Text style={styles.statValue}>{totalVenues}</Text></View>
        <View style={styles.statCard}><Text style={styles.statLabel}>Events</Text><Text style={styles.statValue}>{totalEvents}</Text></View>
        <View style={styles.statCard}><Text style={styles.statLabel}>Bookings</Text><Text style={styles.statValue}>{totalBookings}</Text></View>
      </View>

      {venueBookingData.length > 0 && (
        <ScrollView horizontal contentContainerStyle={{ paddingHorizontal: 16 }}>
          <View style={{ paddingVertical: 20 }}>
            <Text style={styles.sectionTitle}>Top 10 Booked Venues</Text>
            <BarChart
              data={{
                labels: venueBookingData.map(v => v.name.length > 12 ? v.name.slice(0, 12) + '…' : v.name),
                datasets: [{ data: venueBookingData.map(v => v.count) }],
              }}
              width={Math.max(screenWidth, venueBookingData.length * 60)}
              height={260}
              chartConfig={chartConfig}
              verticalLabelRotation={45}
              style={{ marginBottom: 20, borderRadius: 8 }}
              showValuesOnTopOfBars={true}
            />
          </View>
        </ScrollView>
      )}

      <Text style={styles.sectionTitle}>Recent Bookings</Text>
      {recentBookings.length === 0 ? (
        <Text style={styles.emptyState}>No recent bookings</Text>
      ) : (
        recentBookings.map((b) => (
          <View key={b.id} style={styles.bookingItem}>
            <Text style={styles.bookingVenue}>{b.venueName}</Text>
            <Text style={styles.bookingUser}>{b.userName || 'Unknown'} ({b.userEmail || 'No email'})</Text>
            <Text style={styles.bookingTime}>{b.date} @ {b.time}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { paddingVertical: 20, paddingHorizontal: 16, alignItems: 'center' },
  statsRow: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 16,
  },
  statCard: {
    width: 120, minHeight: 80, backgroundColor: '#f9f9f9',
    borderRadius: 12, margin: 8, alignItems: 'center', justifyContent: 'center',
    padding: 10, shadowColor: '#000', shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2,
  },
  statLabel: { fontSize: 14, color: '#888', marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  emptyState: { fontSize: 14, color: '#777', fontStyle: 'italic', marginBottom: 10 },
  bookingItem: {
    width: '100%', backgroundColor: '#fafafa', borderRadius: 8,
    padding: 10, marginBottom: 8, borderWidth: 1, borderColor: '#eee',
  },
  bookingVenue: { fontWeight: 'bold', fontSize: 15, marginBottom: 2 },
  bookingUser: { fontSize: 13, color: '#666' },
  bookingTime: { fontSize: 13, color: '#666' },
});
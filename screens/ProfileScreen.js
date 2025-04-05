import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Modal,
  TextInput,
  Pressable,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { auth, db } from '../utils/firebaseConfig';
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import GradientButton from '../components/GradientButton';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [recentBookings, setRecentBookings] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          setUsername(data.username || '');
          setPhone(data.phone || '');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.uid) fetchUserData();
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const venueSnap = await getDocs(collection(db, 'venues'));
        const venues = venueSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        let all = [];
        for (const venue of venues) {
          const snap = await getDocs(
            collection(db, 'venues', venue.id, 'bookings')
          );
          const bookings = snap.docs
            .map((doc) => ({
              id: doc.id,
              venueName: venue.name,
              ...doc.data(),
            }))
            .filter((b) => b.userId === user.uid);

          all.push(...bookings);
        }

        all.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
        setRecentBookings(all.slice(0, 5));
      } catch (err) {
        console.error('Error loading bookings:', err);
      }
    };

    if (user?.uid) fetchBookings();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        username,
        phone,
      });
      setUserData((prev) => ({ ...prev, username, phone }));
      setEditModalVisible(false);
      Alert.alert('Profile updated');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error updating profile');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ee2a7b" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <LinearGradient
          colors={['#f9ce34', '#ee2a7b', '#6228d7']}
          style={styles.header}
        >
          <Image source={require('../assets/avatar.png')} style={styles.avatar} />
          <Text style={styles.name}>{userData?.username || 'Anonymous'}</Text>
          <Text style={styles.email}>{userData?.email || user?.email}</Text>
          {userData?.role && (
            <Text style={styles.roleBadge}>
              {userData.role === 'admin'
                ? '👑 Admin'
                : userData.role === 'owner'
                ? '🎯 Owner'
                : '🙋 User'}
            </Text>
          )}
        </LinearGradient>

        <View style={[styles.webWrapper, Platform.OS === 'web' && styles.webLimited]}>
          <View style={styles.card}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{userData?.phone || 'Not set'}</Text>
            <View style={styles.divider} />
            <Text style={styles.infoLabel}>Joined</Text>
            <Text style={styles.infoValue}>
              {userData?.createdAt?.toDate().toLocaleDateString() || 'Unknown'}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={[styles.infoLabel, { marginBottom: 10 }]}>Recent Bookings</Text>
            {recentBookings.length === 0 ? (
              <Text style={styles.infoValue}>No bookings yet.</Text>
            ) : (
              recentBookings.map((b) => (
                <View key={b.id} style={styles.bookingRow}>
                  <Text style={styles.bookingVenue}>{b.venueName}</Text>
                  <Text style={styles.bookingDetails}>{b.date} @ {b.time}</Text>
                </View>
              ))
            )}
          </View>

          {/* Moved Buttons Here */}
          <View style={{ marginHorizontal: 20, marginBottom: 30, gap: 12 }}>
            <GradientButton title="Edit Profile" onPress={() => setEditModalVisible(true)} />
            <GradientButton title="Sign Out" onPress={handleSignOut} />
          </View>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TextInput
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              style={styles.input}
            />
            <TextInput
              placeholder="Phone"
              value={phone}
              onChangeText={setPhone}
              style={styles.input}
              keyboardType="phone-pad"
            />
            <GradientButton title="Save Changes" onPress={handleProfileUpdate} />
            <Pressable onPress={() => setEditModalVisible(false)} style={styles.cancelBtn}>
              <Text style={{ color: '#888' }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webWrapper: {
    width: '100%',
  },
  webLimited: {
    maxWidth: '50%',
    alignSelf: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#fff',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  email: {
    color: '#eee',
    fontSize: 14,
  },
  roleBadge: {
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    fontSize: 13,
    color: '#6228d7',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 3,
  },
  infoLabel: {
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },
  bookingRow: {
    marginBottom: 10,
  },
  bookingVenue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
  },
  bookingDetails: {
    fontSize: 14,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 14,
  },
  cancelBtn: {
    marginTop: 10,
    alignItems: 'center',
  },
});

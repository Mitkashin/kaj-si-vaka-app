import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Modal,
  TextInput,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import GradientButton from '../components/GradientButton';
import { db, auth } from '../utils/firebaseConfig';
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';

export default function VenueDetailsScreen({ route }) {
  const { venueId } = route.params;
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [guests, setGuests] = useState(1);

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const snap = await getDoc(doc(db, 'venues', venueId));
        if (snap.exists()) {
          setVenue({ id: snap.id, ...snap.data() });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVenue();
  }, [venueId]);

  const handleBooking = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return alert('You must be logged in.');

      const userSnap = await getDoc(doc(db, 'users', user.uid));
      const userData = userSnap.exists() ? userSnap.data() : {};

      await addDoc(collection(db, 'venues', venueId, 'bookings'), {
        userId: user.uid,
        userName: userData.username || user.displayName || 'Anonymous',
        userEmail: user.email,
        notes,
        guests,
        date,
        time,
        createdAt: serverTimestamp(),
      });

      alert('Booking submitted!');
      setModalVisible(false);
      setDate('');
      setTime('');
      setNotes('');
      setGuests(1);
    } catch (err) {
      console.error(err);
      alert('Failed to book venue.');
    }
  };

  const incrementGuests = () => setGuests(prev => prev + 1);
  const decrementGuests = () => setGuests(prev => (prev > 1 ? prev - 1 : 1));

  if (loading || !venue) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ee2a7b" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: venue.imageUrl }} style={styles.image} />
      <Text style={styles.title}>{venue.name}</Text>
      <Text style={styles.description}>{venue.description}</Text>

      <GradientButton title="Book Now" onPress={() => setModalVisible(true)} />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Booking Info</Text>

            <TextInput
              placeholder="Date (YYYY-MM-DD)"
              value={date}
              onChangeText={setDate}
              style={styles.input}
            />
            <TextInput
              placeholder="Time (HH:MM)"
              value={time}
              onChangeText={setTime}
              style={styles.input}
            />
            <TextInput
              placeholder="Notes..."
              value={notes}
              onChangeText={setNotes}
              style={[styles.input, styles.textArea]}
              multiline
            />

            <View style={styles.guestCounterContainer}>
              <Text style={styles.guestLabel}>Guests:</Text>
              <View style={styles.counterControls}>
                <TouchableOpacity onPress={decrementGuests} style={styles.counterButton}>
                  <Text style={styles.counterText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.guestNumber}>{guests}</Text>
                <TouchableOpacity onPress={incrementGuests} style={styles.counterButton}>
                  <Text style={styles.counterText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <GradientButton title="Submit Booking" onPress={handleBooking} />
            <Pressable onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
              <Text style={{ color: '#888' }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 200, borderRadius: 10 },
  title: { fontSize: 22, fontWeight: 'bold', marginTop: 12 },
  description: { marginVertical: 10, fontSize: 14, color: '#555' },

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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  guestCounterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  guestLabel: { fontSize: 15, fontWeight: '500' },
  counterControls: { flexDirection: 'row', alignItems: 'center' },
  counterButton: {
    backgroundColor: '#eee',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  counterText: { fontSize: 18, fontWeight: '600' },
  guestNumber: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  cancelBtn: {
    marginTop: 10,
    alignItems: 'center',
  },
});

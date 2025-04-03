import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Modal, TextInput, Pressable, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientButton from '../components/GradientButton';
import { db, auth } from '../utils/firebaseConfig';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';

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
        const docRef = doc(db, 'venues', venueId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setVenue({ id: docSnap.id, ...docSnap.data() });
        } else {
          alert('Venue not found');
        }
      } catch (error) {
        console.error('Error fetching venue:', error);
        alert('Failed to load venue');
      } finally {
        setLoading(false);
      }
    };
    fetchVenue();
  }, [venueId]);

  const handleBooking = async () => {
    if (!date || !time) {
      alert('Please fill in both Date and Time.');
      return;
    }
  
    try {
      const user = auth.currentUser;
  
      if (!user) {
        alert('You must be logged in to book.');
        return;
      }
  
      // Fetch additional profile info from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
  
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
    } catch (error) {
      console.error('Error booking:', error);
      alert('Something went wrong while booking.');
    }
  };

  const incrementGuests = () => setGuests((prev) => prev + 1);
  const decrementGuests = () => setGuests((prev) => (prev > 1 ? prev - 1 : 1));

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ee2a7b" />
      </View>
    );
  }

  if (!venue) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: venue.imageUrl }} style={styles.image} />
      <View style={styles.infoContainer}>
        <View style={styles.rowBetween}>
          <View style={styles.rowLeft}>
            <Text style={styles.name}>{venue.name}</Text>
            <Ionicons name="star" size={18} color="#f9ce34" style={{ marginLeft: 6 }} />
            <Text style={styles.ratingText}>{venue.rating}</Text>
          </View>
          <View style={styles.rowRight}>
            <Ionicons name="time-outline" size={18} color="#888" />
            <Text style={styles.openingHours}>{venue.openingHours}</Text>
          </View>
        </View>

        <Text style={styles.location}>{venue.location}</Text>

        <Text style={styles.description}>{venue.description}</Text>

        <View style={styles.buttonWrapper}>
          <GradientButton title="Book Now" onPress={() => setModalVisible(true)} />
        </View>

        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Booking Info</Text>

              <TextInput
                placeholder="Date (e.g. 2025-04-05)"
                value={date}
                onChangeText={setDate}
                style={styles.input}
              />
              <TextInput
                placeholder="Time (e.g. 19:00)"
                value={time}
                onChangeText={setTime}
                style={styles.input}
              />
              <TextInput
                placeholder="Optional notes..."
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

              <GradientButton title="Submit" onPress={handleBooking} />

              <Pressable onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                <Text style={{ color: '#888' }}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 200,
  },
  infoContainer: {
    padding: 20,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 4,
  },
  openingHours: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    marginBottom: 20,
  },
  buttonWrapper: {
    alignItems: 'center',
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
  guestLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterButton: {
    backgroundColor: '#eee',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  counterText: {
    fontSize: 18,
    fontWeight: '600',
  },
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

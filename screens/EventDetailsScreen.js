import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth, db } from '../utils/firebaseConfig';
import GradientHeader from '../components/GradientHeader';
import GradientButton from '../components/GradientButton';
import { Ionicons } from '@expo/vector-icons';

export default function EventDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { eventId } = route.params;

  const [event, setEvent] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const snap = await getDoc(doc(db, 'events', eventId));
        if (!snap.exists()) return;
        setEvent({ id: snap.id, ...snap.data() });
      } catch (err) {
        console.error('Error loading event:', err);
      }
    };

    const fetchUser = async () => {
      const user = auth.currentUser;
      if (!user) return;

      setCurrentUser(user);

      const snap = await getDoc(doc(db, 'users', user.uid));
      const data = snap.data();
      setUserDoc(data);

      if (event?.createdBy === user.email) {
        setIsOwner(true);
      } else if (event?.venueId && data?.venueIds?.includes(event.venueId)) {
        setIsOwner(true);
      }

      setBookmarked(data?.bookmarkedEvents?.includes(eventId));
    };

    if (eventId) {
      fetchEvent();
    }

    // Fetch user AFTER event is loaded
    // to check venue ownership, etc.
    // Ensured by separate useEffect below
  }, [eventId]);

  useEffect(() => {
    if (event && auth.currentUser) {
      fetchUserInfoForOwnership();
    }
  }, [event]);

  const fetchUserInfoForOwnership = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setCurrentUser(user);

    const snap = await getDoc(doc(db, 'users', user.uid));
    const data = snap.data();
    setUserDoc(data);

    const ownsVenue = event?.venueId && data?.venueIds?.includes(event.venueId);
    const createdIt = event?.createdBy === user.email;
    setIsOwner(createdIt || ownsVenue);
    setBookmarked(data?.bookmarkedEvents?.includes(eventId));
  };

  const toggleBookmark = async () => {
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        bookmarkedEvents: bookmarked ? arrayRemove(eventId) : arrayUnion(eventId),
      });
      setBookmarked(!bookmarked);
    } catch (err) {
      console.error('Bookmark error:', err);
    }
  };

  const handleEdit = () => {
    Alert.alert('Edit Event', 'Editing feature coming soon.');
    // You can navigate to an EditEventScreen here
  };

  if (!event) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#888' }}>Loading event...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <Image source={{ uri: event.imageUrl }} style={styles.banner} />

        <View style={styles.content}>
          <View style={styles.rowBetween}>
            <Text style={styles.title}>{event.name}</Text>
            <TouchableOpacity onPress={toggleBookmark}>
              <Ionicons
                name={bookmarked ? 'bookmark' : 'bookmark-outline'}
                size={28}
                color={bookmarked ? '#ee2a7b' : '#888'}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>{event.date} @ {event.time}</Text>
          {event.location && (
            <Text style={styles.location}>📍 {event.location}</Text>
          )}

          {event.venueId && (
            <TouchableOpacity
              onPress={() => navigation.navigate('VenueDetails', { venueId: event.venueId })}
              style={styles.venueBtn}
            >
              <Ionicons name="navigate" size={16} color="#fff" />
              <Text style={styles.venueBtnText}>Go to Venue</Text>
            </TouchableOpacity>
          )}

          {isOwner && (
            <View style={{ marginTop: 24 }}>
              <GradientButton title="Edit Event" onPress={handleEdit} />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  banner: { width: '100%', height: 240 },
  content: { padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#666' },
  location: { fontSize: 15, color: '#444', marginTop: 6 },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  venueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6228d7',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginTop: 14,
    alignSelf: 'flex-start',
  },
  venueBtnText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
});

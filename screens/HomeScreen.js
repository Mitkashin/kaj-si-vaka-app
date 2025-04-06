import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput, Platform, Animated, Dimensions } from 'react-native';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, } from 'firebase/firestore';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../utils/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const categories = ['Bars', 'Clubs', 'Live Music', 'Events'];

export default function HomeScreen({ navigation }) {
  const [premiumVenues, setPremiumVenues] = useState([]);
  const [regularVenues, setRegularVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDoc, setUserDoc] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const screenWidth = Dimensions.get('window').width;
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);
  const autoScrollRef = useRef(null);
  const carouselPosition = useRef(0);

  const FadeInImage = ({ uri }) => {
    const fadeAnim = useState(new Animated.Value(0))[0];
    return (
      <Animated.Image
        source={{ uri }}
        style={[styles.premiumImage, { opacity: fadeAnim }]}
        onLoad={() => {
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: false,
          }).start();
        }}
        resizeMode="cover"
      />
    );
  };

/// Fetch user document from Firestore
  const fetchUserDoc = async () => {
    const user = auth.currentUser;
    if (!user) return;
    setCurrentUser(user);
    const snap = await getDoc(doc(db, 'users', user.uid));
    setUserDoc(snap.data());
  };

/// Fetch user document from Firestore
  useEffect(() => {
    fetchUserDoc();
  }, []);

/// Fetch venues from Firestore
  const fetchVenues = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'venues'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const premiums = data.filter(v => v.isPremium);
      const regulars = data.filter(v => !v.isPremium);
      const sorted = [...regulars].sort((a, b) => {
        const openA = isVenueOpen(a.openingHours);
        const openB = isVenueOpen(b.openingHours);
        return openA === openB ? 0 : openA ? -1 : 1;
      });
      setPremiumVenues(premiums);
      setRegularVenues(sorted);
      setFilteredVenues(sorted);
    } catch (error) {
      console.error('Error loading venues:', error);
    }
  };

// Fetch events from Firestore
  useEffect(() => {
    if (premiumVenues.length === 0) return;

    autoScrollRef.current = setInterval(() => {
      const nextIndex = (carouselPosition.current + 1) % premiumVenues.length;
      const xOffset = nextIndex * (screenWidth * 0.75 + 16);
      scrollRef.current?.scrollTo({ x: xOffset, animated: true });
      carouselPosition.current = nextIndex;
    }, 4000);
    return () => clearInterval(autoScrollRef.current);
  }, [premiumVenues]);

/// Handle scroll event to update carousel position
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event) => {
        const x = event.nativeEvent.contentOffset.x;
        const index = Math.round(x / (screenWidth * 0.75 + 16));
        carouselPosition.current = index;
      },
    }
  );

  /// Fetch events from Firestore
  const fetchEvents = async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const q = query(collection(db, 'events'), where('date', '>=', todayStr));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  /// Check if venue is open based on opening hours
  const isVenueOpen = (hours) => {
    if (!hours) return false;
    const [start, end] = hours.split('-');
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    if (endMinutes < startMinutes) {
      return nowMinutes >= startMinutes || nowMinutes <= endMinutes;
    } else {
      return nowMinutes >= startMinutes && nowMinutes <= endMinutes;
    }
  };

  /// Get venue status message based on opening hours
  const getVenueStatus = (hours) => {
    if (!hours) return { open: false, message: 'Unknown' };
    const [start, end] = hours.split('-');
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    let isOpen = endMinutes < startMinutes
      ? nowMinutes >= startMinutes || nowMinutes < endMinutes
      : nowMinutes >= startMinutes && nowMinutes < endMinutes;
    const diff = (a, b) => {
      let minutes = b - a;
      if (minutes < 0) minutes += 1440;
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return `${h}h ${m}m`;
    };
    
    let message = isOpen
      ? `🟢 Open • Closes in ${diff(nowMinutes, endMinutes)}`
      : `🔴 Closed • Opens in ${diff(nowMinutes, startMinutes)}`;
    return { open: isOpen, message };
  };

  /// Handle refresh action
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([fetchVenues(), fetchEvents()]).finally(() => setRefreshing(false));
  }, []);
  useEffect(() => {
    Promise.all([fetchVenues(), fetchEvents()]).finally(() => setLoading(false));
  }, []);

  /// Filter venues based on search query
  useEffect(() => {
    if (searchQuery === '') {
      setFilteredVenues(regularVenues);
    } else {
      const lower = searchQuery.toLowerCase();
      const filtered = regularVenues.filter(v =>
        v.name.toLowerCase().includes(lower) || v.location.toLowerCase().includes(lower)
      );
      setFilteredVenues(filtered);
    }
  }, [searchQuery, regularVenues]);
  const handleCardPress = (venue) => {
    navigation.navigate('VenueDetails', { venueId: venue.id });
  };
  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#ee2a7b" /></View>;
  }
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >

{/* -------------------------------------------------------------------------------------------------------------------- */}

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <LinearGradient colors={['#f9ce34', '#ee2a7b', '#6228d7']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientBorder}>
          <View style={styles.searchInputContainer}>
            <TextInput
              placeholder="Search venues..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              placeholderTextColor="#888"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearIcon}>
                <Ionicons name="close" size={20} color="#888" />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </View>

{/* -------------------------------------------------------------------------------------------------------------------- */}

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {categories.map((item, index) => (
          <View key={index} style={styles.categoryItem}><Text style={styles.categoryText}>{item}</Text></View>
        ))}
      </ScrollView>

{/* -------------------------------------------------------------------------------------------------------------------- */}

      {/* Premium Venue Carousel */}
      {/* Auto-sliding Premium Carousel */}
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.carouselScroll}
        scrollEventThrottle={16}
        pagingEnabled={false}
        onScroll={handleScroll}
        snapToInterval={screenWidth * 0.75 + 16}
        decelerationRate="fast"
      >
        {premiumVenues.map((item) => {
          const isBookmarked = userDoc?.bookmarkedVenues?.includes(item.id);
          const toggleFavorite = async () => {
            const user = auth.currentUser;
            if (!user) return Alert.alert('Please log in to save favorites.');
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
              bookmarkedVenues: isBookmarked ? arrayRemove(item.id) : arrayUnion(item.id),
            });
            fetchUserDoc();
          };
          return (
            <View key={item.id} style={[styles.premiumCard, { width: screenWidth * 0.75 }]}>
              <TouchableOpacity style={styles.imageWrapper} onPress={() => handleCardPress(item)}>
                <FadeInImage uri={item.imageUrl} />
                <TouchableOpacity onPress={toggleFavorite} style={styles.heartIconPremium}>
                  <Ionicons name={isBookmarked ? 'heart' : 'heart-outline'} size={22} color={isBookmarked ? '#ee2a7b' : '#444'} />
                </TouchableOpacity>
                <View style={styles.premiumOverlay}>
                  <Text style={styles.premiumName}>{item.name}</Text>
                  <Text style={styles.premiumLocation}>{item.location}</Text>
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </Animated.ScrollView>


{/* -------------------------------------------------------------------------------------------------------------------- */}


      {/* Events Carousel */}
      <View style={styles.eventsCarouselWrapper}>
        <Text style={styles.eventsTitle}>Upcoming Events</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {events.map(event => (
            <TouchableOpacity key={event.id} style={styles.eventCard} onPress={() => navigation.navigate('EventDetails', { eventId: event.id })}>
              <FadeInImage uri={event.imageUrl} />

              <View style={styles.eventOverlay}>
                <Text style={styles.eventName}>{event.name}</Text>
                <Text style={styles.eventDate}>{event.date} @ {event.time}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>


{/* -------------------------------------------------------------------------------------------------------------------- */}


      {/* Venue List */}
      <View style={[styles.venueListWrapper, Platform.OS === 'web' && styles.venueListWeb]}>
        <View style={styles.venueList}>
          {filteredVenues.map((item) => {
            const { open, message } = getVenueStatus(item.openingHours || '');
            const [statusIcon, ...rest] = message.split(' • ');
            const isBookmarked = userDoc?.bookmarkedVenues?.includes(item.id);
            const toggleFavorite = async () => {
              try {
                const user = auth.currentUser;
                if (!user) {
                  Alert.alert('Please log in to save favorites.');
                  return;
                }
                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, {
                  bookmarkedVenues: isBookmarked
                    ? arrayRemove(item.id)
                    : arrayUnion(item.id),
                });
                fetchUserDoc(); // Refresh local state
              } catch (err) {
                console.error('Failed to toggle favorite:', err);
              }
            };
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.venueCard, !open && styles.venueCardClosed]}
                onPress={() => handleCardPress(item)}
              >
                <View style={{ position: 'relative' }}>
                  <Image source={{ uri: item.imageUrl }} style={styles.venueImage} />

                  <TouchableOpacity
                    onPress={toggleFavorite}
                    style={styles.heartIconWrapper}
                  >
                    <Ionicons
                      name={isBookmarked ? 'heart' : 'heart-outline'}
                      size={20}
                      color={isBookmarked ? '#ee2a7b' : '#666'}
                    />
                  </TouchableOpacity>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.venueName}>{item.name}</Text>
                    <View style={{ alignItems: 'flex-end', maxWidth: 140 }}>
                      <Text style={[styles.openStatus, open ? styles.open : styles.closed]}>{statusIcon}</Text>
                      <Text style={[styles.hoursText, open ? styles.open : styles.closed]}>{rest.join(' • ')}</Text>
                    </View>
                  </View>
                  <Text style={styles.venueLocation}>{item.location}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 100 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchWrapper: { paddingHorizontal: 16, paddingTop: 12 },
  gradientBorder: { padding: 2, borderRadius: 8 },
  searchInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 6, paddingHorizontal: 8, },
  searchInput: { flex: 1, paddingVertical: 8, fontSize: 16 },
  clearIcon: { padding: 4 },
  categoryScroll: { paddingVertical: 12, paddingHorizontal: 12 },
  categoryItem: { backgroundColor: '#f2f2f2', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10, marginRight: 10, borderWidth: 1, borderColor: '#ddd', minHeight: 40, justifyContent: 'center', },
  categoryText: { fontSize: 15, fontWeight: '600' },
  carouselScroll: { paddingHorizontal: 12, paddingBottom: 16 },
  premiumCard: { width: 280, height: 320, marginRight: 16, borderRadius: 12, overflow: 'hidden', backgroundColor: '#f5f5f5', },
  imageWrapper: { flex: 1, position: 'relative', },
  premiumImage: { width: '100%', height: '100%', },
  premiumOverlay: { position: 'absolute', bottom: 0, left: 0, width: '100%', padding: 10, backgroundColor: 'rgba(0,0,0,0.5)', },
  premiumName: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  premiumLocation: { color: '#ccc', fontSize: 12 },
  eventsCarouselWrapper: { paddingHorizontal: 16, marginBottom: 16 },
  eventsTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  eventCard: { width: 280, height: 200, marginRight: 16, borderRadius: 12, overflow: 'hidden', backgroundColor: '#f5f5f5', },
  eventImage: { width: '100%', height: '100%' },
  eventOverlay: { position: 'absolute', bottom: 0, left: 0, padding: 8, backgroundColor: 'rgba(0,0,0,0.5)', width: '100%', },
  eventName: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  eventDate: { color: '#ccc', fontSize: 12 },
  venueList: { paddingHorizontal: 16 },
  venueListWrapper: { width: '100%', },
  venueListWeb: { maxWidth: '50%', alignSelf: 'center', },
  venueCard: { flexDirection: 'row', padding: 12, marginVertical: 6, borderRadius: 10, backgroundColor: '#fafafa', alignItems: 'center', },
  venueCardClosed: { backgroundColor: '#eaeaea', opacity: 0.7, },
  venueImage: { width: 60, height: 60, borderRadius: 8, marginRight: 12, },
  venueName: { fontWeight: '600', fontSize: 16 },
  venueLocation: { color: '#777', fontSize: 13 },
  openStatus: { fontSize: 12, fontWeight: '600', textAlign: 'right', marginLeft: 10 },
  hoursText: { fontSize: 12, marginTop: 2 },
  open: { color: '#2ecc71' },
  closed: { color: '#e74c3c' },
  heartIconWrapper: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 20, padding: 4, },
  heartIconPremium: { position: 'absolute', top: 10, right: 10, zIndex: 2, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 16, padding: 6, },
});
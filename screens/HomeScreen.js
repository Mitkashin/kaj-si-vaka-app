import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const categories = ['Bars', 'Clubs', 'Live Music', 'Events'];

export default function HomeScreen({ navigation }) {
  const [premiumVenues, setPremiumVenues] = useState([]);
  const [regularVenues, setRegularVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchVenues = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'venues'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const premiums = data.filter(v => v.isPremium);
      const regulars = data.filter(v => !v.isPremium);
      setPremiumVenues(premiums);
      setRegularVenues(regulars);
      setFilteredVenues(regulars);
    } catch (error) {
      console.error('Error loading venues:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  useEffect(() => {
    if (searchQuery === '') {
      setFilteredVenues(regularVenues);
    } else {
      const lower = searchQuery.toLowerCase();
      const filtered = regularVenues.filter(v => v.name.toLowerCase().includes(lower) || v.location.toLowerCase().includes(lower));
      setFilteredVenues(filtered);
    }
  }, [searchQuery, regularVenues]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchVenues();
  }, []);

  const handleCardPress = (venue) => {
    navigation.navigate('VenueDetails', { venueId: venue.id });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#ee2a7b" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <LinearGradient
          colors={['#f9ce34', '#ee2a7b', '#6228d7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBorder}
        >
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

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {categories.map((item, index) => (
          <View key={index} style={styles.categoryItem}>
            <Text style={styles.categoryText}>{item}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Premium Venue Carousel */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carouselScroll}>
        {premiumVenues.map((item) => (
          <TouchableOpacity key={item.id} style={styles.premiumCard} onPress={() => handleCardPress(item)}>
            <Image source={{ uri: item.imageUrl }} style={styles.premiumImage} />
            <View style={styles.premiumOverlay}>
              <Text style={styles.premiumName}>{item.name}</Text>
              <Text style={styles.premiumLocation}>{item.location}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Venue List */}
      <View style={styles.venueList}>
        {filteredVenues.map((item) => (
          <TouchableOpacity key={item.id} style={styles.venueCard} onPress={() => handleCardPress(item)}>
            <Image source={{ uri: item.imageUrl }} style={styles.venueImage} />
            <View>
              <Text style={styles.venueName}>{item.name}</Text>
              <Text style={styles.venueLocation}>{item.location}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 100 },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  gradientBorder: {
    padding: 2,
    borderRadius: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingHorizontal: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    fontSize: 16,
  },
  clearIcon: {
    padding: 4,
  },
  categoryScroll: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  categoryItem: {
    backgroundColor: '#f2f2f2',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    minHeight: 40,
    justifyContent: 'center',
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '600',
  },
  carouselScroll: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  premiumCard: {
    width: 280,
    height: 160,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  premiumImage: {
    width: '100%',
    height: '100%',
  },
  premiumOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: '100%',
  },
  premiumName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  premiumLocation: {
    color: '#ccc',
    fontSize: 12,
  },
  venueList: {
    paddingBottom: 80,
    paddingHorizontal: 16,
  },
  venueCard: {
    flexDirection: 'row',
    padding: 12,
    marginVertical: 6,
    backgroundColor: '#fafafa',
    borderRadius: 10,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
  },
  venueImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  venueName: { fontWeight: '600', fontSize: 16 },
  venueLocation: { color: '#777', fontSize: 13 },
});
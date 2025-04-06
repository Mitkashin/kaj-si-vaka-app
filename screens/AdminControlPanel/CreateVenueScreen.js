// [Updated CreateVenueScreen - adjusted Create Venue button size]
import React, { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
  Alert,
  ScrollView,
  Image,
  Switch
} from 'react-native';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../utils/firebaseConfig';
import GradientButton from '../../components/GradientButton';

export default function CreateVenueScreen() {
  const [venues, setVenues] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [searchQuery, setSearchQuery] = useState('');
  const [venueForm, setVenueForm] = useState({
    name: '', location: '', openingHours: '', description: '', amenities: '', imageUrl: '', isPremium: false
  });

  const fetchVenuesAndUsers = async () => {
    try {
      const venuesSnap = await getDocs(collection(db, 'venues'));
      const usersSnap = await getDocs(collection(db, 'users'));
      setVenues(venuesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setUsers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    fetchVenuesAndUsers();
  }, []);

  const getOwnerName = (venueId) => {
    const owner = users.find(u => u.venueIds?.includes(venueId));
    return owner ? owner.username || owner.email : 'Unowned';
  };

  const filteredVenues = venues.filter(v => {
    const ownerName = getOwnerName(v.id).toLowerCase();
    return (
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ownerName.includes(searchQuery.toLowerCase())
    );
  });

  const openVenueModal = (venue) => {
    setSelectedVenue(venue);
    setVenueForm({
      name: venue.name || '',
      location: venue.location || '',
      openingHours: venue.openingHours || '',
      description: venue.description || '',
      amenities: venue.amenities?.join(', ') || '',
      imageUrl: venue.imageUrl || '',
      isPremium: venue.isPremium || false
    });
    setActiveTab('info');
    setModalVisible(true);
  };

  const updateVenue = async (updates = {}) => {
    try {
      await updateDoc(doc(db, 'venues', selectedVenue.id), {
        ...venueForm,
        amenities: venueForm.amenities.split(',').map(a => a.trim()),
        ...updates
      });
      fetchVenuesAndUsers();
      Alert.alert('Success', 'Venue updated successfully');
    } catch (err) {
      console.error('Failed to update venue:', err);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 1 });
    if (!result.canceled && result.assets.length > 0) {
      setVenueForm(prev => ({ ...prev, imageUrl: result.assets[0].uri }));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchWrapper}>
        <LinearGradient colors={['#f9ce34', '#ee2a7b', '#6228d7']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientBorder}>
          <View style={styles.searchInputContainer}>
            <TextInput
              placeholder="Search venues or owner..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              placeholderTextColor="#888"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearIcon}>
                <Text style={{ fontSize: 16, color: '#888' }}>×</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </View>
      <View style={styles.createButtonWrapper}>
        <GradientButton title="Create Venue" onPress={() => Alert.alert('Not implemented yet')} />
      </View>

      <FlatList
        data={filteredVenues}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={() => (
          <View style={styles.noResults}><Text style={styles.noResultsText}>No venues found</Text></View>
        )}
        renderItem={({ item }) => (
          <View style={styles.venueCard}>
            <View style={styles.venueRow}>
              {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.venueThumb} />}
              <View style={{ flex: 1, paddingLeft: 10 }}>
                <Text style={styles.venueName}>{item.name}</Text>
                <Text style={styles.venueLocation}>{item.location}</Text>
                <Text style={styles.owner}>Owner: {getOwnerName(item.id)}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => openVenueModal(item)} style={styles.manageButtonWrapper}>
              <LinearGradient colors={['#f9ce34', '#ee2a7b', '#6228d7']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gearButtonWrapper}>
                <Ionicons name="settings" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      />

      {selectedVenue && (
        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, Platform.OS === 'web' && styles.modalWebWidth]}>
              <Text style={styles.modalTitle}>Manage: {selectedVenue.name || 'Unnamed'}</Text>
              <View style={styles.tabRow}>
                {['info', 'image', 'premium'].map(tab => (
                  <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={[styles.tabBtn, activeTab === tab && styles.activeTabBtn]}>
                    <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                      {tab === 'info' ? 'Edit Info' : tab === 'image' ? 'Image Upload' : 'Premium Status'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                {activeTab === 'info' && (
                  <View>
                    <TextInput style={styles.input} value={venueForm.name} placeholder="Name" onChangeText={text => setVenueForm({ ...venueForm, name: text })} />
                    <TextInput style={styles.input} value={venueForm.location} placeholder="Location" onChangeText={text => setVenueForm({ ...venueForm, location: text })} />
                    <TextInput style={styles.input} value={venueForm.openingHours} placeholder="Opening Hours" onChangeText={text => setVenueForm({ ...venueForm, openingHours: text })} />
                    <TextInput style={styles.input} value={venueForm.description} placeholder="Description" onChangeText={text => setVenueForm({ ...venueForm, description: text })} multiline />
                    <TextInput style={styles.input} value={venueForm.amenities} placeholder="Amenities (comma-separated)" onChangeText={text => setVenueForm({ ...venueForm, amenities: text })} />
                    <GradientButton title="Save Info" onPress={updateVenue} style={{ marginTop: 8 }} />
                  </View>
                )}
                {activeTab === 'image' && (
                  <View>
                    {venueForm.imageUrl ? <Image source={{ uri: venueForm.imageUrl }} style={{ width: '100%', height: 180, borderRadius: 10, marginBottom: 10 }} /> : null}
                    <GradientButton title="Pick Image" onPress={pickImage} />
                    <GradientButton title="Save Image" onPress={() => updateVenue()} style={{ marginTop: 8 }} />
                  </View>
                )}
                {activeTab === 'premium' && (
                  <View style={{ alignItems: 'center', paddingVertical: 12 }}>
                    <Text style={{ marginBottom: 10, fontSize: 16 }}>Is this venue premium?</Text>
                    <Switch
                      value={venueForm.isPremium}
                      onValueChange={(val) => {
                        setVenueForm(prev => ({ ...prev, isPremium: val }));
                        updateVenue({ isPremium: val });
                      }}
                    />
                  </View>
                )}
                <GradientButton title="Close" onPress={() => setModalVisible(false)} style={{ marginTop: 16 }} />
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', width: '100%', ...(Platform.OS === 'web' ? { maxWidth: '50%', alignSelf: 'center' } : {}) },
  searchWrapper: { paddingHorizontal: 16, paddingTop: 12 },
  gradientBorder: { borderRadius: 8, padding: 2 },
  searchInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 6, paddingHorizontal: 8, borderWidth: 1, borderColor: '#ccc' },
  searchInput: { flex: 1, paddingVertical: 8, fontSize: 16 },
  clearIcon: { padding: 4 },
  createButtonWrapper: { alignItems: 'center', paddingHorizontal: 16, marginTop: 16, marginBottom: 16, },
  noResults: { alignItems: 'center', padding: 20 },
  noResultsText: { fontSize: 16, color: '#888', fontStyle: 'italic' },
  venueCard: { position: 'relative', backgroundColor: '#f9f9f9', borderRadius: 12, padding: 16, marginBottom: 16 },
  venueRow: { flexDirection: 'row', alignItems: 'center' },
  venueThumb: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#eee' },
  venueName: { fontSize: 16, fontWeight: 'bold' },
  venueLocation: { fontSize: 13, color: '#666' },
  owner: { marginTop: 6, fontSize: 14 },
  manageButtonWrapper: { position: 'absolute', right: 0, top: 0, bottom: 0, justifyContent: 'center', borderTopRightRadius: 12, borderBottomRightRadius: 12, overflow: 'hidden' },
  gearButtonWrapper: { paddingHorizontal: 12, paddingVertical: 16, justifyContent: 'center', height: '100%' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', width: '90%', maxHeight: '85%', borderRadius: 16, padding: 16 },
  modalWebWidth: { maxWidth: '50%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  tabRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12, borderBottomWidth: 1, borderColor: '#eee' },
  tabBtn: { paddingVertical: 6, paddingHorizontal: 10 },
  activeTabBtn: { borderBottomWidth: 2, borderColor: '#ee2a7b' },
  tabText: { fontSize: 14, color: '#666' },
  activeTabText: { color: '#ee2a7b', fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 8 }
});

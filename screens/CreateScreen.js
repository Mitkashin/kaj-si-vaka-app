import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  Image, Platform, Alert, ActivityIndicator
} from 'react-native';
import { addDoc, collection, getDoc, getDocs, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { db, auth, storage } from '../utils/firebaseConfig';
import GradientButton from '../components/GradientButton';

export default function CreateScreen({ navigation }) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [venues, setVenues] = useState([]);
  const [selectedVenueId, setSelectedVenueId] = useState('');
  const [loadingVenues, setLoadingVenues] = useState(true);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const userSnap = await getDoc(doc(db, 'users', user.uid));
        const userData = userSnap.data();
        const venueIds = userData?.venueIds || [];

        const venueSnap = await getDocs(collection(db, 'venues'));
        const allVenues = venueSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const ownedVenues = allVenues.filter(v => venueIds.includes(v.id));

        setVenues(ownedVenues);
      } catch (error) {
        console.error("Failed to load venues:", error);
      } finally {
        setLoadingVenues(false);
      }
    };

    fetchVenues();
  }, []);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission required", "You need to allow photo access to upload an image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleCreate = async () => {
    if (!name || !location || !date || !time) {
      Alert.alert("Missing fields", "Please fill all required fields.");
      return;
    }

    setUploading(true);

    let imageUrl = '';
    if (image?.uri) {
      try {
        const response = await fetch(image.uri);
        const blob = await response.blob();
        const filename = `events/${Date.now()}_${auth.currentUser?.uid || 'anon'}.jpg`;
        const imageRef = ref(storage, filename);
        await uploadBytes(imageRef, blob);
        imageUrl = await getDownloadURL(imageRef);
      } catch (err) {
        console.error('Image upload failed:', err);
        Alert.alert("Upload failed", "Couldn't upload image.");
        setUploading(false);
        return;
      }
    }

    try {
      const newEvent = {
        name,
        location,
        date: date.toISOString().split('T')[0],
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        imageUrl,
        createdBy: auth.currentUser?.email || 'anonymous',
        createdAt: serverTimestamp(),
      };

      if (selectedVenueId) {
        newEvent.venueId = selectedVenueId;
      }

      await addDoc(collection(db, 'events'), newEvent);

      Alert.alert("Event created");
      setName('');
      setLocation('');
      setDate(new Date());
      setTime(new Date());
      setImage(null);
      setSelectedVenueId('');
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert("Error", "Couldn't create event.");
    }

    setUploading(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.label}>Event Name</Text>
        <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Name" />

        <Text style={styles.label}>Location</Text>
        <TextInput
          value={location}
          onChangeText={setLocation}
          style={styles.input}
          placeholder="Location"
          editable={!selectedVenueId}
        />

        <Text style={styles.label}>Date</Text>
        {Platform.OS === 'web' ? (
          <input
            type="date"
            className="webInputFix"
            value={date.toISOString().split('T')[0]}
            onChange={(e) => setDate(new Date(e.target.value))}
            style={styles.webInput}
          />
        ) : (
          <>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
              <Text>{date.toDateString()}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                mode="date"
                value={date}
                onChange={(e, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setDate(selectedDate);
                }}
              />
            )}
          </>
        )}

        <Text style={styles.label}>Time</Text>
        {Platform.OS === 'web' ? (
          <input
            type="time"
            className="webInputFix"
            value={time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            onChange={(e) => {
              const [h, m] = e.target.value.split(':').map(Number);
              const newTime = new Date();
              newTime.setHours(h);
              newTime.setMinutes(m);
              setTime(newTime);
            }}
            style={styles.webInput}
          />
        ) : (
          <>
            <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.input}>
              <Text>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                mode="time"
                value={time}
                is24Hour={true}
                display="default"
                onChange={(e, selectedTime) => {
                  setShowTimePicker(false);
                  if (selectedTime) setTime(selectedTime);
                }}
              />
            )}
          </>
        )}

        <Text style={styles.label}>Pick a Venue (optional)</Text>
        {loadingVenues ? (
          <ActivityIndicator size="small" color="#ee2a7b" />
        ) : venues.length === 0 ? (
          <Text style={{ fontStyle: 'italic', color: '#666', marginBottom: 12 }}>No venues linked to your account.</Text>
        ) : (
          venues.map((venue) => {
            const isSelected = selectedVenueId === venue.id;
            return (
              <TouchableOpacity
                key={venue.id}
                onPress={() => {
                  if (isSelected) {
                    setSelectedVenueId('');
                    setLocation('');
                  } else {
                    setSelectedVenueId(venue.id);
                    setLocation(venue.location || '');
                  }
                }}
                style={[
                  styles.venueOption,
                  isSelected && styles.venueSelected
                ]}
              >
                <Text style={{ fontWeight: '500' }}>{venue.name}</Text>
                <Text style={{ fontSize: 12, color: '#666' }}>{venue.location}</Text>
              </TouchableOpacity>
            );
          })
        )}

        <Text style={styles.label}>Event Image</Text>
        {image && (
          <Image
            source={{ uri: image.uri }}
            style={{ width: '100%', height: 200, borderRadius: 8, marginBottom: 12 }}
            resizeMode="cover"
          />
        )}
        <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
          <Text style={styles.uploadBtnText}>Pick Image</Text>
        </TouchableOpacity>

        <View style={{ marginTop: 24 }}>
          <GradientButton
            title={uploading ? 'Creating...' : 'Create Event'}
            onPress={handleCreate}
            disabled={uploading}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    width: '100%',
    ...(Platform.OS === 'web' && {
      maxWidth: '50%',
      alignSelf: 'center',
    }),
  },
  label: { marginTop: 12, fontSize: 16, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 6,
    marginTop: 6,
  },
  uploadBtn: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#6228d7',
    alignItems: 'center',
  },
  uploadBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  venueOption: {
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 8,
  },
  venueSelected: {
    borderColor: '#ee2a7b',
    backgroundColor: '#fef1f8',
  },
  webInput: {
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 6,
    width: '100%',
    fontSize: 16,
    boxSizing: 'border-box',
  },
});
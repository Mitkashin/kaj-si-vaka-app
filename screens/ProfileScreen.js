import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { auth, db } from '../utils/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import GradientButton from '../components/GradientButton';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          console.log('No user profile data found!');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.uid) fetchUserData();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      alert(error.message);
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
      <LinearGradient colors={['#f9ce34', '#ee2a7b', '#6228d7']} style={styles.header}>
        <Image source={require('../assets/avatar.png')} style={styles.avatar} />
        <Text style={styles.name}>{userData?.username || 'Anonymous'}</Text>
        <Text style={styles.email}>{userData?.email || user?.email}</Text>
      </LinearGradient>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Phone:</Text>
        <Text style={styles.infoValue}>{userData?.phone || 'Not set'}</Text>
        <View style={styles.divider} />
        <Text style={styles.infoTitle}>Joined:</Text>
        <Text style={styles.infoValue}>
          {userData?.createdAt?.toDate().toLocaleDateString() || 'Unknown'}
        </Text>
      </View>

      <View style={styles.footer}>
        <GradientButton title="Sign Out" onPress={handleSignOut} />
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
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
  infoSection: {
    padding: 20,
    marginTop: 10,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  infoValue: {
    fontSize: 16,
    marginBottom: 12,
    color: '#555',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
});

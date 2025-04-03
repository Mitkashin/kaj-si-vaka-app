import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from '../utils/firebaseConfig';
import {
  doc,
  getDoc,
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
} from 'firebase/firestore';
import GradientButton from '../components/GradientButton';

const COMMENTS_PAGE_SIZE = 5;

export default function VenueDetailsScreen({ route }) {
  const { venueId } = route.params;
  const [venue, setVenue] = useState(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchVenue = async () => {
      const docSnap = await getDoc(doc(db, 'venues', venueId));
      if (docSnap.exists()) setVenue({ id: docSnap.id, ...docSnap.data() });
    };

    const fetchUser = async () => {
      const user = auth.currentUser;
      if (user) {
        const snap = await getDoc(doc(db, 'users', user.uid));
        setUserData({ uid: user.uid, email: user.email, ...snap.data() });
      }
    };

    fetchVenue();
    fetchUser();
    fetchComments();
  }, [venueId]);

  const fetchComments = async () => {
    const q = query(
      collection(db, 'venues', venueId, 'comments'),
      orderBy('createdAt', 'desc'),
      limit(COMMENTS_PAGE_SIZE)
    );

    const snap = await getDocs(q);
    const loaded = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setComments(loaded);
    setLastVisible(snap.docs[snap.docs.length - 1]);
    setHasMore(snap.docs.length === COMMENTS_PAGE_SIZE);
    setLoading(false);
  };

  const loadMoreComments = async () => {
    if (!lastVisible || !hasMore) return;
    setLoadingMore(true);

    const q = query(
      collection(db, 'venues', venueId, 'comments'),
      orderBy('createdAt', 'desc'),
      startAfter(lastVisible),
      limit(COMMENTS_PAGE_SIZE)
    );

    const snap = await getDocs(q);
    const more = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setComments((prev) => [...prev, ...more]);
    setLastVisible(snap.docs[snap.docs.length - 1]);
    setHasMore(snap.docs.length === COMMENTS_PAGE_SIZE);
    setLoadingMore(false);
  };

  const handleComment = async () => {
    if (!comment) return;
    await addDoc(collection(db, 'venues', venueId, 'comments'), {
      text: comment,
      userId: userData.uid,
      userName: userData.username || 'Anonymous',
      userEmail: userData.email,
      userAvatar: userData.avatarUrl || null,
      createdAt: serverTimestamp(),
      reactions: [],
      replies: [],
    });
    setComment('');
    fetchComments();
  };

  const handleDelete = async (commentId) => {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteDoc(doc(db, 'venues', venueId, 'comments', commentId));
          fetchComments();
        },
      },
    ]);
  };

  const handleReact = async (commentId, emoji) => {
    const commentRef = doc(db, 'venues', venueId, 'comments', commentId);
    const snap = await getDoc(commentRef);
    const data = snap.data();
    const reactions = data.reactions || [];

    const updated = reactions.includes(emoji)
      ? reactions.filter((r) => r !== emoji)
      : [...reactions, emoji];

    await updateDoc(commentRef, { reactions: updated });
    fetchComments();
  };

  if (loading) {
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
      <Text style={styles.desc}>{venue.description}</Text>

      {venue.amenities?.length > 0 && (
        <View style={styles.amenitiesSection}>
          <Text style={styles.amenitiesTitle}>Amenities</Text>
          <View style={styles.amenitiesList}>
            {venue.amenities.map((item, index) => (
              <View key={index} style={styles.amenityChip}>
                <Text style={styles.amenityText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>Comments</Text>

      <View style={styles.commentInputRow}>
        <TextInput
          style={styles.input}
          value={comment}
          onChangeText={setComment}
          placeholder="Write a comment..."
        />
        <GradientButton
          title="Send"
          onPress={handleComment}
          style={{ paddingVertical: 8, paddingHorizontal: 20, borderRadius: 6 }}
        />
      </View>

      {comments.map((c) => (
        <View key={c.id} style={styles.commentCard}>
          <View style={styles.commentHeader}>
            <Image
              source={
                c.userAvatar
                  ? { uri: c.userAvatar }
                  : require('../assets/avatar.png')
              }
              style={styles.avatar}
            />
            <View style={styles.commentInfo}>
              <Text style={styles.username}>{c.userName}</Text>
              <Text style={styles.timestamp}>
                {c.createdAt?.toDate().toLocaleString()}
              </Text>
            </View>
            {(userData.role === 'admin' || userData.uid === c.userId) && (
              <TouchableOpacity onPress={() => handleDelete(c.id)}>
                <Ionicons name="trash" size={18} color="red" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.commentText}>{c.text}</Text>

          <View style={styles.reactions}>
            {['❤️', '🔥', '👍'].map((emoji) => (
              <TouchableOpacity
                key={emoji}
                onPress={() => handleReact(c.id, emoji)}
                style={[
                  styles.reaction,
                  c.reactions?.includes(emoji) && styles.reactionActive,
                ]}
              >
                <Text>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {hasMore && !loadingMore && (
        <TouchableOpacity onPress={loadMoreComments} style={styles.loadMoreBtn}>
          <Text style={styles.loadMoreText}>Load More</Text>
        </TouchableOpacity>
      )}

      {loadingMore && <ActivityIndicator color="#ee2a7b" />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 200, borderRadius: 10 },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 12 },
  desc: { fontSize: 14, color: '#666', marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 8 },

  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  input: { flex: 1, padding: 10, marginRight: 8 },

  commentCard: {
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  commentInfo: { flex: 1 },
  username: { fontWeight: '600' },
  timestamp: { fontSize: 12, color: '#999' },
  commentText: { marginTop: 4, fontSize: 14, color: '#333' },
  reactions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  reaction: {
    padding: 4,
    paddingHorizontal: 10,
    backgroundColor: '#eee',
    borderRadius: 20,
  },
  reactionActive: {
    backgroundColor: '#ee2a7b',
  },
  loadMoreBtn: {
    marginTop: 10,
    alignItems: 'center',
  },
  loadMoreText: {
    fontSize: 14,
    color: '#6228d7',
    fontWeight: '600',
  },

  amenitiesSection: {
    marginTop: 20,
  },
  amenitiesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    backgroundColor: '#eee',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  amenityText: {
    fontSize: 13,
    color: '#333',
  },
});

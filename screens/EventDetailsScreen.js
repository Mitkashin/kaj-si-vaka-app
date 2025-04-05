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
  Pressable,
  Alert,
} from 'react-native';
import { db, auth } from '../utils/firebaseConfig';
import {
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  serverTimestamp,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
} from 'firebase/firestore';
import GradientButton from '../components/GradientButton';

export default function EventDetailsScreen({ route }) {
  const { eventId } = route.params;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [lastVisibleComment, setLastVisibleComment] = useState(null);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [currentUserData, setCurrentUserData] = useState(null);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const snap = await getDoc(doc(db, 'events', eventId));
        if (snap.exists()) setEvent({ id: snap.id, ...snap.data() });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    const fetchUser = async () => {
      if (!user) return;
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) setCurrentUserData({ id: snap.id, ...snap.data() });
    };

    fetchEvent();
    fetchUser();
    fetchInitialComments();
  }, [eventId]);

  const fetchInitialComments = async () => {
    const q = query(
      collection(db, 'events', eventId, 'comments'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const snap = await getDocs(q);
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setComments(data);
    setLastVisibleComment(snap.docs[snap.docs.length - 1]);
    setHasMoreComments(snap.docs.length === 5);
  };

  const fetchMoreComments = async () => {
    if (!lastVisibleComment || !hasMoreComments) return;
    const q = query(
      collection(db, 'events', eventId, 'comments'),
      orderBy('createdAt', 'desc'),
      startAfter(lastVisibleComment),
      limit(5)
    );
    const snap = await getDocs(q);
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setComments(prev => [...prev, ...data]);
    setLastVisibleComment(snap.docs[snap.docs.length - 1]);
    if (snap.docs.length < 5) setHasMoreComments(false);
  };

  const handleAddOrEditComment = async () => {
    if (!user || !commentText.trim()) return;

    const payload = {
      content: commentText,
      userId: user.uid,
      userName: currentUserData?.username || user.displayName || 'Anonymous',
      avatarUrl: currentUserData?.avatarUrl || '',
      createdAt: serverTimestamp(),
    };

    try {
      if (editingCommentId) {
        await updateDoc(doc(db, 'events', eventId, 'comments', editingCommentId), {
          content: commentText,
          editedAt: serverTimestamp(),
        });
        setEditingCommentId(null);
      } else {
        await addDoc(collection(db, 'events', eventId, 'comments'), payload);
      }
      setCommentText('');
      fetchInitialComments();
    } catch (err) {
      console.error(err);
      Alert.alert('Error posting comment');
    }
  };

  const handleDeleteComment = async (id) => {
    const isWeb = typeof window !== 'undefined';
    const confirmDelete = isWeb
      ? window.confirm('Are you sure you want to delete the comment?')
      : await new Promise((resolve) => {
          Alert.alert(
            'Are you sure you want to delete the comment?',
            '',
            [
              { text: 'No', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Yes', style: 'destructive', onPress: () => resolve(true) },
            ],
            { cancelable: true }
          );
        });

    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, 'events', eventId, 'comments', id));
        fetchInitialComments();
      } catch (err) {
        console.error(err);
        if (!isWeb) Alert.alert('Failed to delete comment');
        else window.alert('Failed to delete comment');
      }
    }
  };

  const canEdit = (commentUserId) => {
    return user?.uid === commentUserId || currentUserData?.role === 'admin';
  };

  const startEdit = (comment) => {
    setCommentText(comment.content);
    setEditingCommentId(comment.id);
  };

  const cancelEdit = () => {
    setCommentText('');
    setEditingCommentId(null);
  };

  if (loading || !event) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#ee2a7b" /></View>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: event.imageUrl }} style={styles.image} />
      <Text style={styles.title}>{event.name}</Text>
      <Text style={styles.description}>{event.description}</Text>

      <View style={styles.commentsWrapper}>
        <Text style={styles.sectionTitle}>Comments</Text>

        {comments.map((comment) => (
          <View key={comment.id} style={styles.commentBox}>
            <View style={styles.commentTopRow}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={comment.avatarUrl ? { uri: comment.avatarUrl } : require('../assets/avatar.png')}
                  style={styles.avatar}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.commentAuthor}>{comment.userName}</Text>
                <Text style={styles.commentDate}>{comment.createdAt?.toDate().toLocaleString()}</Text>
              </View>
            </View>
            {editingCommentId === comment.id ? (
              <TextInput
                value={commentText}
                onChangeText={setCommentText}
                style={styles.commentInput}
                multiline
              />
            ) : (
              <Text style={styles.commentContent}>{comment.content}</Text>
            )}
            {canEdit(comment.userId) && (
              <View style={styles.commentActions}>
                {editingCommentId === comment.id ? (
                  <>
                    <TouchableOpacity onPress={handleAddOrEditComment}><Text style={styles.commentAction}>Save</Text></TouchableOpacity>
                    <TouchableOpacity onPress={cancelEdit}><Text style={styles.commentAction}>Cancel</Text></TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity onPress={() => startEdit(comment)}><Text style={styles.commentAction}>Edit</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteComment(comment.id)}><Text style={styles.commentAction}>Delete</Text></TouchableOpacity>
                  </>
                )}
              </View>
            )}
          </View>
        ))}

        {hasMoreComments && (
          <Pressable onPress={fetchMoreComments} style={{ marginBottom: 10 }}>
            <Text style={{ textAlign: 'center', color: '#6228d7', fontWeight: '600' }}>
              Load More Comments
            </Text>
          </Pressable>
        )}

        {editingCommentId === null && (
          <>
            <TextInput
              placeholder="Write a comment..."
              value={commentText}
              onChangeText={setCommentText}
              style={styles.commentInput}
              multiline
            />
            <GradientButton
              title="Post Comment"
              onPress={handleAddOrEditComment}
            />
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 200, borderRadius: 10 },
  title: { fontSize: 22, fontWeight: 'bold', marginTop: 12 },
  description: { marginVertical: 10, fontSize: 14, color: '#555' },
  commentsWrapper: { marginTop: 30 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  commentBox: { marginBottom: 16, backgroundColor: '#f9f9f9', padding: 12, borderRadius: 8 },
  commentTopRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  avatarWrapper: { width: 36, height: 36 },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  commentAuthor: { fontWeight: '600', color: '#333' },
  commentDate: { fontSize: 12, color: '#666' },
  commentContent: { fontSize: 14, color: '#444', marginTop: 4 },
  commentActions: { flexDirection: 'row', marginTop: 6, gap: 16 },
  commentAction: { fontSize: 13, color: '#ee2a7b', fontWeight: '500' },
  commentInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 12, minHeight: 60 },
});

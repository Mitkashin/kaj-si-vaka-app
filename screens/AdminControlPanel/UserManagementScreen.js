import React, { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
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
  ScrollView
} from 'react-native';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../utils/firebaseConfig';
import GradientButton from '../../components/GradientButton';

export default function UserManagementScreen() {
  const [users, setUsers] = useState([]);
  const [venues, setVenues] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editInfo, setEditInfo] = useState({ username: '', phone: '' });
  const [activeTab, setActiveTab] = useState('info');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState(null);

  // Fetch users & venues from Firestore
  const fetchUsersAndVenues = async () => {
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const venuesSnap = await getDocs(collection(db, 'venues'));

      setUsers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setVenues(venuesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    fetchUsersAndVenues();
  }, []);

  // Open/Close the Modal
  const openUserModal = (user) => {
    setSelectedUser(user);
    setEditInfo({ username: user.username || '', phone: user.phone || '' });
    setActiveTab('info');
    setModalVisible(true);
  };
  const closeModal = () => {
    setModalVisible(false);
    setSelectedUser(null);
  };

  // Update Firestore doc
  const updateUser = async (updates) => {
    if (!selectedUser) return;
    try {
      await updateDoc(doc(db, 'users', selectedUser.id), updates);
      fetchUsersAndVenues();
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  // Tab actions
  const handleRoleChange = (role) => updateUser({ role });
  const handleInfoUpdate = () => {
    updateUser(editInfo);
    if (Platform.OS === 'web') {
      alert('User info updated successfully');
    } else {
      Alert.alert('Success', 'User info updated successfully');
    }
  };

  const toggleVenueOwnership = async (venueId) => {
    if (!selectedUser) return;
    try {
      const owned = selectedUser.venueIds || [];
      const owns = owned.includes(venueId);
      const updatedVenues = owns
        ? owned.filter(id => id !== venueId)
        : [...owned, venueId];

      await updateDoc(doc(db, 'users', selectedUser.id), {
        venueIds: updatedVenues,
      });

      // Update local state
      setSelectedUser(prev => ({ ...prev, venueIds: updatedVenues }));
      fetchUsersAndVenues();
    } catch (err) {
      console.error('Failed to toggle venue ownership:', err);
    }
  };

  // Filtering
  const filteredUsers = users.filter(u => {
    const matchesQuery =
      (u.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = filterRole ? u.role === filterRole : true;
    return matchesQuery && matchesRole;
  });

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchWrapper}>
        <LinearGradient
          colors={['#f9ce34', '#ee2a7b', '#6228d7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBorder}
        >
          <View style={styles.searchInputContainer}>
            <TextInput
              placeholder="Search users..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              placeholderTextColor="#888"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearIcon}
              >
                <Text style={{ fontSize: 16, color: '#888' }}>×</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </View>

      {/* Role filter */}
      <View style={styles.roleFilterRow}>
        {['user', 'owner', 'admin'].map(role => (
          <TouchableOpacity
            key={role}
            onPress={() => setFilterRole(filterRole === role ? null : role)}
            style={[
              styles.roleFilterBtn,
              filterRole === role && styles.roleFilterBtnActive
            ]}
          >
            <Text
              style={[
                styles.roleFilterText,
                filterRole === role && styles.roleFilterTextActive
              ]}
            >
              {role}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* User list */}
      <FlatList
        data={filteredUsers}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={() => (
          <View style={styles.noResults}>
            <Text style={styles.noResultsText}>No users found</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <Text style={styles.username}>{item.username || 'Unnamed User'}</Text>
            <Text style={styles.email}>{item.email}</Text>
            <Text style={styles.role}>Role: {item.role || 'user'}</Text>

            {/* Gear button to open modal */}
            <TouchableOpacity
              onPress={() => openUserModal(item)}
              style={styles.manageButtonWrapper}
            >
              <LinearGradient
                colors={['#f9ce34', '#ee2a7b', '#6228d7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gearButtonWrapper}
              >
                <Ionicons name="settings" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Modal inside */}
      {selectedUser && (
        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, Platform.OS === 'web' && styles.modalWebWidth]}>
              <Text style={styles.modalTitle}>Manage: {selectedUser.username || 'Unnamed'}</Text>

              {/* Tab row: info / role / venues */}
              <View style={styles.tabRow}>
                {['info', 'role', 'venues'].map((tab) => (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => setActiveTab(tab)}
                    style={[
                      styles.tabBtn,
                      activeTab === tab && styles.activeTabBtn
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        activeTab === tab && styles.activeTabText
                      ]}
                    >
                      {tab === 'info'
                        ? 'Edit Info'
                        : tab === 'role'
                        ? 'Set Role'
                        : 'Assign Venues'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Tab content */}
              <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                {activeTab === 'info' && (
                  <View>
                    <TextInput
                      style={styles.input}
                      value={editInfo.username}
                      placeholder="Username"
                      onChangeText={(text) =>
                        setEditInfo(prev => ({ ...prev, username: text }))
                      }
                    />
                    <TextInput
                      style={styles.input}
                      value={editInfo.phone}
                      placeholder="Phone"
                      onChangeText={(text) =>
                        setEditInfo(prev => ({ ...prev, phone: text }))
                      }
                    />
                    <GradientButton
                      title="Save Info"
                      onPress={handleInfoUpdate}
                      style={{ marginTop: 8 }}
                    />
                  </View>
                )}

                {activeTab === 'role' && (
                  <View style={styles.roleRowCentered}>
                    {['user', 'owner', 'admin'].map(role => (
                      <TouchableOpacity
                        key={role}
                        style={[
                          styles.roleBtn,
                          selectedUser.role === role && styles.activeRoleBtn
                        ]}
                        onPress={() => handleRoleChange(role)}
                      >
                        <Text
                          style={[
                            styles.roleText,
                            selectedUser.role === role && styles.activeRoleText
                          ]}
                        >
                          {role}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {activeTab === 'venues' && (
                  <View>
                    {venues.map(venue => {
                      const owns = selectedUser.venueIds?.includes(venue.id);
                      return (
                        <TouchableOpacity
                          key={venue.id}
                          onPress={() => toggleVenueOwnership(venue.id)}
                          style={[
                            styles.venueItem,
                            owns && styles.venueSelected
                          ]}
                        >
                          <Text style={{ fontWeight: '600' }}>{venue.name}</Text>
                          <Text style={{ fontSize: 12, color: '#666' }}>{venue.location}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {/* Close button is back INSIDE the modal */}
                <GradientButton
                  title="Close"
                  onPress={closeModal}
                  style={{ marginTop: 16 }}
                />
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

// ----------------- STYLES ----------------- //
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    width: '100%',
    ...(Platform.OS === 'web' ? { maxWidth: '50%', alignSelf: 'center' } : {}),
  },

  // Search
  searchWrapper: { paddingHorizontal: 16, paddingTop: 12 },
  gradientBorder: {
    borderRadius: 8,
    padding: 2,
    backgroundColor: 'transparent',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
  },
  clearIcon: { padding: 4 },

  // Role filter
  roleFilterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
  },
  roleFilterBtn: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  roleFilterBtnActive: {
    backgroundColor: '#ee2a7b',
    borderColor: '#ee2a7b',
  },
  roleFilterText: {
    fontSize: 13,
    color: '#333',
  },
  roleFilterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },

  // No results
  noResults: {
    alignItems: 'center',
    padding: 20,
  },
  noResultsText: {
    fontSize: 16,
    color: '#888',
    fontStyle: 'italic',
  },

  // Each user row
  userCard: {
    position: 'relative',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  username: { fontSize: 16, fontWeight: 'bold' },
  email: { fontSize: 13, color: '#666' },
  role: { marginTop: 6, fontSize: 14 },

  // Gear manage button
  manageButtonWrapper: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
  },
  gearButtonWrapper: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    justifyContent: 'center',
    height: '100%',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '90%',
    maxHeight: '85%',
    borderRadius: 16,
    padding: 16,
  },
  modalWebWidth: {
    maxWidth: '50%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  tabBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  activeTabBtn: {
    borderBottomWidth: 2,
    borderColor: '#ee2a7b',
  },
  tabText: { fontSize: 14, color: '#666' },
  activeTabText: { color: '#ee2a7b', fontWeight: '600' },

  // Info / Role / Venues
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  roleRowCentered: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 8,
  },
  roleBtn: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  activeRoleBtn: {
    backgroundColor: '#ee2a7b',
    borderColor: '#ee2a7b',
  },
  roleText: { fontSize: 13, color: '#333' },
  activeRoleText: { color: '#fff', fontWeight: '600' },
  venueItem: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginVertical: 4,
  },
  venueSelected: {
    borderColor: '#ee2a7b',
    backgroundColor: '#fff0f6',
  },
});

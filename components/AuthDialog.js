import React from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import GradientButton from './GradientButton';
import GradientOutlineButton from './GradientOutlineButton';
import { LinearGradient } from 'expo-linear-gradient';

export default function AuthDialog({ visible, onClose, onSwitch, onSubmit, mode, formData, setFormData }) {
  const isLogin = mode === 'login';

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>{isLogin ? 'Log In' : 'Register'}</Text>

          {!isLogin && <GradientInput placeholder="Username" value={formData.username} onChangeText={text => handleChange('username', text)} />}
          <GradientInput placeholder="Email" value={formData.email} onChangeText={text => handleChange('email', text)} />
          <GradientInput placeholder="Password" secureTextEntry value={formData.password} onChangeText={text => handleChange('password', text)} />
          {!isLogin && <GradientInput placeholder="Phone Number" value={formData.phone} onChangeText={text => handleChange('phone', text)} />}

          {isLogin && (
            <TouchableOpacity>
              <Text style={styles.forgot}>Forgot Password?</Text>
            </TouchableOpacity>
          )}

          <GradientButton title={isLogin ? 'Submit' : 'Register'} onPress={onSubmit} style={{ marginTop: 10 }} />
          <GradientOutlineButton title="Cancel" onPress={onClose} style={{ marginTop: 10 }} />

          <TouchableOpacity onPress={onSwitch} style={{ marginTop: 16 }}>
            <Text style={styles.switchText}>
              {isLogin ? "Don't have an account? Register" : 'Already have an account? Log In'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function GradientInput({ placeholder, secureTextEntry, value, onChangeText }) {
  return (
    <LinearGradient
      colors={['#f9ce34', '#ee2a7b', '#6228d7']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.gradientBorder}
    >
      <TextInput
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#888"
        style={styles.input}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    maxWidth: 500,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  gradientBorder: {
    padding: 2,
    borderRadius: 10,
    marginVertical: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  forgot: {
    marginTop: 6,
    fontSize: 13,
    color: '#555',
    textAlign: 'right',
  },
  switchText: {
    fontSize: 14,
    color: '#6228d7',
    textAlign: 'center',
    fontWeight: '500',
  },
});
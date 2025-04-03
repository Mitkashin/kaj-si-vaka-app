import React, { useState } from 'react';
import { View } from 'react-native';
import GradientButton from '../components/GradientButton';
import GradientOutlineButton from '../components/GradientOutlineButton';
import AuthDialog from '../components/AuthDialog';
import { auth, db } from '../utils/firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function LoginScreen({ navigation }) {
    const [authVisible, setAuthVisible] = useState(false);
    const [authMode, setAuthMode] = useState('login');
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        phone: '',
    });

    const openAuth = (mode) => {
        setAuthMode(mode);
        setAuthVisible(true);
    };

    const closeAuth = () => {
        setAuthVisible(false);
        setFormData({ username: '', email: '', password: '', phone: '' });
    };

    const handleSubmit = async () => {
        try {
            if (authMode === 'login') {
                await signInWithEmailAndPassword(auth, formData.email, formData.password);
            } else {
                const userCred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
                const uid = userCred.user.uid;
                await setDoc(doc(db, 'users', uid), {
                    username: formData.username,
                    email: formData.email,
                    phone: formData.phone,
                    createdAt: serverTimestamp(),
                });
                alert('Account created! You can log in now.');
                setAuthMode('login');
            }
            closeAuth();
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <GradientButton
                title="Log In"
                onPress={() => openAuth('login')}
                style={{ marginTop: 20 }}
            />
            <GradientOutlineButton
                title="Sign Up"
                onPress={() => openAuth('register')}
                style={{ marginTop: 10 }}
            />

            <AuthDialog
                visible={authVisible}
                mode={authMode}
                formData={formData}
                setFormData={setFormData}
                onClose={closeAuth}
                onSwitch={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                onSubmit={handleSubmit}
            />
        </View>
    );
}

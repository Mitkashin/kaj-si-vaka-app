import React from 'react';
import { View, Text, Button, Image, StyleSheet } from 'react-native';
import GradientButton from '../components/GradientButton'; // Assuming you have a GradientButton component
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function WelcomeScreen({ onContinue }) {

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            {/* <StatusBar hidden={true} /> */}
            {/* <StatusBar style="dark" translucent backgroundColor="transparent" /> */}
            {/* <Text >Welcome to Kaj Si Vaka!</Text> */}

            <Image
                source={require('../assets/logo2.png')}
                style={styles.logo}
                resizeMode="contain"
                onError={() => setLogoError(true)}
            />


            <GradientButton title="Continue" onPress={onContinue}
            // onPress={() => console.log('Button Pressed')}
            />

        </View>
    );
}


const styles = StyleSheet.create({
    logo: {
        height: 250,
        width: 550,
    },
}
)

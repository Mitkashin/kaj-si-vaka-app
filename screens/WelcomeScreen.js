import React from 'react';
import { View, Text, Button } from 'react-native';
import GradientButton from '../components/GradientButton'; // Assuming you have a GradientButton component
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function WelcomeScreen({ navigation }) {

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            {/* <StatusBar hidden={true} /> */}
            {/* <StatusBar style="dark" translucent backgroundColor="transparent" /> */}
            <Text >Welcome to Kaj Si Vaka!</Text>
            <GradientButton
                title="Continue to App"
                onPress={() => navigation.navigate('Login')}
                // onPress={() => console.log('Button Pressed')}
            />

        </View>
    );
}




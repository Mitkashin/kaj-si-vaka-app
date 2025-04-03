import React from 'react';
import { View, Text, Button } from 'react-native';
import GradientButton from '../components/GradientButton'; // Assuming you have a GradientButton component
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen({ navigation }) {

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

            <Text >Welcome to Kaj Si Vaka!</Text>
            <GradientButton title="Continue to App" onPress={() => navigation.navigate('Login')} />
                
        </View>
    );
}




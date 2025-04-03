import React from 'react';
import { View, Text, Button } from 'react-native';
import GradientButton from '../components/GradientButton'; // Assuming you have a GradientButton component
import GradientOutlineButton from '../components/GradientOutlineButton'; // Assuming you have a GradientOutlineButton component

export default function LoginScreen({ navigation }) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <GradientButton
                title="Log In"
                onPress={() => navigation.navigate('HomeTabs')} 
                style={{ marginTop: 20,}}
            />
            <GradientOutlineButton
                title="Sign Up"
                onPress={() => console.log('Pressed')}
                style={{ marginTop: 10 }}
            />

        </View>
    );
}

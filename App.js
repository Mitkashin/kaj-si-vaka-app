import React from 'react';
import RootNavigator from './navigation/RootNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';

export default function App() {
    return (
        <>
            <StatusBar hidden={true} />
            <GestureHandlerRootView style={{ flex: 1 }}>
                <RootNavigator />
            </GestureHandlerRootView>
        </>
    );
}
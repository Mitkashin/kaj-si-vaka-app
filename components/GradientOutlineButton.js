import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GradientText from './GradientText';

export default function GradientOutlineButton({ title, onPress, style }) {
    return (
        <View style={[styles.wrapper, style]}>
            <LinearGradient
                colors={['#f9ce34', '#ee2a7b', '#6228d7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientBorder}
            >
                <View style={styles.innerWrapper}>
                    <TouchableOpacity onPress={onPress} style={styles.button}>
                        <GradientText text={title} fontSize={16} width={60} />
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        alignSelf: 'center', // optional for center alignment
    },
    gradientBorder: {
        padding: 4,
        borderRadius: 30,
    },
    innerWrapper: {
        backgroundColor: 'white',
        borderRadius: 28,
    },
    button: {
        backgroundColor: 'transparent',
        borderRadius: 28,
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

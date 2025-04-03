import React from 'react';
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function GradientButton({ title, onPress, icon, style, textStyle }) {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
            <LinearGradient
                colors={['#f9ce34', '#ee2a7b', '#6228d7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.button, style]}
            >
                <View style={styles.row}>
                    {icon && <View style={styles.iconWrapper}>{icon}</View>}
                    <Text style={[styles.text, textStyle]}>{title}</Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    touchable: {
        borderRadius: 30, // ✅ Match the gradient container
        overflow: 'hidden', // ✅ Clip to shape so touches pass correctly
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconWrapper: {
        marginRight: 8,
    },
    text: {
        color: 'white', // ✅ Solid white text
        fontSize: 16,
        fontWeight: 'bold',
    },
});

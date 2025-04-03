import React from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

export default function GradientOutlineButton({ title, onPress, icon, style, textStyle }) {
    return (
        <LinearGradient
            colors={['#f9ce34', '#ee2a7b', '#6228d7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradientBorder, style]}
        >
            <TouchableOpacity onPress={onPress} style={styles.inner}>
                <MaskedView
                    maskElement={
                        <View style={styles.row}>
                            {icon && <View style={styles.iconWrapper}>{icon}</View>}
                            <Text style={[styles.text, textStyle]}>{title}</Text>
                        </View>
                    }
                >
                    <LinearGradient
                        colors={['#f9ce34', '#ee2a7b', '#6228d7']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ paddingHorizontal: 10 }}
                    >
                        <View style={styles.row}>
                            {icon && <View style={styles.iconWrapper}>{icon}</View>}
                            <Text style={[styles.text, textStyle, { opacity: 0 }]}>{title}</Text>
                        </View>
                    </LinearGradient>
                </MaskedView>
            </TouchableOpacity>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradientBorder: {
        padding: 2,
        borderRadius: 30,
    },
    inner: {
        backgroundColor: 'transparent',
        borderRadius: 28,
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconWrapper: {
        marginRight: 8,
    },
    text: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

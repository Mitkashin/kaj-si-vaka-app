import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import GradientHeader from '../components/GradientHeader';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeTabs from './HomeTabs';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Welcome">
                <Stack.Screen
                    name="Welcome"
                    component={WelcomeScreen}
                    options={{
                        header: () => <GradientHeader title="Welcome" />
                    }}
                />
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{
                        header: () => <GradientHeader title="Login" />
                    }}
                />
                <Stack.Screen
                    name="HomeTabs"
                    component={HomeTabs}
                    options={{
                        header: () => <GradientHeader title="HomeTabs" />
                    }}
                />

                {/* <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="HomeTabs" component={HomeTabs} /> */}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

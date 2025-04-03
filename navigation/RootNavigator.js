import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import GradientHeader from '../components/GradientHeader';
import VenueDetailsScreen from '../screens/VenueDetailsScreen';
import AuthGate from '../components/AuthGate'; // ✅ new
import AllBookingsScreen from '../screens/AllBookingsScreen';


const Stack = createNativeStackNavigator();

export default function RootNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                {/* Auth-protected entry point */}
                <Stack.Screen
                    name="AuthGate"
                    component={AuthGate}
                    options={{ headerShown: false }}
                />

                {/* Public route for venue details */}
                <Stack.Screen
                    name="VenueDetails"
                    component={VenueDetailsScreen}
                    options={{
                        header: () => <GradientHeader title="Venue Details" />
                    }}
                />
                <Stack.Screen
                    name="AllBookings"
                    component={AllBookingsScreen}
                    options={{ title: 'All Bookings' }}
                />

            </Stack.Navigator>
        </NavigationContainer>
    );
}

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import GradientHeader from '../components/GradientHeader';
import VenueDetailsScreen from '../screens/VenueDetailsScreen';
import AuthGate from '../components/AuthGate';
import AllBookingsScreen from '../screens/AllBookingsScreen';
import EventDetailsScreen from '../screens/EventDetailsScreen';


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

        {/* Venue Details screen with custom back-enabled header */}
        <Stack.Screen
          name="VenueDetails"
          component={VenueDetailsScreen}
          options={({ navigation }) => ({
            header: () => (
              <GradientHeader title="Venue Details" showBack navigation={navigation} />
            ),
          })}
        />

        {/* All Bookings screen with custom back-enabled header */}
        <Stack.Screen
          name="AllBookings"
          component={AllBookingsScreen}
          options={({ navigation }) => ({
            header: () => (
              <GradientHeader title="All Bookings" showBack navigation={navigation} />
            ),
          })}
        />

        <Stack.Screen
          name="EventDetails"
          component={EventDetailsScreen}
          options={({ navigation }) => ({
            header: () => (
              <GradientHeader title="Event Details" showBack navigation={navigation} />
            ),
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

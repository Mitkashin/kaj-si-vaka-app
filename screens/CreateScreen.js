import React from 'react';
import { View, Text } from 'react-native';
import GradientButton from '../components/GradientButton';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../utils/firebaseConfig'; // adjust path


//Random Image
// https://picsum.photos/600/400?random=1
const venues = [
  {
    name: "Neon Nights",
    location: "Downtown",
    description: "Trendy nightclub with live DJs and a vibrant dancefloor.",
    openingHours: "21:00 - 04:00",
    rating: 4.8,
    isPremium: true,
    imageUrl: "https://picsum.photos/600/400?random=1",
    amenities: ["Live DJ", "Cocktails", "Smoking Area", "WiFi"]
  },
  {
    name: "Sky Lounge",
    location: "Rooftop, City Center",
    description: "Stylish rooftop bar with panoramic views and chill vibes.",
    openingHours: "18:00 - 02:00",
    rating: 4.9,
    isPremium: true,
    imageUrl: "https://picsum.photos/600/400?random=2",
    amenities: ["Rooftop", "Lounge Seating", "Live Music", "Hookah"]
  },
  {
    name: "The Whiskey Den",
    location: "Old Town",
    description: "Rustic pub with rare whiskeys, wooden decor, and a cozy atmosphere.",
    openingHours: "16:00 - 01:00",
    rating: 4.5,
    isPremium: false,
    imageUrl: "https://picsum.photos/600/400?random=3",
    amenities: ["Whiskey Selection", "WiFi", "Craft Beer"]
  },
  {
    name: "Urban Vibe",
    location: "Main Street",
    description: "Chic venue for dance parties, cocktails, and city nightlife.",
    openingHours: "20:00 - 03:00",
    rating: 4.6,
    isPremium: false,
    imageUrl: "https://picsum.photos/600/400?random=4",
    amenities: ["Dance Floor", "Cocktails", "Live DJ"]
  },
  {
    name: "Café Urban",
    location: "Midtown",
    description: "Modern café perfect for hangouts, open mic nights, and cozy chats.",
    openingHours: "08:00 - 22:00",
    rating: 4.4,
    isPremium: false,
    imageUrl: "https://picsum.photos/600/400?random=5",
    amenities: ["WiFi", "Outdoor Seating", "Live Music"]
  },
  {
    name: "Velvet Underground",
    location: "Underground Station",
    description: "An artsy hidden bar known for underground music and dim lighting.",
    openingHours: "19:00 - 03:00",
    rating: 4.7,
    isPremium: true,
    imageUrl: "https://picsum.photos/600/400?random=6",
    amenities: ["Live DJ", "Craft Cocktails", "Artsy Vibes"]
  },
  {
    name: "The Garden Terrace",
    location: "Riverbank",
    description: "Open-air lounge surrounded by plants, perfect for summer nights.",
    openingHours: "17:00 - 01:00",
    rating: 4.5,
    isPremium: false,
    imageUrl: "https://picsum.photos/600/400?random=7",
    amenities: ["Outdoor Seating", "Cocktails", "Romantic Lighting"]
  },
  {
    name: "Pulse Club",
    location: "Nightlife District",
    description: "High-energy dance club with multiple rooms and laser lights.",
    openingHours: "22:00 - 05:00",
    rating: 4.6,
    isPremium: true,
    imageUrl: "https://picsum.photos/600/400?random=8",
    amenities: ["Live DJ", "Laser Show", "VIP Area"]
  },
  {
    name: "Tiki Bar Paradise",
    location: "Beachfront",
    description: "Tropical-themed bar with exotic drinks and beach vibes.",
    openingHours: "14:00 - 00:00",
    rating: 4.3,
    isPremium: false,
    imageUrl: "https://picsum.photos/600/400?random=9",
    amenities: ["Tropical Drinks", "Beach View", "WiFi"]
  },
  {
    name: "Jazz & Soul",
    location: "Cultural District",
    description: "Intimate venue for jazz lovers and soulful nights.",
    openingHours: "19:00 - 23:30",
    rating: 4.9,
    isPremium: true,
    imageUrl: "https://picsum.photos/600/400?random=10",
    amenities: ["Live Jazz", "Cocktail Bar", "Seating"]
  },
  {
    name: "The Basement",
    location: "Lower East Side",
    description: "Dark, edgy club known for electronic beats and underground vibes.",
    openingHours: "22:00 - 04:00",
    rating: 4.4,
    isPremium: false,
    imageUrl: "https://picsum.photos/600/400?random=11",
    amenities: ["Live DJ", "Dark Theme", "Hookah"]
  },
  {
    name: "Luxe Lounge",
    location: "High Street",
    description: "Elegant cocktail lounge with plush seating and upscale ambiance.",
    openingHours: "17:00 - 02:00",
    rating: 4.8,
    isPremium: true,
    imageUrl: "https://picsum.photos/600/400?random=12",
    amenities: ["Premium Cocktails", "VIP Seating", "Waiter Service"]
  },
  {
    name: "Karaoke House",
    location: "Central Plaza",
    description: "Fun and casual spot for karaoke and group parties.",
    openingHours: "18:00 - 01:00",
    rating: 4.2,
    isPremium: false,
    imageUrl: "https://picsum.photos/600/400?random=13",
    amenities: ["Karaoke", "Private Rooms", "Happy Hour"]
  },
  {
    name: "Vino Veritas",
    location: "Wine Valley",
    description: "Classy wine bar with sommelier picks and tapas.",
    openingHours: "15:00 - 23:00",
    rating: 4.7,
    isPremium: true,
    imageUrl: "https://picsum.photos/600/400?random=14",
    amenities: ["Wine Selection", "Tapas", "Outdoor Seating"]
  },
  {
    name: "Electric Avenue",
    location: "Downtown Strip",
    description: "Electro house club with international guest DJs every weekend.",
    openingHours: "22:00 - 05:00",
    rating: 4.6,
    isPremium: true,
    imageUrl: "https://picsum.photos/600/400?random=15",
    amenities: ["Guest DJs", "VIP Area", "Laser Show"]
  },
  {
    name: "Boardwalk Pub",
    location: "Boardwalk",
    description: "Laid-back seaside pub with craft beers and a local crowd.",
    openingHours: "13:00 - 00:00",
    rating: 4.3,
    isPremium: false,
    imageUrl: "https://picsum.photos/600/400?random=16",
    amenities: ["Craft Beer", "Seaside View", "TV Sports"]
  },
  {
    name: "The Craft Room",
    location: "Artisan District",
    description: "Experimental bar with mixology nights and DIY cocktail kits.",
    openingHours: "18:00 - 01:00",
    rating: 4.5,
    isPremium: false,
    imageUrl: "https://picsum.photos/600/400?random=17",
    amenities: ["Mixology", "Unique Drinks", "Workshops"]
  },
  {
    name: "Hidden Speakeasy",
    location: "Back Alley",
    description: "Secret bar with password-only access and 1920s vibes.",
    openingHours: "20:00 - 02:00",
    rating: 4.9,
    isPremium: true,
    imageUrl: "https://picsum.photos/600/400?random=18",
    amenities: ["Hidden Entry", "Prohibition Cocktails", "Jazz Music"]
  },
  {
    name: "The Chill Spot",
    location: "College Area",
    description: "Budget-friendly bar with pool tables, darts, and chill beats.",
    openingHours: "16:00 - 01:00",
    rating: 4.1,
    isPremium: false,
    imageUrl: "https://picsum.photos/600/400?random=19",
    amenities: ["Pool Tables", "Affordable Drinks", "WiFi"]
  },
  {
    name: "Boho Breeze",
    location: "Art District",
    description: "Laid-back open-air bar with hammocks and chill beats.",
    openingHours: "17:00 - 23:30",
    rating: 4.4,
    isPremium: false,
    imageUrl: "https://picsum.photos/600/400?random=20",
    amenities: ["Hammocks", "Outdoor Bar", "Acoustic Nights"]
  }
];


export default function CreateScreen() {
  const handleCreateEvent = async () => {
    try {
      venues.forEach(async (venue) => {
        await addDoc(collection(db, 'venues'), venue);
      });
      alert('Event Created!');
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event.');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <GradientButton title="Create Event" onPress={handleCreateEvent} />
    </View>
  );
}


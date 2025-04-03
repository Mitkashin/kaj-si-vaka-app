import React from 'react';
import { View, Text } from 'react-native';
import GradientButton from '../components/GradientButton';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../utils/firebaseConfig'; // adjust path

const venues = [
  {
    name: "Sky Lounge",
    location: "City Center",
    rating: 4.6,
    ratingCounter: 120,
    imageUrl: "https://picsum.photos/600/400?random=1",
    openingHours: "18:00 - 02:00",
    description: "A stylish rooftop bar offering amazing city views and craft cocktails."
  },
  {
    name: "Neon Vibe Club",
    location: "Downtown",
    rating: 4.4,
    ratingCounter: 87,
    imageUrl: "https://picsum.photos/600/400?random=2",
    openingHours: "22:00 - 05:00",
    description: "Modern electronic club with live DJs and a vibrant neon-lit dance floor."
  },
  {
    name: "Jazz Attic",
    location: "Old Town",
    rating: 4.9,
    ratingCounter: 66,
    imageUrl: "https://picsum.photos/600/400?random=3",
    openingHours: "20:00 - 01:00",
    description: "Smooth jazz performances every night in a cozy attic venue."
  },
  {
    name: "The Social House",
    location: "Lakeside",
    rating: 4.3,
    ratingCounter: 105,
    imageUrl: "https://picsum.photos/600/400?random=4",
    openingHours: "17:00 - 23:00",
    description: "Perfect for gatherings with drinks, tapas, and chill music."
  },
  {
    name: "Night Bazaar Bar",
    location: "Market Square",
    rating: 4.1,
    ratingCounter: 78,
    imageUrl: "https://picsum.photos/600/400?random=5",
    openingHours: "19:00 - 03:00",
    description: "A cultural hub of nightlife, food stalls, and unique cocktails."
  },
  {
    name: "Luna Lounge",
    location: "Harborfront",
    rating: 4.7,
    ratingCounter: 92,
    imageUrl: "https://picsum.photos/600/400?random=6",
    openingHours: "21:00 - 03:00",
    description: "Trendy lounge with sea views and live electronic acts."
  },
  {
    name: "Underground Pulse",
    location: "Warehouse District",
    rating: 4.5,
    ratingCounter: 101,
    imageUrl: "https://picsum.photos/600/400?random=7",
    openingHours: "23:00 - 06:00",
    description: "Late-night underground venue for house and techno lovers."
  },
  {
    name: "The Velvet Room",
    location: "Theatre Street",
    rating: 4.8,
    ratingCounter: 88,
    imageUrl: "https://picsum.photos/600/400?random=8",
    openingHours: "20:00 - 02:00",
    description: "Classy bar with velvet interiors and premium cocktails."
  },
  {
    name: "Groove Garden",
    location: "Parkside",
    rating: 4.2,
    ratingCounter: 73,
    imageUrl: "https://picsum.photos/600/400?random=9",
    openingHours: "18:00 - 01:00",
    description: "Outdoor music garden featuring local indie artists and food trucks."
  },
  {
    name: "Echo Hall",
    location: "Cultural District",
    rating: 4.0,
    ratingCounter: 54,
    imageUrl: "https://picsum.photos/600/400?random=10",
    openingHours: "20:00 - 02:00",
    description: "Live event space for concerts, open mic, and pop-up art shows."
  },
  {
    name: "The Hideout",
    location: "Back Alley",
    rating: 4.6,
    ratingCounter: 65,
    imageUrl: "https://picsum.photos/600/400?random=11",
    openingHours: "19:00 - 02:00",
    description: "Hidden speakeasy with mystery cocktails and private booths."
  },
  {
    name: "BeatBox Club",
    location: "Industrial Zone",
    rating: 4.3,
    ratingCounter: 110,
    imageUrl: "https://picsum.photos/600/400?random=12",
    openingHours: "22:00 - 04:00",
    description: "High-energy EDM nights and themed parties every weekend."
  },
  {
    name: "Sunset Bar",
    location: "Beachside",
    rating: 4.7,
    ratingCounter: 98,
    imageUrl: "https://picsum.photos/600/400?random=13",
    openingHours: "17:00 - 00:00",
    description: "Laid-back beach bar to enjoy cocktails while watching the sunset."
  },
  {
    name: "Funky Monkey",
    location: "Main Square",
    rating: 4.1,
    ratingCounter: 76,
    imageUrl: "https://picsum.photos/600/400?random=14",
    openingHours: "20:00 - 03:00",
    description: "Quirky bar with retro music, arcade games, and themed nights."
  },
  {
    name: "Midnight Central",
    location: "Central Station",
    rating: 4.4,
    ratingCounter: 84,
    imageUrl: "https://picsum.photos/600/400?random=15",
    openingHours: "21:00 - 04:00",
    description: "Energetic club near the station with guest DJs and drink specials."
  }
]
;

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


import { type Club } from './ClubCard';
import { SAMPLE_EVENTS } from '@/components/event/data';

// Sample club data based on backend club model
export const SAMPLE_CLUBS: Club[] = [

  {
    _id: "club3",
    name: "A'DAM The Loft",
    clubDescription: "Trendy bar with craft cocktails and live music performances",
    typeOfVenue: "bar",
    logoUrl: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=400&h=400&fit=crop",
    coverBannerUrl: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&h=600&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&h=600&fit=crop"
    ],
    clubImages: [
      "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&h=600&fit=crop"
    ],
    city: "Dubai",
    rating: 4.2,
    address: "Jumeirah Beach Road, Dubai Marina",
    distance: "5.1 km away",
    distanceInMeters: 5100,
    isApproved: true,
    operatingDays: ["Thursday", "Friday", "Saturday"],
    phone: "+971-4-123-4567",
    mapLink: "https://maps.google.com/?q=Jumeirah+Beach+Road",
    email: "contact@adamloft.example",
    events: ["evt-dxb-003", "evt-dxb-004"]
  },
  {
    _id: "club4",
    name: "AIR Amsterdam",
    clubDescription: "Exclusive lounge with comfortable seating and premium shisha service",
    typeOfVenue: "lounge",
    logoUrl: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=400&fit=crop",
    coverBannerUrl: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&h=600&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1569901493095-d8cd5ec64286?w=800&h=600&fit=crop"
    ],
    clubImages: [
      "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&h=600&fit=crop"
    ],
    city: "Dubai",
    rating: 3.3,
    address: "Business Bay, Downtown Dubai",
    distance: "1.8 km away",
    distanceInMeters: 1800,
    isApproved: true,
    operatingDays: ["Wednesday", "Thursday", "Friday"],
    phone: "+971-4-234-5678",
    mapLink: "https://maps.google.com/?q=Business+Bay",
    email: "info@airamsterdam.example",
    events: ["evt-ad-002"]
  },
  {
    _id: "club5",
    name: "Aqua Pool Club",
    clubDescription: "Luxury pool club with infinity pool, day beds, and exclusive beach access",
    typeOfVenue: "pool_club",
    logoUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop",
    coverBannerUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=600&fit=crop"
    ],
    clubImages: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop"
    ],
    city: "Dubai",
    rating: 4.9,
    address: "Palm Jumeirah, Atlantis Resort",
    distance: "7.3 km away",
    distanceInMeters: 7300,
    isApproved: true,
    operatingDays: ["Friday", "Saturday", "Sunday"],
    phone: "+971-4-345-6789",
    mapLink: "https://maps.google.com/?q=Palm+Jumeirah",
    email: "reservations@aquapool.example",
    events: ["evt-dxb-005"]
  },
  {
    _id: "club6",
    name: "Skybar Rooftop",
    clubDescription: "Stunning rooftop bar with panoramic city views and signature cocktails",
    typeOfVenue: "rooftop",
    logoUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
    coverBannerUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop"
    ],
    clubImages: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop"
    ],
    city: "Dubai",
    rating: 4.3,
    address: "Sheikh Zayed Road, Business Bay",
    distance: "4.7 km away",
    distanceInMeters: 4700,
    isApproved: true,
    operatingDays: ["Monday", "Tuesday", "Wednesday"],
    phone: "+971-4-456-7890",
    mapLink: "https://maps.google.com/?q=Business+Bay",
    email: "hello@skybar.example",
    events: ["evt-ad-006"]
  },
  {
    _id: "club7",
    name: "Pulse Nightclub",
    clubDescription: "High-energy nightclub with top international DJs and state-of-the-art sound system",
    typeOfVenue: "nightclub",
    logoUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    coverBannerUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop"
    ],
    clubImages: [
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop"
    ],
    city: "Dubai",
    rating: 4.4,
    address: "Jumeirah Lake Towers, JLT",
    distance: "6.2 km away",
    distanceInMeters: 6200,
    isApproved: true,
    operatingDays: ["Thursday", "Friday", "Saturday"],
    phone: "+971-4-567-8901",
    mapLink: "https://maps.google.com/?q=JLT",
    email: "contact@pulsenightclub.example",
    events: ["evt-dxb-003", "evt-dxb-007"]
  },
  {
    _id: "club8",
    name: "The Craft Bar",
    clubDescription: "Artisanal craft beer bar with local and international brews",
    typeOfVenue: "bar",
    logoUrl: "https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=400&h=400&fit=crop",
    coverBannerUrl: "https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=800&h=600&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=800&h=600&fit=crop"
    ],
    clubImages: [
      "https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=800&h=600&fit=crop"
    ],
    city: "Dubai",
    rating: 4.1,
    address: "Al Barsha, Mall of the Emirates",
    distance: "8.9 km away",
    distanceInMeters: 8900,
    isApproved: true,
    operatingDays: ["Tuesday", "Wednesday", "Thursday"],
    phone: "+971-4-678-9012",
    mapLink: "https://maps.google.com/?q=Al+Barsha",
    email: "info@craftbar.example",
    events: ["evt-dxb-004"]
  }
];

// Sample clubs with distance data for the API response format
export const SAMPLE_CLUBS_WITH_DISTANCE = SAMPLE_CLUBS.map(club => ({
  club,
  distanceInMeters: club.distanceInMeters || 0,
  distanceText: club.distance || "0 km away",
  durationText: `${Math.floor((club.distanceInMeters || 0) / 1000 * 2)} min`,
  durationInSeconds: Math.floor((club.distanceInMeters || 0) / 1000 * 120),
  method: "Sample Data"
}));

import type { EventItem } from "./types";

// Sample data matching backend eventSchema
export const SAMPLE_EVENTS: EventItem[] = [
  {
    _id: "evt-ad-002",
    name: "Techno Oasis",
    date: "2025-09-12",
    time: "10:00 PM",
    djArtists: "Zara Pulse, Monir",
    description: "Hypnotic techno grooves and immersive visuals in the heart of Abu Dhabi.",
    coverImage: "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1600&auto=format&fit=crop",
    tickets: [
      { 
        _id: "gen", 
        name: "General", 
        price: 120, 
        description: "General admission ticket",
        quantityAvailable: 200,
        quantitySold: 0
      },
      { 
        _id: "vip", 
        name: "VIP", 
        price: 300, 
        description: "VIP access with premium seating",
        quantityAvailable: 60,
        quantitySold: 0
      },
    ],
    menuItems: [
      {
        _id: "food1",
        name: "Gourmet Platter",
        price: "85 AED",
        itemImage: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400",
        description: "Assorted gourmet bites",
        category: "Food",
        customCategory: "Appetizers"
      }
    ],
    guestExperience: {
      dressCode: "Club Attire",
      entryRules: "Valid ID required, 21+ only",
      tableLayoutMap: "https://example.com/layout2.jpg",
      parkingInfo: "Street parking available",
      accessibilityInfo: "Limited accessibility"
    },
    galleryPhotos: [
      "https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?q=80&w=1600&auto=format&fit=crop",
    ],
    promoVideos: [
      "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
    ],
    happyHourTimings: "7:00 PM - 9:00 PM",
  },
  {
    _id: "evt-dxb-003",
    name: "Neon Warehouse Rave",
    date: "2025-09-22",
    time: "11:00 PM",
    djArtists: "Rami, CHIKA",
    description: "Raw industrial vibes with techno and breaks all night long.",
    coverImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1600&auto=format&fit=crop",
    tickets: [
      { 
        _id: "gen", 
        name: "General", 
        price: 130, 
        description: "General admission ticket",
        quantityAvailable: 180,
        quantitySold: 0
      },
      { 
        _id: "vip", 
        name: "VIP", 
        price: 320, 
        description: "VIP access with premium seating",
        quantityAvailable: 50,
        quantitySold: 0
      },
    ],
    menuItems: [
      {
        _id: "drink2",
        name: "Energy Drink",
        price: "25 AED",
        itemImage: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400",
        description: "Premium energy drink",
        category: "Drinks",
        customCategory: "Energy Drinks"
      }
    ],
    guestExperience: {
      dressCode: "Industrial/Street",
      entryRules: "Valid ID required, 18+ only",
      tableLayoutMap: "https://example.com/layout3.jpg",
      parkingInfo: "Warehouse parking available",
      accessibilityInfo: "Not wheelchair accessible"
    },
    galleryPhotos: [
      "https://images.unsplash.com/photo-1514369118554-e20d93546b30?q=80&w=1600&auto=format&fit=crop",
    ],
    promoVideos: [
      "https://samplelib.com/lib/preview/mp4/sample-15s.mp4",
    ],
    happyHourTimings: "8:00 PM - 10:00 PM",
  },
  {
    _id: "evt-dxb-004",
    name: "Latin Night Fever",
    date: "2025-09-18",
    time: "8:30 PM",
    djArtists: "La Banda, DJ Carlos",
    description: "Salsa, bachata, and reggaeton vibes with live performances.",
    coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=1600&auto=format&fit=crop",
    tickets: [
      { 
        _id: "gen", 
        name: "General", 
        price: 100, 
        description: "General admission ticket",
        quantityAvailable: 150,
        quantitySold: 0
      },
    ],
    menuItems: [
      {
        _id: "food2",
        name: "Tapas Platter",
        price: "65 AED",
        itemImage: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400",
        description: "Spanish tapas selection",
        category: "Food",
        customCategory: "Tapas"
      }
    ],
    guestExperience: {
      dressCode: "Latin Elegant",
      entryRules: "Valid ID required, 21+ only",
      tableLayoutMap: "https://example.com/layout4.jpg",
      parkingInfo: "Valet parking available",
      accessibilityInfo: "Wheelchair accessible"
    },
    galleryPhotos: [
      "https://images.unsplash.com/photo-1521335629791-ce4aec67dd53?q=80&w=1600&auto=format&fit=crop",
    ],
    promoVideos: [
      "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
    ],
    happyHourTimings: "6:30 PM - 8:30 PM",
  },
  {
    _id: "evt-dxb-005",
    name: "Afterparty Reel",
    date: "2025-10-01",
    time: "10:00 PM",
    djArtists: "Various",
    description: "Party highlight reel.",
    coverImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1600&auto=format&fit=crop",
    tickets: [
      { 
        _id: "gen", 
        name: "General", 
        price: 100, 
        description: "General admission ticket",
        quantityAvailable: 100,
        quantitySold: 0
      }
    ],
    menuItems: [],
    guestExperience: {
      dressCode: "Casual",
      entryRules: "Valid ID required, 21+ only",
      tableLayoutMap: "https://example.com/layout5.jpg",
      parkingInfo: "Street parking available",
      accessibilityInfo: "Wheelchair accessible"
    },
    galleryPhotos: [],
    promoVideos: ["https://www.w3schools.com/html/mov_bbb.mp4"],
    happyHourTimings: "9:00 PM - 11:00 PM",
  },
  {
    _id: "evt-ad-006",
    name: "Dream Sequence",
    date: "2025-10-02",
    time: "9:30 PM",
    djArtists: "Collective",
    description: "Visual techno journey.",
    coverImage: "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1600&auto=format&fit=crop",
    tickets: [
      { 
        _id: "gen", 
        name: "General", 
        price: 120, 
        description: "General admission ticket",
        quantityAvailable: 100,
        quantitySold: 0
      }
    ],
    menuItems: [],
    guestExperience: {
      dressCode: "Club Attire",
      entryRules: "Valid ID required, 21+ only",
      tableLayoutMap: "https://example.com/layout6.jpg",
      parkingInfo: "Valet parking available",
      accessibilityInfo: "Limited accessibility"
    },
    galleryPhotos: [],
    promoVideos: ["https://www.w3schools.com/html/mov_bbb.mp4"],
    happyHourTimings: "8:30 PM - 10:30 PM",
  },
  {
    _id: "evt-dxb-007",
    name: "Steel Teaser",
    date: "2025-10-03",
    time: "11:30 PM",
    djArtists: "Live VJ",
    description: "Cinematic party cut.",
    coverImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1600&auto=format&fit=crop",
    tickets: [
      { 
        _id: "gen", 
        name: "General", 
        price: 140, 
        description: "General admission ticket",
        quantityAvailable: 100,
        quantitySold: 0
      }
    ],
    menuItems: [],
    guestExperience: {
      dressCode: "Industrial/Street",
      entryRules: "Valid ID required, 18+ only",
      tableLayoutMap: "https://example.com/layout7.jpg",
      parkingInfo: "Warehouse parking available",
      accessibilityInfo: "Not wheelchair accessible"
    },
    galleryPhotos: [],
    promoVideos: ["https://www.w3schools.com/html/mov_bbb.mp4"],
    happyHourTimings: "9:30 PM - 11:30 PM",
  },
];



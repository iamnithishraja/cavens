export type City = "Dubai" | "Abu Dhabi" | "Sharjah";

// Based on backend ticketSchema
export interface Ticket {
  _id?: string;
  name: string;
  price: number;
  description: string;
  quantityAvailable: number;
  quantitySold: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Based on backend menuItemSchema
export interface MenuItem {
  _id?: string;
  name: string;
  price: string;
  itemImage: string;
  description: string;
  category: string;
  customCategory: string;
}

// Based on backend eventSchema
export interface EventItem {
  _id?: string;
  name: string;
  date: string;
  time: string;
  djArtists: string;
  description: string;
  coverImage: string;
  tickets: Ticket[];
  menuItems: MenuItem[];
  guestExperience: {
    dressCode: string;
    entryRules: string;
    tableLayoutMap: string;
    parkingInfo: string;
    accessibilityInfo: string;
  };
  galleryPhotos: string[];
  promoVideos: string[];
  happyHourTimings: string;
}



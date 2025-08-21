export interface TicketType {
  id: string;
  name: string;
  price: string;
  description: string;
  quantity: string;
}

export interface ClubEvent {
  id: string;
  name: string;
  date: string;
  time: string;
  djArtists: string;
  description: string;
  ticketTypes: TicketType[];
  coverImage: string | null;
  // Event-specific data
  menuItems?: MenuItemFull[];
  happyHourTimings?: string;
  galleryPhotos?: string[];
  promoVideos?: string[];
  guestExperience?: {
    dressCode: string;
    entryRules: string;
    tableLayoutMap: string | null;
    parkingInfo: string;
    accessibilityInfo: string;
  };
}

export interface MenuItem {
  id: string;
  name: string;
  price: string;
  description: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export type MenuCategoryId =
  | "Appetizers & Snacks"
  | "Main Courses & Mains"
  | "Vegetarian & Plant-Based"
  | "Seafood"
  | "Desserts & Sweets"
  | "Beverages & Drinks"
  | "Other";

export interface MenuItemFull extends MenuItem {
  category: MenuCategoryId;
  customCategory?: string;
}


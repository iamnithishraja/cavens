export interface Order {
  _id: string;
  event: {
    _id: string;
    name: string;
    date: string;
    time: string;
    image?: string;
    coverImage?: string;
  };
  club: {
    _id: string;
    name: string;
    city: string;
  };
  ticket: {
    _id: string;
    name: string;
    price: number;
  };
  quantity: number;
  isPaid: boolean;
  transactionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingResponse {
  success: boolean;
  data: {
    _id: string;
    orders: Order[];
  };
}

export interface PurchaseTicketResponse {
  success: boolean;
  message: string;
  data: {
    ordersCreated: number;
    ordersUpdated: number;
    ticketType: string;
    pricePerTicket: number;
    totalAmount: number;
    finalQuantity: number;
    event: {
      id: string;
      name: string;
      date: string;
      time: string;
    };
    club: {
      id: string;
      name: string;
      city: string;
    };
    order: {
      id: string;
      transactionId: string;
      isPaid: boolean;
      quantity: number;
      createdAt: string;
      updatedAt: string;
    };
  };
}

// New types for completeOrder API
export interface CompleteOrderRequest {
  orderId: string;
}

export interface CompleteOrderResponse {
  success: boolean;
  message: string;
  data: {
    order: {
      _id: string;
      event: EventDetails;
      club: ClubDetails;
      ticket: TicketDetails;
      quantity: number;
      status: string;
      isPaid: boolean;
      transactionId: string;
      createdAt: string;
      updatedAt: string;
    };
    eventDetails: EventDetails;
    ticketDetails: TicketDetails;
    clubDetails: ClubDetails;
    scanTime: string;
    orderStatus: string;
  };
}

export interface EventDetails {
  _id: string;
  name: string;
  date: string;
  time: string;
  djArtists?: string;
  description?: string;
  coverImage?: string;
  guestExperience?: {
    dressCode?: string;
    entryRules?: string;
    tableLayoutMap?: string;
    parkingInfo?: string;
    accessibilityInfo?: string;
  };
  galleryPhotos?: string[];
  promoVideos?: string[];
  happyHourTimings?: string;
  status: string;
}

export interface TicketDetails {
  _id: string;
  name: string;
  price: number;
  description: string;
}

export interface ClubDetails {
  _id: string;
  name: string;
  city: string;
  typeOfVenue?: string;
  address?: string;
  phone?: string;
}

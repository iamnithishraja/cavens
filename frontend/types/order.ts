export interface Order {
  _id: string;
  event: {
    _id: string;
    name: string;
    date: string;
    time: string;
    image?: string;
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

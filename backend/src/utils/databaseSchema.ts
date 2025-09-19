export const DATABASE_SCHEMA = {
  models: {
    User: {
      collection: 'users',
      fields: {
        _id: 'ObjectId (auto-generated)',
        email: 'String (unique, sparse, default: undefined) - User email',
        name: 'String - User name',
        phone: 'String (unique) - Phone number',
        isPhoneVerified: 'Boolean (default: false)',
        role: 'String (enum: ["admin", "user", "club"], default: "user")',
        otp: 'String - OTP for verification',
        otpExpiry: 'Date - OTP expiration',
        age: 'String (enum: ["18-30", "30-50", "50+"])',
        gender: 'String (enum: ["male", "female", "other"])',
        club: 'ObjectId (ref: Club) - Associated club if role is "club"',
        orders: '[ObjectId] (ref: Order) - Array of Order references',
        createdAt: 'Date (default: Date.now)',
        updatedAt: 'Date (default: Date.now)'
      },
      relationships: {
        club: 'Many-to-one with Club model',
        orders: 'One-to-many with Order model'
      }
    },

    Club: {
      collection: 'clubs',
      fields: {
        _id: 'ObjectId (auto-generated)',
        owner: 'ObjectId (ref: User)',
        name: 'String (required) - Club name',
        logoUrl: 'String - Logo image URL',
        email: 'String (required) - Contact email',
        clubDescription: 'String (required) - Club description',
        typeOfVenue: 'String (required) - Type like "Nightclub", "Lounge", "Rooftop", etc.',
        coverBannerUrl: 'String - Cover banner image URL',
        photos: '[String] - Array of photo URLs',
        clubImages: '[String] - Array of club image URLs',
        city: 'String (required) - City name like "Dubai", "Abu Dhabi"',
        operatingDays: '[String] (enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], required) - Array of operating days',
        events: '[ObjectId] (ref: Event) - Array of Event references',
        phone: 'String (required) - Contact phone',
        rating: 'Number (default: 0) - Club rating 0-5',
        address: 'String (required) - Full address',
        mapLink: 'String (required) - Google Maps link',
        isApproved: 'Boolean (default: false) - Admin approval status',
        createdAt: 'Date (default: Date.now)',
        updatedAt: 'Date (default: Date.now)'
      },
      relationships: {
        events: 'One-to-many with Event model',
        owner: 'Many-to-one with User model'
      }
    },
    
    Event: {
      collection: 'events',
      fields: {
        _id: 'ObjectId (auto-generated)',
        name: 'String - Event name',
        date: 'String - Event date',
        time: 'String - Event time',
        djArtists: 'String - DJ/Artist names',
        description: 'String - Event description',
        coverImage: 'String - Cover image URL',
        eventMap: 'String - Event map/layout',
        tickets: '[ObjectId] (ref: Ticket, required) - Array of Ticket references',
        menuItems: '[ObjectId] (ref: MenuItem, required) - Array of MenuItem references',
        guestExperience: {
          dressCode: 'String - Dress code requirements',
          entryRules: 'String - Entry rules',
          tableLayoutMap: 'String - Table layout map',
          parkingInfo: 'String - Parking information',
          accessibilityInfo: 'String - Accessibility details'
        },
        galleryPhotos: '[String] - Array of photo URLs',
        promoVideos: '[String] - Array of video URLs',
        happyHourTimings: 'String - Happy hour details',
        isFeatured: 'Boolean (default: false) - Featured status',
        featuredNumber: 'Number (default: 0) - Featured priority',
        status: 'String (enum: ["active", "done"], default: "active") - Event status'
      },
      relationships: {
        tickets: 'One-to-many with Ticket model',
        menuItems: 'One-to-many with MenuItem model',
        belongsTo: 'Club (via Club.events array)'
      }
    },
    
    Ticket: {
      collection: 'tickets',
      fields: {
        _id: 'ObjectId (auto-generated)',
        name: 'String (required) - Ticket type name',
        price: 'Number (required) - Ticket price in AED',
        description: 'String (required) - Ticket description',
        quantityAvailable: 'Number (required) - Total tickets available',
        quantitySold: 'Number (default: 0) - Tickets sold',
        createdAt: 'Date (default: Date.now)',
        updatedAt: 'Date (default: Date.now)'
      },
      relationships: {
        belongsTo: 'Event (via Event.tickets array)'
      }
    },

    MenuItem: {
      collection: 'menuitems',
      fields: {
        _id: 'ObjectId (auto-generated)',
        name: 'String - Menu item name',
        price: 'String - Menu item price',
        itemImage: 'String - Menu item image URL',
        description: 'String - Menu item description',
        category: 'String - Menu category',
        customCategory: 'String - Custom menu category'
      },
      relationships: {
        belongsTo: 'Event (via Event.menuItems array)'
      }
    },
    
    Order: {
      collection: 'orders',
      fields: {
        _id: 'ObjectId (auto-generated)',
        event: 'ObjectId (ref: Event, required) - Event for which tickets are purchased',
        club: 'ObjectId (ref: Club, required) - Club hosting the event',
        ticket: 'ObjectId (ref: Ticket, required) - Selected ticket type',
        quantity: 'Number (required) - Number of tickets',
        status: 'String (enum: ["paid", "scanned"], default: "paid") - Order status',
        isPaid: 'Boolean (default: false) - Payment status',
        transactionId: 'String (required) - Payment transaction ID',
        createdAt: 'Date (default: Date.now)',
        updatedAt: 'Date (default: Date.now)'
      },
      relationships: {
        event: 'Many-to-one with Event model',
        club: 'Many-to-one with Club model',
        ticket: 'Many-to-one with Ticket model',
        user: 'Many-to-one with User model (via User.orders array)'
      }
    }
  },
  
  queryPatterns: {
    findClubsInCity: 'Club.find({ city: { $regex: new RegExp(`^${city}$`, "i") }, isApproved: true })',
    findUpcomingEventsInCity: 'Club.find({ city: city_regex, isApproved: true, events: { $exists: true, $not: { $size: 0 } } }).populate("events", { match: { status: "active", date: { $gte: "current_date" } } })',
    findEventsByKeyword: 'Use text search across event.name, event.description, event.djArtists',
    findClubsByType: 'Club.find({ typeOfVenue: { $regex: type, $options: "i" }, isApproved: true })',
    getEventDetails: 'Event.findById(id).populate("tickets")',
    getClubDetails: 'Club.findById(id).populate("events")',
    getUserBookings: 'User.findById(userId).populate({ path: "orders", match: { status: "paid" }, populate: [{ path: "event", populate: "tickets" }, { path: "club" }, { path: "ticket" }] })',
    findUserOrders: 'User.findById(userId).populate("orders")'
  },
  
  importantNotes: {
    eventDates: 'Events should be filtered by date to show only upcoming events. Use date: { $gte: current_date_string }',
    eventStatus: 'Only show events with status: "active"',
    clubApproval: 'Only show clubs with isApproved: true',
    relationships: 'Events belong to Clubs (Club.events array), not the other way around',
    
    // CRITICAL: Order Model Structure
    orderModel: 'Order model does NOT have userId field directly. Orders are linked to users via User.orders array',
    userBookings: 'To get user bookings, query User.findById(userId).populate("orders") instead of Order.find({userId})',
    orderFields: 'Order fields are: event (ref Event), club (ref Club), ticket (ref Ticket), quantity, status, isPaid, transactionId',
    
    // CRITICAL: Field Names - Use EXACT names from models
    eventFields: 'Event fields: name, date, time, djArtists, description, coverImage, eventMap, tickets, menuItems, guestExperience, galleryPhotos, promoVideos, happyHourTimings, isFeatured, featuredNumber, status',
    clubFields: 'Club fields: owner, name, logoUrl, email, clubDescription, typeOfVenue, coverBannerUrl, photos, clubImages, city, operatingDays, events, phone, rating, address, mapLink, isApproved, createdAt, updatedAt',
    ticketFields: 'Ticket fields: name, price, description, quantityAvailable, quantitySold, createdAt, updatedAt',
    userFields: 'User fields: email, name, phone, isPhoneVerified, role, otp, otpExpiry, age, gender, club, orders, createdAt, updatedAt',
    
    // CRITICAL: Reference Field Names
    orderReferences: 'Order references: event (not eventId), club (not clubId), ticket (not ticketId)',
    eventReferences: 'Event references: tickets (not ticketIds), menuItems (not menuItemIds)',
    clubReferences: 'Club references: events (not eventIds), owner (not ownerId)',
    userReferences: 'User references: orders (not orderIds), club (not clubId)'
  },
  
  commonCities: ['Dubai', 'Abu Dhabi', 'Sharjah'],
  commonClubTypes: ['Nightclub', 'Lounge', 'Rooftop', 'Pool Club', 'Restaurant & Bar'],
  eventStatuses: ['active', 'done'],
  userRoles: ['admin', 'user', 'club']
};

export const getSchemaForAI = () => {
  return JSON.stringify(DATABASE_SCHEMA, null, 2);
};

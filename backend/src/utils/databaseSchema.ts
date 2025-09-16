export const DATABASE_SCHEMA = {
  models: {
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
        operatingDays: '[String] - Array of days: ["Monday", "Tuesday", ...]',
        events: '[ObjectId] - Array of Event references',
        phone: 'String (required) - Contact phone',
        rating: 'Number (default: 0) - Club rating 0-5',
        address: 'String (required) - Full address',
        mapLink: 'String (required) - Google Maps link',
        isApproved: 'Boolean (default: false) - Admin approval status',
        createdAt: 'Date (auto)',
        updatedAt: 'Date (auto)'
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
        tickets: '[ObjectId] - Array of Ticket references',
        menuItems: '[ObjectId] - Array of MenuItem references',
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
        status: 'String - "active" or "done"'
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
        createdAt: 'Date (auto)',
        updatedAt: 'Date (auto)'
      },
      relationships: {
        belongsTo: 'Event (via Event.tickets array)'
      }
    },
    
    User: {
      collection: 'users',
      fields: {
        _id: 'ObjectId (auto-generated)',
        email: 'String (unique, sparse) - User email',
        name: 'String - User name',
        phone: 'String (unique) - Phone number',
        isPhoneVerified: 'Boolean (default: false)',
        role: 'String - "admin", "user", or "club"',
        age: 'String - "18-30", "30-50", "50+"',
        gender: 'String - "male", "female", "other"',
        club: 'ObjectId (ref: Club) - Associated club if role is "club"',
        orders: '[ObjectId] - Array of Order references',
        createdAt: 'Date (auto)',
        updatedAt: 'Date (auto)'
      },
      relationships: {
        club: 'Many-to-one with Club model',
        orders: 'One-to-many with Order model'
      }
    },
    
    Order: {
      collection: 'orders',
      fields: {
        _id: 'ObjectId (auto-generated)',
        user: 'ObjectId (ref: User)',
        event: 'ObjectId (ref: Event)',
        club: 'ObjectId (ref: Club)',
        ticket: 'ObjectId (ref: Ticket)',
        quantity: 'Number - Number of tickets',
        totalAmount: 'Number - Total price',
        transactionId: 'String - Payment transaction ID',
        isPaid: 'Boolean - Payment status',
        isScanned: 'Boolean - Entry scan status',
        createdAt: 'Date (auto)'
      },
      relationships: {
        user: 'Many-to-one with User model',
        event: 'Many-to-one with Event model',
        club: 'Many-to-one with Club model',
        ticket: 'Many-to-one with Ticket model'
      }
    }
  },
  
  queryPatterns: {
    findClubsInCity: 'Club.find({ city: { $regex: new RegExp(`^${city}$`, "i") }, isApproved: true })',
    findEventsInCity: 'Club.find({ city: city_regex, isApproved: true, events: { $exists: true, $not: { $size: 0 } } }).populate("events", { match: { status: "active" } })',
    findEventsByKeyword: 'Use text search across event.name, event.description, event.djArtists',
    findClubsByType: 'Club.find({ typeOfVenue: { $regex: type, $options: "i" }, isApproved: true })',
    getEventDetails: 'Event.findById(id).populate("tickets")',
    getClubDetails: 'Club.findById(id).populate("events")'
  },
  
  commonCities: ['Dubai', 'Abu Dhabi', 'Sharjah'],
  commonClubTypes: ['Nightclub', 'Lounge', 'Rooftop', 'Pool Club', 'Restaurant & Bar'],
  eventStatuses: ['active', 'done'],
  userRoles: ['admin', 'user', 'club']
};

export const getSchemaForAI = () => {
  return JSON.stringify(DATABASE_SCHEMA, null, 2);
};

import type { Request, Response } from 'express';
import openRouterService from '../utils/openRouterService';
import eventModel from '../models/eventModel';
import clubModel from '../models/clubModel';
import { getSchemaForAI } from '../utils/databaseSchema';
import { getContextualSuggestions, type ScreenType } from '../constants/chatbotSuggestions';

interface ChatbotMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  type?: number; // 0: general, 1: event question, 2: find events
}

interface ChatbotRequest extends Request {
  body: {
    message: string;
    userId?: string;
    eventId?: string;
    city?: string;
    userLocation?: {
      latitude: number;
      longitude: number;
    };
    conversationHistory?: ChatbotMessage[];
    screen?: 'HOME' | 'MAP' | 'BOOKINGS' | 'PROFILE' | 'GENERAL';
    hasBookings?: boolean;
    preferences?: {
      musicGenres?: string[];
      priceRange?: { min: number; max: number };
      eventTypes?: string[];
      clubTypes?: string[];
    };
  };
}

export const chatWithBot = async (req: ChatbotRequest, res: Response) => {
  try {
    const { message, userId, eventId, city = 'Dubai', userLocation, preferences, conversationHistory = [], screen = 'GENERAL', hasBookings = false } = req.body;
    
    // Ensure city is a string
    const cityString = typeof city === 'string' ? city : 'Dubai';

    if (!message || typeof message !== 'string') {
       res.status(400).json({
        success: false,
        error: 'Message is required and must be a string'
      });
      return;
    }

    // Analyze user intent with conversation context
    const intent = await openRouterService.analyzeIntent(message, conversationHistory);

    let response: string;
    let responseType: number;

    // Determine user's actual location
    let effectiveCity = cityString;
    
    // Handle "near me" queries - just use their current city setting
    if (intent.extractedInfo?.nearMe || intent.extractedInfo?.location === 'current') {
      effectiveCity = cityString; // Use the city they have selected in the app
    } else if (intent.extractedInfo?.location && intent.extractedInfo.location !== 'current') {
      // User specified a different city
      effectiveCity = intent.extractedInfo.location;
    }

    switch (intent.type) {
      case 'find_events':
      case 'filter_events':
        responseType = 2; // Return 2 for finding events
        
        try {
          // Use AI to generate optimal database query
          const aiQuery = await executeAIGeneratedQuery(message, intent, effectiveCity);
          
          let events: any[] = [];
          
          if (aiQuery.type === 'Club') {
            // Extract events from clubs
            aiQuery.data.forEach((club: any) => {
              if (club.events && Array.isArray(club.events)) {
                club.events.forEach((event: any) => {
                  if (event && event._id) {
                    events.push({
                      id: event._id,
                      name: event.name,
                      description: event.description,
                      date: event.date,
                      time: event.time,
                      venue: club.name,
                      city: club.city,
                      djArtists: event.djArtists,
                      tickets: event.tickets,
                      guestExperience: event.guestExperience
                    });
                  }
                });
              }
            });
          } else {
            // Direct event results
            events = aiQuery.data.map((event: any) => ({
              id: event._id,
              name: event.name,
              description: event.description,
              date: event.date,
              time: event.time,
              djArtists: event.djArtists,
              tickets: event.tickets,
              guestExperience: event.guestExperience
            }));
          }
          
          
          response = await openRouterService.generateEventRecommendations(
            message,
            events,
            preferences,
            conversationHistory,
            intent.extractedInfo
          );
          
        } catch (error) {
          // Fallback to existing method
          const events = await searchEventsForChatbot(
            intent.query || message, 
            effectiveCity
          );
          response = await openRouterService.generateEventRecommendations(
            message,
            events,
            preferences,
            conversationHistory,
            intent.extractedInfo
          );
        }
        break;

      case 'find_clubs':
      case 'filter_clubs':
        responseType = 3; // Return 3 for finding clubs
        
        try {
          // Use AI to generate optimal database query
          const aiQuery = await executeAIGeneratedQuery(message, intent, effectiveCity);
          
          const clubs = aiQuery.data.map((club: any) => ({
            id: club._id,
            name: club.name,
            description: club.clubDescription,
            type: club.typeOfVenue,
            city: club.city,
            address: club.address,
            phone: club.phone,
            rating: club.rating,
            photos: club.photos,
            operatingDays: club.operatingDays,
            eventsCount: club.events?.length || 0
          }));
          
          
          response = await openRouterService.generateClubRecommendations(
            message,
            clubs,
            preferences,
            conversationHistory,
            intent.extractedInfo
          );
          
        } catch (error) {
          // Fallback to existing method
          const clubs = await searchClubsForChatbot(
            intent.query || message,
            effectiveCity
          );
          response = await openRouterService.generateClubRecommendations(
            message,
            clubs,
            preferences,
            conversationHistory,
            intent.extractedInfo
          );
        }
        break;

      case 'event_question':
        responseType = 1; // Return 1 for event questions
        let eventDetails = null;
        
        console.log('🎯 Processing event question:', {
          message,
          intent: intent.type,
          extractedInfo: intent.extractedInfo,
          eventId,
          effectiveCity
        });
        
        if (eventId) {
          console.log('🔍 Getting event details by ID:', eventId);
          eventDetails = await getEventDetails(eventId);
        } else {
          console.log('🔍 Finding event from query...');
          eventDetails = await findEventFromQuery(intent, effectiveCity);
        }

        console.log('📋 Event details found:', eventDetails ? 'YES' : 'NO');
        if (eventDetails) {
          console.log('✅ Event details:', {
            name: eventDetails.name,
            venue: eventDetails.venue,
            date: eventDetails.date,
            time: eventDetails.time
          });
        }

        response = await openRouterService.answerEventQuestion(
          message,
          eventDetails,
          { city: effectiveCity, userId, intent, conversationHistory, userLocation }
        );
        break;

      case 'club_question':
        responseType = 4; // Return 4 for club questions
        const clubDetails = await findClubFromQuery(intent, effectiveCity);
        response = await openRouterService.answerClubQuestion(
          message,
          clubDetails,
          { city: effectiveCity, userId, intent, conversationHistory, userLocation }
        );
        break;

      case 'booking_help':
        responseType = 5; // Return 5 for booking help
        response = await openRouterService.handleBookingHelp(
          message,
          conversationHistory,
          { city: effectiveCity, userId, screen, hasBookings }
        );
        break;

      case 'directions':
        responseType = 6; // Return 6 for directions
        response = await openRouterService.handleDirections(
          message,
          intent.extractedInfo,
          { city: effectiveCity, userLocation, conversationHistory, screen }
        );
        break;

      default:
        responseType = 0; // General conversation
        response = await openRouterService.handleGeneralConversation(message, conversationHistory, { screen, hasBookings, city: effectiveCity });
        break;
    }

    res.json({
      success: true,
      data: {
        response,
        type: responseType,
        intent: intent.type,
        confidence: intent.confidence,
        showCards: intent.showCards || false,
        cardType: intent.cardType || null,
        cards: intent.showCards ? await getCardData(intent, effectiveCity) : null
      }
    });
    return;
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      success: false,
      error: 'Sorry, I encountered an error while processing your request.'
    });
    return;
  }
};

async function executeAIGeneratedQuery(
  userMessage: string,
  intent: any,
  city: string
): Promise<{ data: any[]; type: string }> {
  try {
    
    // Get database schema for AI
    const schema = getSchemaForAI();
    
    // Generate query using AI
    const queryConfig = await openRouterService.generateDatabaseQuery(userMessage, intent, schema);
    
    let results = [];
    
    // Execute the query based on model
    switch (queryConfig.model) {
      case 'Club':
        if (queryConfig.populate) {
          results = await clubModel.find(queryConfig.query).populate(queryConfig.populate);
        } else {
          results = await clubModel.find(queryConfig.query);
        }
        break;
        
      case 'Event':
        if (queryConfig.populate) {
          results = await eventModel.find(queryConfig.query).populate(queryConfig.populate);
        } else {
          results = await eventModel.find(queryConfig.query);
        }
        break;
        
      default:
        // Fallback to club search
        results = await clubModel.find({ 
          city: { $regex: new RegExp(`^${city}$`, 'i') }, 
          isApproved: true 
        });
        break;
    }
    
    
    return {
      data: results,
      type: queryConfig.model
    };
    
  } catch (error) {
    // Fallback to simple query
    const fallbackResults = await clubModel.find({ 
      city: { $regex: new RegExp(`^${city}$`, 'i') }, 
      isApproved: true 
    });
    return {
      data: fallbackResults,
      type: 'Club'
    };
  }
}

// Enhanced event finder using AI queries and conversation context
async function findEventFromQuery(intent: any, city: string): Promise<any> {
  try {
    const { extractedInfo } = intent;
    
    // Try multiple search strategies
    let searchQuery = '';
    let searchClubs = [];
    
    // Strategy 1: Search by event name
    if (extractedInfo?.eventName) {
      searchQuery = extractedInfo.eventName;
      searchClubs = await clubModel.find({
        city: { $regex: new RegExp(`^${city}$`, 'i') },
        isApproved: true,
        'events.name': { $regex: new RegExp(extractedInfo.eventName, 'i') }
      }).populate({
        path: 'events',
        match: { 
          name: { $regex: new RegExp(extractedInfo.eventName, 'i') },
          status: 'active'
        }
      });
    }
    
    // Strategy 2: Search by venue name
    if (searchClubs.length === 0 && extractedInfo?.venueName) {
      searchQuery = extractedInfo.venueName;
      searchClubs = await clubModel.find({
        city: { $regex: new RegExp(`^${city}$`, 'i') },
        isApproved: true,
        name: { $regex: new RegExp(extractedInfo.venueName, 'i') }
      }).populate({
        path: 'events',
        match: { status: 'active' }
      });
    }
    
    // Strategy 3: Search by DJ name
    if (searchClubs.length === 0 && extractedInfo?.djName) {
      searchQuery = extractedInfo.djName;
      searchClubs = await clubModel.find({
        city: { $regex: new RegExp(`^${city}$`, 'i') },
        isApproved: true,
        'events.djArtists': { $regex: new RegExp(extractedInfo.djName, 'i') }
      }).populate({
        path: 'events',
        match: { 
          djArtists: { $regex: new RegExp(extractedInfo.djName, 'i') },
          status: 'active'
        }
      });
    }
    
    // Strategy 4: Use AI query as fallback
    if (searchClubs.length === 0) {
      console.log('🔍 Using AI query fallback for event search');
      const aiQuery = await executeAIGeneratedQuery(`Find event: ${extractedInfo?.eventName || extractedInfo?.venueName || 'event details'}`, intent, city);
      
      if (aiQuery.type === 'Club' && aiQuery.data.length > 0) {
        searchClubs = aiQuery.data;
      }
    }
    
    // Extract events from found clubs
    for (const club of searchClubs) {
      if (club.events && club.events.length > 0) {
        const event = club.events[0]; // Take the first matching event
        return {
          id: event._id,
          name: event.name,
          description: event.description,
          date: event.date,
          time: event.time,
          venue: club.name,
          city: club.city,
          address: club.address,
          djArtists: event.djArtists,
          guestExperience: event.guestExperience,
          tickets: event.tickets,
          coverImage: event.coverImage,
          galleryPhotos: event.galleryPhotos,
          promoVideos: event.promoVideos,
          contact: {
            phone: club.phone,
            email: club.email
          }
        };
      }
    }
    
    console.log('❌ No event found for query:', searchQuery);
    return null;
  } catch (error) {
    console.error('Error finding event from query:', error);
    return null;
  }
}

// Legacy fallback - can be removed once AI queries are stable
async function searchEventsForChatbot(query: string, city: string): Promise<any[]> {
  try {
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const clubs = await clubModel.find({
      city: { $regex: new RegExp(`^${city}$`, 'i') },
      isApproved: true,
      events: { $exists: true, $not: { $size: 0 } }
    }).populate({
      path: 'events',
      match: { 
        status: 'active',
        date: { $gte: currentDate } // Only upcoming events
      },
      populate: { path: 'tickets' }
    });

    const events: any[] = [];
    clubs.forEach((club: any) => {
      if (club.events) {
        club.events.forEach((event: any) => {
          events.push({
            id: event._id,
            name: event.name,
            venue: club.name,
            city: club.city,
            date: event.date,
            time: event.time,
            djArtists: event.djArtists,
            tickets: event.tickets
          });
        });
      }
    });

    return events;
  } catch (error) {
    console.error('Error in fallback event search:', error);
    return [];
  }
}

async function getEventDetails(eventId: string): Promise<any> {
  try {
    const event = await eventModel.findById(eventId)
      .populate('tickets')
      .lean();

    if (!event) {
      return null;
    }

    // Find the club that has this event
    const club = await clubModel.findOne({
      events: eventId
    }).select('name city address phone email').lean();

    return {
      id: event._id,
      name: event.name,
      description: event.description,
      date: event.date,
      time: event.time,
      venue: club?.name,
      city: club?.city,
      address: club?.address,
      contact: {
        phone: club?.phone,
        email: club?.email
      },
      djArtists: event.djArtists,
      guestExperience: event.guestExperience,
      ticketTypes: event.tickets?.map((ticket: any) => ({
        name: ticket.name,
        price: ticket.price,
        description: ticket.description,
        available: ticket.quantityAvailable > ticket.quantitySold,
        quantityAvailable: ticket.quantityAvailable,
        quantitySold: ticket.quantitySold
      })),
      coverImage: event.coverImage,
      galleryPhotos: event.galleryPhotos,
      promoVideos: event.promoVideos,
      isFeatured: event.isFeatured,
      featuredNumber: event.featuredNumber,
      status: event.status,
      happyHourTimings: event.happyHourTimings
    };

  } catch (error) {
    console.error('Error getting event details:', error);
    return null;
  }
}

// Legacy fallback - can be removed once AI queries are stable
async function searchClubsForChatbot(query: string, city: string): Promise<any[]> {
  try {
    const clubs = await clubModel.find({
      city: { $regex: new RegExp(`^${city}$`, 'i') },
      isApproved: true
    }).limit(5);

    return clubs.map(club => ({
      id: club._id,
      name: club.name,
      description: club.clubDescription,
      type: club.typeOfVenue,
      city: club.city,
      address: club.address,
      rating: club.rating
    }));
  } catch (error) {
    console.error('Error in fallback club search:', error);
    return [];
  }
}

// Simplified club finder using AI queries
async function findClubFromQuery(intent: any, city: string): Promise<any> {
  try {
    const aiQuery = await executeAIGeneratedQuery(`Find club: ${intent.clubName || intent.extractedInfo?.clubName || 'club details'}`, intent, city);
    
    if (aiQuery.data.length > 0) {
      const result = aiQuery.data[0];
      return {
        id: result._id,
        name: result.name,
        description: result.clubDescription,
        type: result.typeOfVenue,
        city: result.city,
        address: result.address,
        phone: result.phone,
        rating: result.rating,
        events: result.events
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error finding club from query:', error);
    return null;
  }
}

// Function to get card data based on intent
async function getCardData(intent: any, city: string): Promise<any[]> {
  try {
    const { type, cardType } = intent;
    
    if (type === 'find_events' || type === 'filter_events' || (cardType === 'events')) {
      // Get events data
      const aiQuery = await executeAIGeneratedQuery('find events', intent, city);
      let events: any[] = [];

      if (aiQuery.type === 'Club') {
        // Extract events from clubs
        aiQuery.data.forEach((club: any) => {
          if (club.events && Array.isArray(club.events)) {
            club.events.forEach((event: any) => {
              if (event && event._id) {
                events.push({
                  id: event._id,
                  name: event.name,
                  description: event.description,
                  date: event.date,
                  time: event.time,
                  venue: club.name,
                  city: club.city,
                  djArtists: event.djArtists,
                  tickets: event.tickets,
                  guestExperience: event.guestExperience,
                  coverImage: event.coverImage,
                  isFeatured: event.isFeatured
                });
              }
            });
          }
        });
      } else {
        // Direct event results
        events = aiQuery.data.map((event: any) => ({
          id: event._id,
          name: event.name,
          description: event.description,
          date: event.date,
          time: event.time,
          djArtists: event.djArtists,
          tickets: event.tickets,
          guestExperience: event.guestExperience,
          coverImage: event.coverImage,
          isFeatured: event.isFeatured
        }));
      }

      return events.slice(0, 6); // Limit to 6 events
    }
    
    if (type === 'find_clubs' || type === 'filter_clubs' || (cardType === 'clubs')) {
      // Get clubs data
      const aiQuery = await executeAIGeneratedQuery('find clubs', intent, city);
      
      const clubs = aiQuery.data.map((club: any) => ({
        id: club._id,
        name: club.name,
        description: club.clubDescription,
        type: club.typeOfVenue,
        city: club.city,
        address: club.address,
        phone: club.phone,
        rating: club.rating,
        photos: club.photos,
        operatingDays: club.operatingDays,
        eventsCount: club.events?.length || 0,
        coverImage: club.photos?.[0]
      }));

      return clubs.slice(0, 6); // Limit to 6 clubs
    }

    return [];
  } catch (error) {
    console.error('Error getting card data:', error);
    return [];
  }
}

export const getChatbotSuggestions = async (req: Request, res: Response) => {
  try {
    const { 
      city = 'Dubai', 
      screen = 'GENERAL'
    } = req.query;
    console.log('req.query is ',req.query);
    
    const cityString = typeof city === 'string' ? city : 'Dubai';
    const screenType = typeof screen === 'string' ? screen.toUpperCase() as ScreenType : 'GENERAL';

    // Get contextual suggestions based on screen and user context
    const contextualSuggestions = getContextualSuggestions(
      screenType,
      cityString
    );

    console.log('📝 Generated contextual suggestions:', contextualSuggestions);

    // Use the same pattern as other controllers
    const clubQuery: any = { 
      events: { $exists: true, $not: { $size: 0 } },
      isApproved: true
    };
    
    if (cityString) {
      clubQuery.city = { $regex: new RegExp(`^${cityString}$`, "i") };
    }

    const clubsInCity = await clubModel.find(clubQuery).select('_id name events').lean();

    let popularEvents: any[] = [];

    if (clubsInCity.length === 0) {
       res.json({
        success: true,
        data: {
          suggestions: contextualSuggestions.map(s => s.text),
          popularEvents: [],
          screen: screenType,
          city: cityString
        }
      });
      return;
    }

    // Get all event IDs from these clubs
    const eventIds: any[] = [];
    clubsInCity.forEach(club => {
      if (club.events) {
        eventIds.push(...club.events);
      }
    });

    // Get popular events
    const events = await eventModel.find({ 
      _id: { $in: eventIds },
      status: 'active'
    })
      .sort({ isFeatured: -1, featuredNumber: -1, createdAt: -1 })
      .limit(3)
      .lean();

    // Find club names for the events
    popularEvents = events.map(event => {
      const club = clubsInCity.find(c => c.events?.includes(event._id));
      return {
        id: event._id,
        name: event.name,
        venue: club?.name || 'Unknown Venue',
        date: event.date
      };
    });

    // Add popular event suggestion if available and relevant to screen
    if (popularEvents.length > 0 && ['HOME', 'EVENTS', 'GENERAL'].includes(screenType)) {
      contextualSuggestions.push({
        text: `Tell me about ${popularEvents[0].name}`,
        category: 'events'
      });
    }

    res.json({
      success: true,
      data: {
        suggestions: contextualSuggestions.map(s => s.text),
        popularEvents,
        screen: screenType,
        city: cityString
      }
    });
    return;

  } catch (error) {
    console.error('Error getting chatbot suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get suggestions'
    });
  }
};


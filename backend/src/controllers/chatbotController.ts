import type { Request, Response } from 'express';
import openRouterService from '../utils/openRouterService';
import eventModel from '../models/eventModel';
import clubModel from '../models/clubModel';
import { getSchemaForAI } from '../utils/databaseSchema';
import { getContextualSuggestions, type ScreenType } from '../constants/chatbotSuggestions';
import User from '../models/userModel';
import { calculateDistanceFromMapsLink } from '../utils/mapsDistanceCalculator';

interface ChatbotMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  type?: number; // 0: general, 1: event question, 2: find events
}

interface ChatbotRequest extends Request {
  user?: any; // User object from auth middleware
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
    stream?: boolean;
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
    const { message, eventId, city = 'Dubai', userLocation, preferences, conversationHistory = [], screen = 'GENERAL', hasBookings = false, stream = false } = req.body;
    
    console.log('🚀 [DEBUG] ===== CHATBOT REQUEST START =====');
    console.log('🚀 [DEBUG] Full message:', message);
    console.log('🚀 [DEBUG] Stream mode:', stream);
    console.log('🚀 [DEBUG] City:', city);
    console.log('🚀 [DEBUG] Screen:', screen);
    console.log('🚀 [DEBUG] Has bookings:', hasBookings);
    console.log('🚀 [DEBUG] Conversation history length:', conversationHistory?.length || 0);
    console.log('🚀 [DEBUG] User location:', userLocation);
    
    // Get userId from authenticated user
    const userId = req.user?.id;
    
    console.log('🔐 [DEBUG] User authentication:', {
      userId,
      userEmail: req.user?.email,
      userName: req.user?.name,
      isAuthenticated: !!req.user
    });
    
    console.log('📍 [DEBUG] Location data received:', {
      userLocation,
      hasLocation: !!userLocation,
      latitude: userLocation?.latitude,
      longitude: userLocation?.longitude,
      screen,
      stream
    });
    
    // Ensure city is a string
    const cityString = typeof city === 'string' ? city : 'Dubai';

    if (!message || typeof message !== 'string') {
      if (stream) {
        res.writeHead(400, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        });
        res.write(`data: ${JSON.stringify({ type: 'error', error: 'Message is required and must be a string' })}\n\n`);
        res.end();
      } else {
        res.status(400).json({
          success: false,
          error: 'Message is required and must be a string'
        });
      }
      return;
    }

    // Handle streaming response
    if (stream) {
      console.log('🚀 [DEBUG] ===== STARTING STREAMING MODE =====');
      console.log('🚀 [DEBUG] Setting up SSE headers...');
      
      // Set up SSE headers
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      });

      // Send initial connection event
      res.write(`data: ${JSON.stringify({ type: 'connection', message: 'Connected to AI stream' })}\n\n`);
      
      // Set up heartbeat to keep connection alive
      const heartbeatInterval = setInterval(() => {
        res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`);
      }, 30000);

      try {
        console.log('🚀 [DEBUG] Processing streaming request...');
        
        // Send immediate "thinking" response
        console.log('🚀 [DEBUG] Sending thinking response...');
        res.write(`data: ${JSON.stringify({ 
          type: 'thinking', 
          message: 'I\'m thinking...' 
        })}\n\n`);
        
        // Process the actual intent and generate response
        console.log('🚀 [DEBUG] Analyzing intent for streaming...');
        const intent = await openRouterService.analyzeIntent(message, conversationHistory);
        console.log('🎯 [DEBUG] Intent analysis result:', intent);
        
        // Process based on intent type
        let response: string;
        let responseType: number;
        
        // Determine user's actual location
        let effectiveCity = cityString;
        
        // Handle "near me" queries - just use their current city setting
        if (intent.extractedInfo?.nearMe || intent.extractedInfo?.location === 'current') {
          console.log('🗺️ [DEBUG] Using current city for near me query:', effectiveCity);
        } else if (intent.extractedInfo?.location && intent.extractedInfo.location !== 'current') {
          // User specified a different city
          effectiveCity = intent.extractedInfo.location;
          console.log('🏙️ [DEBUG] Using specified city:', effectiveCity);
        }

        console.log('🚀 [DEBUG] Processing intent type:', intent.type);
        
        switch (intent.type) {
          case 'find_events':
          case 'filter_events':
            console.log('🎯 [DEBUG] Processing find_events intent');
            responseType = 2;
            
            try {
              let events: any[] = [];
              
              if (userLocation && intent.extractedInfo?.nearMe) {
                console.log('🗺️ [DEBUG] Using distance-based event search');
                const clubsWithDistance = await getClubsWithDistance(userLocation, effectiveCity);
                events = extractEventsFromClubs(clubsWithDistance);
                console.log(`✅ [DEBUG] Found ${events.length} events with distance data`);
              } else {
                console.log('🔍 [DEBUG] Using regular event search');
                const aiQuery = await executeAIGeneratedQuery(message, intent, effectiveCity);
                
                if (aiQuery.type === 'Club') {
                  events = extractEventsFromClubs(aiQuery.data);
                } else {
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
              }
              
              console.log('🤖 [DEBUG] Generating event recommendations...');
              const fullResponse = await openRouterService.generateEventRecommendations(
                message,
                events,
                preferences,
                conversationHistory,
                intent.extractedInfo
              );
              
              console.log('📝 [DEBUG] Event response generated:', fullResponse.substring(0, 100) + '...');
              await streamResponse(fullResponse, res);
              response = fullResponse;
              
            } catch (error) {
              console.error('❌ [DEBUG] Error in event search:', error);
              const fallbackEvents = await searchEventsForChatbot(
                intent.query || message, 
                effectiveCity
              );
              const fallbackResponse = await openRouterService.generateEventRecommendations(
                message,
                fallbackEvents,
                preferences,
                conversationHistory,
                intent.extractedInfo
              );
              console.log('📝 [DEBUG] Fallback response generated:', fallbackResponse.substring(0, 100) + '...');
              await streamResponse(fallbackResponse, res);
              response = fallbackResponse;
            }
            break;
            
          default:
            console.log('🎯 [DEBUG] Processing default/general conversation intent');
            responseType = 0;
            const generalResponse = await openRouterService.handleGeneralConversation(message, conversationHistory, { screen, hasBookings, city: effectiveCity });
            console.log('📝 [DEBUG] General response generated:', generalResponse.substring(0, 100) + '...');
            await streamResponse(generalResponse, res);
            response = generalResponse;
            break;
        }
        
        // Send final complete event
        console.log('🚀 [DEBUG] Sending final complete event...');
        res.write(`data: ${JSON.stringify({ 
          type: 'complete', 
          data: {
            response,
            type: responseType,
            intent: intent.type,
            confidence: intent.confidence,
            showCards: false,
            cardType: null,
            cards: null
          }
        })}\n\n`);

        
        clearInterval(heartbeatInterval);
        res.end();
        console.log('✅ [DEBUG] Streaming response completed successfully');
      } catch (error) {
        console.error('Chatbot streaming error:', error);
        clearInterval(heartbeatInterval);
        res.write(`data: ${JSON.stringify({ 
          type: 'error', 
          error: 'Sorry, I encountered an error while processing your request.'
        })}\n\n`);
        res.end();
      }
      return;
    }

        // Quick fallback for simple greetings
        console.log('🔍 [DEBUG] Checking greeting pattern for message:', message);
        if (message.toLowerCase().match(/^(hi|hello|hey|good morning|good afternoon|good evening)$/)) {
          console.log('✅ [DEBUG] Message matches greeting pattern, using simple response');
          const greetingResponse = "Hi! I'm Cavens AI 🎉 I can help you find amazing events and answer questions about nightlife in your city. What can I help you with?";
          
          // Stream the greeting response word by word
          const words = greetingResponse.split(' ');
          for (let i = 0; i < words.length; i++) {
            const word = words[i];
            if (!word) continue;
            
            res.write(`data: ${JSON.stringify({ 
              type: 'token', 
              token: (i > 0 ? ' ' : '') + word,
              isComplete: i === words.length - 1
            })}\n\n`);
            
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          // Send final complete event
          res.write(`data: ${JSON.stringify({ 
            type: 'complete', 
            data: {
              response: greetingResponse,
              type: 0,
              intent: 'general',
              confidence: 1.0,
              showCards: false,
              cardType: null,
              cards: null
            }
          })}\n\n`);
          
          res.end();
          return;
        }

        // Analyze user intent with conversation context
        console.log('🔍 [DEBUG] Analyzing intent for message:', message);
        const intent = await openRouterService.analyzeIntent(message, conversationHistory);
        console.log('🎯 [DEBUG] Intent analysis result:', intent);
        
        console.log('🎯 Intent analysis result:', {
          intent: intent.type,
          confidence: intent.confidence,
          showCards: intent.showCards,
          cardType: intent.cardType,
          extractedInfo: intent.extractedInfo,
          nearMe: intent.extractedInfo?.nearMe
        });

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

    console.log('🚀 [DEBUG] Processing intent type:', intent.type);
    switch (intent.type) {
      case 'find_events':
      case 'filter_events':
        console.log('🎯 [DEBUG] Processing find_events intent');
        responseType = 2; // Return 2 for finding events
        
        try {
          let events: any[] = [];
          
          // If user has location and is asking for nearby events, use distance calculation
          if (userLocation && intent.extractedInfo?.nearMe) {
            console.log('🗺️ Using distance-based event search with user location:', userLocation);
            
            // Use the existing getNearbyEvents logic
            const clubsWithDistance = await getClubsWithDistance(userLocation, effectiveCity);
            events = extractEventsFromClubs(clubsWithDistance);
            
            console.log(`✅ Found ${events.length} events with distance data`);
          } else {
            // Use AI to generate optimal database query for regular search
            console.log('🔍 Using regular event search without distance');
            const aiQuery = await executeAIGeneratedQuery(message, intent, effectiveCity);
            
            if (aiQuery.type === 'Club') {
              // Extract events from clubs using helper function
              events = extractEventsFromClubs(aiQuery.data);
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
          }
          
          // Stream the response word by word
          const fullResponse = await openRouterService.generateEventRecommendations(
            message,
            events,
            preferences,
            conversationHistory,
            intent.extractedInfo
          );
          
          // Stream the response word by word
          await streamResponse(fullResponse, res);
          
          response = fullResponse;
          
        } catch (error) {
          console.error('Error in event search:', error);
          // Only use fallback if AI query completely fails
          const fallbackEvents = await searchEventsForChatbot(
            intent.query || message, 
            effectiveCity
          );
          response = await openRouterService.generateEventRecommendations(
            message,
            fallbackEvents,
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
          let clubs: any[] = [];
          
          // If user has location and is asking for nearby clubs, use distance calculation
          if (userLocation && intent.extractedInfo?.nearMe) {
            console.log('🗺️ Using distance-based club search with user location:', userLocation);
            
            // Use the existing getNearbyEvents logic but for clubs only
            const clubsWithDistance = await getClubsWithDistance(userLocation, effectiveCity);
            clubs = clubsWithDistance;
            
            console.log(`✅ Found ${clubs.length} clubs with distance data`);
          } else {
            // Use AI to generate optimal database query for regular search
            console.log('🔍 Using regular club search without distance');
            const aiQuery = await executeAIGeneratedQuery(message, intent, effectiveCity);
            
            clubs = aiQuery.data.map((club: any) => ({
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
          }
          
          // Stream the response word by word
          const fullResponse = await openRouterService.generateClubRecommendations(
            message,
            clubs,
            preferences,
            conversationHistory,
            intent.extractedInfo
          );
          
          // Stream the response word by word
          await streamResponse(fullResponse, res);
          
          response = fullResponse;
          
        } catch (error) {
          console.error('Error in club search:', error);
          // Fallback to existing method
          const clubs = await searchClubsForChatbot(
            intent.query || message,
            effectiveCity
          );
          const fallbackResponse = await openRouterService.generateClubRecommendations(
            message,
            clubs,
            preferences,
            conversationHistory,
            intent.extractedInfo
          );
          
          // Stream fallback response
          const words = fallbackResponse.split(' ');
          for (let i = 0; i < words.length; i++) {
            const word = words[i];
            if (!word) continue;
            
            res.write(`data: ${JSON.stringify({ 
              type: 'token', 
              token: (i > 0 ? ' ' : '') + word,
              isComplete: i === words.length - 1
            })}\n\n`);
            
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          response = fallbackResponse;
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

        // Stream the response word by word
        const eventResponse = await openRouterService.answerEventQuestion(
          message,
          eventDetails,
          { city: effectiveCity, userId, intent, conversationHistory, userLocation }
        );
        
        // Stream the response word by word
        await streamResponse(eventResponse, res);
        
        response = eventResponse;
        break;

      case 'club_question':
        responseType = 4; // Return 4 for club questions
        const clubDetails = await findClubFromQuery(intent, effectiveCity);
        // Stream the response word by word
        const clubResponse = await openRouterService.answerClubQuestion(
          message,
          clubDetails,
          { city: effectiveCity, userId, intent, conversationHistory, userLocation }
        );
        
        // Stream the response word by word
        await streamResponse(clubResponse, res);
        
        response = clubResponse;
        break;

      case 'my_bookings':
        responseType = 7; // Return 7 for my bookings
        
        // Get booking data first to pass to OpenRouter
        let bookingData: any[] = [];
        if (userId) {
          try {
            
            const userData = await User.findById(userId).populate({
              path: "orders",
              populate: [
                { path: "event", model: "Event" },
                { path: "ticket", model: "Ticket" },
                { path: "club", model: "Club" },
              ],
            });
            
            bookingData = (userData?.orders || []).map((booking: any) => ({
              id: booking.event?._id || booking.event,
              name: booking.event?.name || 'Unknown Event',
              venue: booking.club?.name || 'Unknown Venue',
              bookingStatus: booking.status,
              quantity: booking.quantity,
              ticketType: booking.ticket?.name || '',
              ticketPrice: booking.ticket?.price || 0
            }));
          } catch (error) {
            console.error('Error getting booking data:', error);
          }
        }
        
        // Stream the response word by word
        const bookingResponse = await openRouterService.handleMyBookings(
          message,
          conversationHistory,
          { city: effectiveCity, userId, screen, bookings: bookingData }
        );
        
        // Stream the response word by word
        await streamResponse(bookingResponse, res);
        
        response = bookingResponse;
        break;

      case 'booking_status':
        responseType = 8; // Return 8 for booking status
        response = await openRouterService.handleBookingStatus(
          message,
          conversationHistory,
          { city: effectiveCity, userId, screen }
        );
        break;

      case 'booking_details':
        responseType = 9; // Return 9 for booking details
        response = await openRouterService.handleBookingDetails(
          message,
          conversationHistory,
          { city: effectiveCity, userId, screen }
        );
        break;

      case 'club_registration':
        responseType = 10; // Return 10 for club registration
        response = await openRouterService.handleClubRegistration(
          message,
          conversationHistory,
          { city: effectiveCity, userId, screen }
        );
        break;

      case 'policy_query':
        responseType = 11; // Return 11 for policy queries
        const policyResponse = await openRouterService.handlePolicyQuery(
          message,
          conversationHistory,
          { city: effectiveCity, userId, screen }
        );
        await streamResponse(policyResponse, res);
        response = policyResponse;
        break;

      case 'booking_help':
        responseType = 5; // Return 5 for booking help
        const helpResponse = await openRouterService.handleBookingHelp(
          message,
          conversationHistory,
          { city: effectiveCity, userId, screen, hasBookings }
        );
        await streamResponse(helpResponse, res);
        response = helpResponse;
        break;

      case 'directions':
        responseType = 6; // Return 6 for directions
        const directionsResponse = await openRouterService.handleDirections(
          message,
          intent.extractedInfo,
          { city: effectiveCity, userLocation, conversationHistory, screen }
        );
        await streamResponse(directionsResponse, res);
        response = directionsResponse;
        break;

      default:
        console.log('🎯 [DEBUG] Processing default/general conversation intent');
        responseType = 0; // General conversation
        const generalResponse = await openRouterService.handleGeneralConversation(message, conversationHistory, { screen, hasBookings, city: effectiveCity });
        console.log('📝 [DEBUG] General response generated:', generalResponse.substring(0, 100) + '...');
        await streamResponse(generalResponse, res);
        response = generalResponse;
        break;
    }


    // Send final complete event
    res.write(`data: ${JSON.stringify({ 
      type: 'complete', 
      data: {
        response,
        type: responseType,
        intent: intent.type,
        confidence: intent.confidence,
        showCards: intent.showCards || false,
        cardType: intent.cardType || null,
        cards: intent.showCards ? await Promise.race([
          getCardData(intent, effectiveCity, userId),
          new Promise(resolve => setTimeout(() => resolve([]), 5000)) // 5 second timeout for cards
        ]) : null
      }
    })}\n\n`);
    
    res.end();
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

// Helper function to extract events from clubs (avoids code duplication)
const extractEventsFromClubs = (clubs: any[]): any[] => {
  const events: any[] = [];
  clubs.forEach(club => {
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
            distanceFromUser: club.distanceFromUser
          });
        }
      });
    }
  });
  return events;
};

// Helper function to stream response word by word
const streamResponse = async (response: string, res: Response): Promise<void> => {
  const words = response.split(' ');
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (!word) continue;
    
    res.write(`data: ${JSON.stringify({ 
      type: 'token', 
      token: (i > 0 ? ' ' : '') + word,
      isComplete: i === words.length - 1
    })}\n\n`);
    
    await new Promise(resolve => setTimeout(resolve, 100));
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
    console.log('🔍 [QUERY DEBUG] Starting AI query generation');
    console.log('🔍 [QUERY DEBUG] Input parameters:', { userMessage, intent, city });
    console.log('🔍 [QUERY DEBUG] Schema loaded, length:', schema.length);
    
    const queryConfig = await openRouterService.generateDatabaseQuery(userMessage, intent, schema);
    console.log('🔍 [QUERY DEBUG] Generated query config:', queryConfig);
    
    let results = [];
    
    // Execute the query based on model
    switch (queryConfig.model) {
      case 'Club':
        if (queryConfig.populate) {
          // Optimize populate with selective fields for chat responses
          const optimizedPopulate = {
            ...queryConfig.populate,
            select: 'name description date time djArtists tickets guestExperience coverImage status'
          };
          results = await clubModel.find(queryConfig.query)
            .select('name city address phone rating photos typeOfVenue clubDescription operatingDays')
            .populate(optimizedPopulate)
            .limit(10);
        } else {
          results = await clubModel.find(queryConfig.query)
            .select('name city address phone rating photos typeOfVenue clubDescription operatingDays')
            .limit(10);
        }
        break;
        
      case 'Event':
        if (queryConfig.populate) {
          results = await eventModel.find(queryConfig.query)
            .select('name description date time djArtists tickets guestExperience coverImage status')
            .populate(queryConfig.populate)
            .limit(10);
        } else {
          results = await eventModel.find(queryConfig.query)
            .select('name description date time djArtists tickets guestExperience coverImage status')
            .limit(10);
        }
        break;
        
      default:
        // Fallback to club search with optimized fields
        results = await clubModel.find({ 
          city: { $regex: new RegExp(`^${city}$`, 'i') }, 
          isApproved: true 
        })
        .select('name city address phone rating photos typeOfVenue clubDescription operatingDays')
        .limit(10);
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
      })
      .limit(3) // Limit to 3 clubs for faster response
      .populate({
        path: 'events',
        match: { 
          name: { $regex: new RegExp(extractedInfo.eventName, 'i') },
          status: 'active'
        },
        options: { limit: 1 } // Only get first matching event
      });
    }
    
    // Strategy 2: Search by venue name
    if (searchClubs.length === 0 && extractedInfo?.venueName) {
      searchQuery = extractedInfo.venueName;
      searchClubs = await clubModel.find({
        city: { $regex: new RegExp(`^${city}$`, 'i') },
        isApproved: true,
        name: { $regex: new RegExp(extractedInfo.venueName, 'i') }
      })
      .limit(2) // Limit to 2 clubs for faster response
      .populate({
        path: 'events',
        match: { status: 'active' },
        options: { limit: 1 } // Only get first event
      });
    }
    
    // Strategy 3: Search by DJ name
    if (searchClubs.length === 0 && extractedInfo?.djName) {
      searchQuery = extractedInfo.djName;
      searchClubs = await clubModel.find({
        city: { $regex: new RegExp(`^${city}$`, 'i') },
        isApproved: true,
        'events.djArtists': { $regex: new RegExp(extractedInfo.djName, 'i') }
      })
      .limit(2) // Limit to 2 clubs for faster response
      .populate({
        path: 'events',
        match: { 
          djArtists: { $regex: new RegExp(extractedInfo.djName, 'i') },
          status: 'active'
        },
        options: { limit: 1 } // Only get first matching event
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
    })
    .select('name city address phone rating photos typeOfVenue clubDescription operatingDays')
    .populate({
      path: 'events',
      select: 'name description date time djArtists tickets guestExperience coverImage status',
      match: { 
        status: 'active',
        date: { $gte: currentDate } // Only upcoming events
      },
      options: { 
        sort: { isFeatured: -1, date: 1 }, 
        limit: 10 
      }
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
async function getCardData(intent: any, city: string, userId?: string): Promise<any[]> {
  try {
    const { type, cardType } = intent;
    
    if (type === 'my_bookings') {
      // Get user's bookings as event cards
      if (!userId) {
        return [];
      }
      
      try {
        // Import the User model and use the same logic as getBookings
        
        
        // Build the query based on user intent - filter by status if requested
        let statusFilter = {};
        
        // Check if user is asking for specific status
        if (intent?.query?.toLowerCase().includes('paid') || intent?.query?.toLowerCase().includes('ready')) {
          statusFilter = { status: 'paid' };
        } else if (intent?.query?.toLowerCase().includes('scanned') || intent?.query?.toLowerCase().includes('used')) {
          statusFilter = { status: 'scanned' };
        }
        
        const userQuery = User.findById(userId).populate({
          path: "orders",
          match: Object.keys(statusFilter).length > 0 ? statusFilter : undefined,
          populate: [
            { path: "event", model: "Event" },
            { path: "ticket", model: "Ticket" },
            { path: "club", model: "Club" },
          ],
        });

        const userData = await userQuery;
        const userBookings = userData?.orders || [];

        // Transform results to event cards format
        const bookingEvents = userBookings.map((booking: any, index: number) => {
          
          return {
            id: booking.event?._id || booking.event,
            name: booking.event?.name || 'Unknown Event',
            description: booking.event?.description || '',
            date: booking.event?.date || '',
            time: booking.event?.time || '',
            venue: booking.club?.name || 'Unknown Venue',
            city: booking.club?.city || city,
            djArtists: booking.event?.djArtists || '',
            tickets: booking.event?.tickets || [],
            guestExperience: booking.event?.guestExperience || {},
            coverImage: booking.event?.coverImage || '',
            isFeatured: booking.event?.isFeatured || false,
            bookingId: booking._id,
            bookingStatus: booking.status,
            quantity: booking.quantity,
            ticketType: booking.ticket?.name || '',
            ticketPrice: booking.ticket?.price || 0,
            transactionId: booking.transactionId,
            isPaid: booking.isPaid,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt
          };
        });

        return bookingEvents;
      } catch (error: any) {
        console.error('Error in booking fetch process:', error);
        return [];
      }
    }
    
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

      return events.slice(0, 4); // Limit to 4 events for faster response
    }
    
    if (type === 'my_bookings') {
      // Use the existing getBookings function from userController
      console.log('🎫 [BOOKINGS DEBUG] Starting booking fetch process');
      console.log('🎫 [BOOKINGS DEBUG] Parameters:', { userId, type, cardType, city });
      
      if (!userId) {
        console.log('❌ [BOOKINGS DEBUG] No userId provided for my_bookings');
        return [];
      }
      
      try {
        // Build the query to get all orders (no status filter for chatbot)
        const userQuery = User.findById(userId).populate({
          path: "orders",
          populate: [
            { path: "event", model: "Event" },
            { path: "ticket", model: "Ticket" },
            { path: "club", model: "Club" },
          ],
        });
        console.log('🎫 [BOOKINGS DEBUG] Query built successfully');

        console.log('🎫 [BOOKINGS DEBUG] Step 3: Executing query...');
        const userData = await userQuery;
        console.log('🎫 [BOOKINGS DEBUG] Query executed. User data:', {
          userExists: !!userData,
          userId: userData?._id,
          ordersCount: userData?.orders?.length || 0
        });
        
        const userBookings = userData?.orders || [];
        console.log('🎫 [BOOKINGS DEBUG] Step 4: Processing bookings:', userBookings.length);

        if (userBookings.length > 0) {
          console.log('🎫 [BOOKINGS DEBUG] Sample booking structure:', JSON.stringify(userBookings[0], null, 2));
        } else {
          console.log('🎫 [BOOKINGS DEBUG] No bookings found for user');
        }

        console.log('🎫 [BOOKINGS DEBUG] Step 5: Transforming to event cards format');
        // Transform results to event cards format
        const bookingEvents = userBookings.map((booking: any, index: number) => {
          console.log(`🎫 [BOOKINGS DEBUG] Processing booking ${index + 1}:`, {
            bookingId: booking._id,
            hasEvent: !!booking.event,
            hasClub: !!booking.club,
            hasTicket: !!booking.ticket,
            eventName: booking.event?.name || 'No event name',
            clubName: booking.club?.name || 'No club name',
            ticketName: booking.ticket?.name || 'No ticket name'
          });
          
          return {
            id: booking.event?._id || booking.event,
            name: booking.event?.name || 'Unknown Event',
            description: booking.event?.description || '',
            date: booking.event?.date || '',
            time: booking.event?.time || '',
            venue: booking.club?.name || 'Unknown Venue',
            city: booking.club?.city || city,
            djArtists: booking.event?.djArtists || '',
            tickets: booking.event?.tickets || [],
            guestExperience: booking.event?.guestExperience || {},
            coverImage: booking.event?.coverImage || '',
            isFeatured: booking.event?.isFeatured || false,
            bookingId: booking._id,
            bookingStatus: booking.status,
            quantity: booking.quantity,
            ticketType: booking.ticket?.name || '',
            ticketPrice: booking.ticket?.price || 0,
            transactionId: booking.transactionId,
            isPaid: booking.isPaid,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt
          };
        });

        console.log('🎫 [BOOKINGS DEBUG] Step 6: Final result:', {
          totalEvents: bookingEvents.length,
          sampleEvent: bookingEvents[0] ? {
            id: bookingEvents[0].id,
            name: bookingEvents[0].name,
            venue: bookingEvents[0].venue,
            bookingId: bookingEvents[0].bookingId
          } : 'No events'
        });

        return bookingEvents;
      } catch (error: any) {
        console.error('🎫 [BOOKINGS DEBUG] Error in booking fetch process:', error);
        console.error('🎫 [BOOKINGS DEBUG] Error stack:', error.stack);
        return [];
      }
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

      return clubs.slice(0, 4); // Limit to 4 clubs for faster response
    }

    return [];
  } catch (error) {
    console.error('Error getting card data:', error);
    return [];
  }
}

// Helper function to get clubs with distance calculation (similar to getNearbyEvents)
const getClubsWithDistance = async (
  userLocation: { latitude: number; longitude: number }, 
  city: string
): Promise<any[]> => {
  try {
    const query: any = { events: { $exists: true, $not: { $size: 0 } } };
    if (city) {
      query.city = { $regex: new RegExp(`^${city}$`, "i") };
    }
    
    const clubs = await clubModel.find(query)
      .select('name city address phone rating photos typeOfVenue clubDescription operatingDays mapLink')
      .limit(10)
      .populate({
        path: "events",
        select: 'name description date time djArtists tickets guestExperience coverImage status',
        match: { status: "active" },
        options: { limit: 5 }
      });

    // Calculate distances for all clubs in parallel
    const distancePromises = clubs.map(async (club) => {
      // If club has no map link, return with N/A distance
      if (!club.mapLink) {
        return {
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
          distanceFromUser: {
            text: "N/A",
            value: Number.MAX_VALUE,
            km: Number.MAX_VALUE
          }
        };
      }

      try {
        const distanceResult = await calculateDistanceFromMapsLink(
          userLocation.latitude,
          userLocation.longitude,
          club.mapLink,
          process.env.GOOGLE_MAPS_API_KEY || "",
          "driving",
          true // use fallback
        );

        // Check if it's a Google Maps result or Haversine fallback
        if ('duration' in distanceResult.distance) {
          // Google Maps API result
          return {
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
            distanceFromUser: {
              text: distanceResult.distance.distance.text,
              value: distanceResult.distance.distance.value,
              km: Math.round((distanceResult.distance.distance.value / 1000) * 100) / 100
            }
          };
        } else {
          // Haversine fallback result
          return {
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
            distanceFromUser: {
              text: distanceResult.distance.distance.text,
              value: distanceResult.distance.distance.value,
              km: Math.round((distanceResult.distance.distance.value / 1000) * 100) / 100
            }
          };
        }
      } catch (error) {
        console.warn(`⚠️ Failed to calculate distance for club "${club.name}":`, error);
        // Return with N/A distance
        return {
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
          distanceFromUser: {
            text: "N/A",
            value: Number.MAX_VALUE,
            km: Number.MAX_VALUE
          }
        };
      }
    });

    // Wait for all distance calculations to complete
    const results = await Promise.all(distancePromises);
    
    // Sort by distance (closest first)
    results.sort((a, b) => a.distanceFromUser.value - b.distanceFromUser.value);
    
    console.log(`📊 Distance calculation results: ${results.filter(r => r.distanceFromUser.text !== "N/A").length} clubs with distance, ${results.filter(r => r.distanceFromUser.text === "N/A").length} clubs with N/A distance`);
    
    return results;
  } catch (error) {
    console.error('Error in getClubsWithDistance:', error);
    return [];
  }
};


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


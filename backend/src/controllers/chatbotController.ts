import type { Request, Response } from 'express';
import openRouterService from '../utils/openRouterService';
import eventModel from '../models/eventModel';
import clubModel from '../models/clubModel';
import { getSchemaForAI } from '../utils/databaseSchema';
import { getContextualSuggestions, type ScreenType } from '../constants/chatbotSuggestions';
import User from '../models/userModel';
import { calculateDistanceFromMapsLink } from '../utils/mapsDistanceCalculator';

// Import refactored utility functions
import { executeAIGeneratedQuery, extractEventsFromClubs } from '../utils/chatbotDatabaseUtils';
import { 
  searchEventsForChatbot, 
  searchClubsForChatbot, 
  findEventFromQuery, 
  findClubFromQuery, 
  getEventDetails,
  getClubsWithDistance 
} from '../utils/chatbotSearchUtils';
import { 
  getCardData, 
  streamResponse, 
  generateResponse 
} from '../utils/chatbotResponseUtils';

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
        let eventsData: any[] = []; // Store events data for cards
        let clubsData: any[] = []; // Store clubs data for cards
        
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
                    guestExperience: event.guestExperience,
                    coverImage: event.coverImage,
                    isFeatured: event.isFeatured
                  }));
                }
              }
              
              // Store events data for cards
              eventsData = events;
              
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
            
          case 'find_clubs':
          case 'filter_clubs':
            console.log('🎯 [DEBUG] Processing find_clubs intent');
            responseType = 3;
            
            try {
              let clubs: any[] = [];
              
              if (userLocation && intent.extractedInfo?.nearMe) {
                console.log('🗺️ [DEBUG] Using distance-based club search');
                const clubsWithDistance = await getClubsWithDistance(userLocation, effectiveCity);
                clubs = clubsWithDistance;
                console.log(`✅ [DEBUG] Found ${clubs.length} clubs with distance data`);
              } else {
                console.log('🔍 [DEBUG] Using regular club search');
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
                  eventsCount: club.events?.length || 0,
                  coverImage: club.photos?.[0]
                }));
              }
              
              // Store clubs data for cards
              clubsData = clubs;
              
              console.log('🤖 [DEBUG] Generating club recommendations...');
              const fullResponse = await openRouterService.generateClubRecommendations(
                message,
                clubs,
                preferences,
                conversationHistory,
                intent.extractedInfo
              );
              
              console.log('📝 [DEBUG] Club response generated:', fullResponse.substring(0, 100) + '...');
              await streamResponse(fullResponse, res);
              response = fullResponse;
              
            } catch (error) {
              console.error('❌ [DEBUG] Error in club search:', error);
              const fallbackClubs = await searchClubsForChatbot(
                intent.query || message,
                effectiveCity
              );
              const fallbackResponse = await openRouterService.generateClubRecommendations(
                message,
                fallbackClubs,
                preferences,
                conversationHistory,
                intent.extractedInfo
              );
              console.log('📝 [DEBUG] Fallback club response generated:', fallbackResponse.substring(0, 100) + '...');
              await streamResponse(fallbackResponse, res);
              response = fallbackResponse;
            }
            break;
            
          case 'event_question':
            console.log('🎯 [DEBUG] Processing event_question intent');
            responseType = 1;
            let eventDetails = null;
            
            if (eventId) {
              console.log('🔍 [DEBUG] Getting event details by ID:', eventId);
              eventDetails = await getEventDetails(eventId);
            } else {
              console.log('🔍 [DEBUG] Finding event from query...');
              eventDetails = await findEventFromQuery(intent, effectiveCity);
            }
            
            const eventResponse = await openRouterService.answerEventQuestion(
              message,
              eventDetails,
              { city: effectiveCity, userId, intent, conversationHistory, userLocation }
            );
            await streamResponse(eventResponse, res);
            response = eventResponse;
            break;
            
          case 'club_question':
            console.log('🎯 [DEBUG] Processing club_question intent');
            responseType = 4;
            const clubDetails = await findClubFromQuery(intent, effectiveCity);
            const clubResponse = await openRouterService.answerClubQuestion(
              message,
              clubDetails,
              { city: effectiveCity, userId, intent, conversationHistory, userLocation }
            );
            await streamResponse(clubResponse, res);
            response = clubResponse;
            break;
            
          case 'my_bookings':
            console.log('🎯 [DEBUG] Processing my_bookings intent');
            responseType = 7;
            let bookingData: any[] = [];
            if (userId) {
              try {
                console.log('🎫 [DEBUG] Fetching user bookings for userId:', userId);
                const userData = await User.findById(userId).populate({
                  path: "orders",
                  populate: [
                    { path: "event", model: "Event" },
                    { path: "ticket", model: "Ticket" },
                    { path: "club", model: "Club" },
                  ],
                });
                
                console.log('🎫 [DEBUG] User data found:', {
                  userExists: !!userData,
                  ordersCount: userData?.orders?.length || 0
                });
                
                // Filter for only paid bookings (not yet scanned)
                const paidBookings = (userData?.orders || []).filter((booking: any) => booking.status === 'paid');
                console.log('🎫 [DEBUG] Filtered paid bookings:', {
                  totalOrders: userData?.orders?.length || 0,
                  paidBookings: paidBookings.length
                });
                
                bookingData = paidBookings.map((booking: any) => ({
                  id: booking.event?._id || booking.event,
                  name: booking.event?.name || 'Unknown Event',
                  description: booking.event?.description || '',
                  date: booking.event?.date || '',
                  time: booking.event?.time || '',
                  venue: booking.club?.name || 'Unknown Venue',
                  city: booking.club?.city || effectiveCity,
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
                }));
                
                console.log('🎫 [DEBUG] Processed paid booking data:', {
                  paidBookingCount: bookingData.length,
                  sampleBooking: bookingData[0] ? {
                    name: bookingData[0].name,
                    venue: bookingData[0].venue,
                    status: bookingData[0].bookingStatus
                  } : 'No paid bookings'
                });
                
                // Store booking data for cards
                eventsData = bookingData;
                
              } catch (error) {
                console.error('❌ [DEBUG] Error getting booking data:', error);
              }
            }
            
            const bookingsResponse = await openRouterService.handleMyBookings(
              message,
              conversationHistory,
              { city: effectiveCity, userId, screen, bookings: bookingData }
            );
            await streamResponse(bookingsResponse, res);
            response = bookingsResponse;
            break;
            
          case 'booking_status':
            console.log('🎯 [DEBUG] Processing booking_status intent');
            responseType = 8;
            const statusResponse = await openRouterService.handleBookingStatus(
              message,
              conversationHistory,
              { city: effectiveCity, userId, screen }
            );
            await streamResponse(statusResponse, res);
            response = statusResponse;
            break;
            
          case 'booking_details':
            console.log('🎯 [DEBUG] Processing booking_details intent');
            responseType = 9;
            const detailsResponse = await openRouterService.handleBookingDetails(
              message,
              conversationHistory,
              { city: effectiveCity, userId, screen }
            );
            await streamResponse(detailsResponse, res);
            response = detailsResponse;
            break;
            
          case 'club_registration':
            console.log('🎯 [DEBUG] Processing club_registration intent');
            responseType = 10;
            const registrationResponse = await openRouterService.handleClubRegistration(
              message,
              conversationHistory,
              { city: effectiveCity, userId, screen }
            );
            await streamResponse(registrationResponse, res);
            response = registrationResponse;
            break;
            
          case 'policy_query':
            console.log('🎯 [DEBUG] Processing policy_query intent');
            responseType = 11;
            const policyResponse = await openRouterService.handlePolicyQuery(
              message,
              conversationHistory,
              { city: effectiveCity, userId, screen }
            );
            await streamResponse(policyResponse, res);
            response = policyResponse;
            break;
            
          case 'booking_help':
            console.log('🎯 [DEBUG] Processing booking_help intent');
            responseType = 5;
            const helpResponse = await openRouterService.handleBookingHelp(
              message,
              conversationHistory,
              { city: effectiveCity, userId, screen, hasBookings }
            );
            await streamResponse(helpResponse, res);
            response = helpResponse;
            break;
            
          case 'directions':
            console.log('🎯 [DEBUG] Processing directions intent');
            responseType = 6;
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
            responseType = 0;
            const generalResponse = await openRouterService.handleGeneralConversation(message, conversationHistory, { screen, hasBookings, city: effectiveCity });
            console.log('📝 [DEBUG] General response generated:', generalResponse.substring(0, 100) + '...');
            await streamResponse(generalResponse, res);
            response = generalResponse;
            break;
        }
        
        // Send final complete event
        console.log('🚀 [DEBUG] Sending final complete event...');
        console.log('🎯 [DEBUG] Intent data for complete event:', {
          intentType: intent.type,
          showCards: intent.showCards,
          cardType: intent.cardType,
          confidence: intent.confidence
        });
        
        // Get actual data for cards
        let cardData = null;
        if (intent.showCards) {
          if (intent.type === 'find_events') {
            console.log('🎯 [DEBUG] Using stored events data for cards:', eventsData.length);
            
            cardData = [{
              type: 'events',
              title: 'Upcoming Events',
              data: eventsData.slice(0, 4) // Limit to 4 events
            }];
          } else if (intent.type === 'find_clubs') {
            console.log('🎯 [DEBUG] Using stored clubs data for cards:', clubsData.length);
            
            cardData = [{
              type: 'clubs',
              title: 'Popular Clubs',
              data: clubsData.slice(0, 4) // Limit to 4 clubs
            }];
          } else if (intent.type === 'my_bookings') {
            console.log('🎯 [DEBUG] Using stored booking data for cards:', eventsData.length);
            
            cardData = [{
              type: 'mixed',
              title: 'Your Bookings',
              data: eventsData.slice(0, 4) // Limit to 4 bookings
            }];
          }
        }
        
        console.log('🎯 [DEBUG] Generated card data for streaming:', JSON.stringify(cardData, null, 2));
        
        res.write(`data: ${JSON.stringify({ 
          type: 'complete', 
          data: {
            response,
            type: responseType,
            intent: intent.type,
            confidence: intent.confidence,
            showCards: intent.showCards || false,
            cardType: intent.cardType || null,
            cards: cardData
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
    console.log('🎯 [DEBUG] Sending complete event with intent:', {
      intentType: intent.type,
      showCards: intent.showCards,
      cardType: intent.cardType,
      confidence: intent.confidence
    });
    
    console.log('🎯 [DEBUG] Full intent object:', JSON.stringify(intent, null, 2));
    
    const cardData = intent.showCards ? [{
      type: intent.cardType || 'event',
      title: intent.cardType === 'events' ? 'Upcoming Events' : 
             intent.cardType === 'clubs' ? 'Popular Clubs' : 
             intent.cardType === 'mixed' ? 'Your Bookings' : 'Results',
      data: [] // Will be populated by the frontend
    }] : null;
    
    console.log('🎯 [DEBUG] Generated card data:', JSON.stringify(cardData, null, 2));
    
    const completeEvent = {
      type: 'complete', 
      data: {
        response,
        type: responseType,
        intent: intent.type,
        confidence: intent.confidence,
        showCards: intent.showCards || false,
        cardType: intent.cardType || null,
        cards: cardData
      }
    };
    
    console.log('🎯 [DEBUG] Final complete event:', JSON.stringify(completeEvent, null, 2));
    
    res.write(`data: ${JSON.stringify(completeEvent)}\n\n`);
    
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
    
    // Return suggestions immediately without heavy database queries
    res.json({
      success: true,
      data: {
        suggestions: contextualSuggestions.map(s => s.text),
        popularEvents: [], // Simplified - no heavy queries
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

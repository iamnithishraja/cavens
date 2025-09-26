import type { Request, Response } from 'express';
import openRouterService from '../utils/openRouterService';
import { getContextualSuggestions, type ScreenType } from '../constants/chatbotSuggestions';
import User from '../models/userModel';


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

// Simple helper to detect if this is a follow-up question
function isFollowUpQuestion(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  const followUpIndicators = [
    'this event', 'that event', 'it', 'this', 'that',
    'give me more details', 'tell me more', 'what time', 'how much',
    'where is', 'directions', 'more about', 'explain'
  ];
  
  console.log('🔍 [FOLLOW-UP DEBUG] Checking message:', message);
  console.log('🔍 [FOLLOW-UP DEBUG] Lower message:', lowerMessage);
  
  const matches = followUpIndicators.filter(indicator => lowerMessage.includes(indicator));
  console.log('🔍 [FOLLOW-UP DEBUG] Matching indicators:', matches);
  
  const isFollowUp = matches.length > 0;
  console.log('🔍 [FOLLOW-UP DEBUG] Is follow-up:', isFollowUp);
  
  return isFollowUp;
}

export const chatWithBot = async (req: ChatbotRequest, res: Response) => {
  const startTime = Date.now();
  const timings: { [key: string]: number } = {};

  try {
    const { message, eventId, city = 'Dubai', userLocation, preferences, conversationHistory = [], screen = 'GENERAL', hasBookings = false, stream = false } = req.body;
    
    // Get userId from authenticated user
    const userId = req.user?.id;
    
    timings.requestStart = Date.now() - startTime;
    
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
        // Send immediate "thinking" response
        res.write(`data: ${JSON.stringify({ 
          type: 'thinking', 
          message: 'I\'m thinking...' 
        })}\n\n`);
        
        // Start intent analysis
        const intentStartTime = Date.now();
        const intent = await openRouterService.analyzeIntent(message, conversationHistory);
        timings.intentAnalysis = Date.now() - intentStartTime;
        
        // Process based on intent type
    let response: string;
    let responseType: number;
        let eventsData: any[] = []; // Store events data for cards
        let clubsData: any[] = []; // Store clubs data for cards

    // Determine user's actual location
    let effectiveCity = cityString;
    
    // Handle "near me" queries - just use their current city setting
    if (intent.extractedInfo?.nearMe || intent.extractedInfo?.location === 'current') {
    } else if (intent.extractedInfo?.location && intent.extractedInfo.location !== 'current') {
      // User specified a different city
      effectiveCity = intent.extractedInfo.location;
    }


    switch (intent.type) {
      case 'find_events':
      case 'filter_events':
            responseType = 2;
        
        try {
          let events: any[] = [];
          
          if (userLocation && intent.extractedInfo?.nearMe) {
            const distanceStartTime = Date.now();
            const clubsWithDistance = await getClubsWithDistance(userLocation, effectiveCity);
            timings.distanceCalculation = Date.now() - distanceStartTime;
            
            const extractStartTime = Date.now();
            events = extractEventsFromClubs(clubsWithDistance);
            timings.eventExtraction = Date.now() - extractStartTime;
          } else {
            const aiQueryStartTime = Date.now();
            const aiQuery = await executeAIGeneratedQuery(message, intent, effectiveCity);
            timings.aiQuery = Date.now() - aiQueryStartTime;
            
            const processStartTime = Date.now();
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
            timings.dataProcessing = Date.now() - processStartTime;
          }
          
          // Store events data for cards
          eventsData = events;
          
          const aiResponseStartTime = Date.now();
          const fullResponse = await openRouterService.generateEventRecommendations(
            message,
            events,
            preferences,
            conversationHistory,
            intent.extractedInfo
          );
          timings.aiResponse = Date.now() - aiResponseStartTime;
          
          const streamStartTime = Date.now();
          await streamResponse(fullResponse, res);
          timings.streaming = Date.now() - streamStartTime;
          response = fullResponse;
          
        } catch (error) {
          console.error('Error in event search:', error);
          const fallbackStartTime = Date.now();
          const fallbackEvents = await searchEventsForChatbot(
            intent.query || message, 
            effectiveCity
          );
          timings.fallbackSearch = Date.now() - fallbackStartTime;
          
          const fallbackAiStartTime = Date.now();
          const fallbackResponse = await openRouterService.generateEventRecommendations(
            message,
            fallbackEvents,
            preferences,
            conversationHistory,
            intent.extractedInfo
          );
          timings.fallbackAi = Date.now() - fallbackAiStartTime;
          
          const fallbackStreamStartTime = Date.now();
          await streamResponse(fallbackResponse, res);
          timings.fallbackStreaming = Date.now() - fallbackStreamStartTime;
          response = fallbackResponse;
        }
        break;

      case 'find_clubs':
      case 'filter_clubs':
            responseType = 3;
        
        try {
          let clubs: any[] = [];
          
          if (userLocation && intent.extractedInfo?.nearMe) {
                const distanceStartTime = Date.now();
            const clubsWithDistance = await getClubsWithDistance(userLocation, effectiveCity);
                timings.distanceCalculation = Date.now() - distanceStartTime;
            clubs = clubsWithDistance;
          } else {
                const aiQueryStartTime = Date.now();
            const aiQuery = await executeAIGeneratedQuery(message, intent, effectiveCity);
                timings.aiQuery = Date.now() - aiQueryStartTime;
            
                const processStartTime = Date.now();
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
                timings.dataProcessing = Date.now() - processStartTime;
              }
              
              // Store clubs data for cards
              clubsData = clubs;
              
              const aiResponseStartTime = Date.now();
              const fullResponse = await openRouterService.generateClubRecommendations(
            message,
            clubs,
            preferences,
            conversationHistory,
            intent.extractedInfo
          );
              timings.aiResponse = Date.now() - aiResponseStartTime;
              
              const streamStartTime = Date.now();
              await streamResponse(fullResponse, res);
              timings.streaming = Date.now() - streamStartTime;
              response = fullResponse;
          
        } catch (error) {
          console.error('Error in club search:', error);
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
              await streamResponse(fallbackResponse, res);
              response = fallbackResponse;
        }
        break;

      case 'event_question':
        responseType = 1;
        let eventDetails = null;
        
        console.log('🎯 [EVENT QUESTION] Starting event question processing');
        console.log('🎯 [EVENT QUESTION] Message:', message);
        console.log('🎯 [EVENT QUESTION] EventId:', eventId);
        console.log('🎯 [EVENT QUESTION] Intent:', intent);
        console.log('🎯 [EVENT QUESTION] Conversation history length:', conversationHistory.length);
        
        // Check if this is a follow-up question
        const isFollowUp = isFollowUpQuestion(message);
        console.log('🎯 [EVENT QUESTION] Is follow-up:', isFollowUp);
        
        if (eventId) {
          console.log('🔍 [EVENT QUESTION] Getting event details by ID:', eventId);
          eventDetails = await getEventDetails(eventId);
          console.log('🔍 [EVENT QUESTION] Event details found by ID:', eventDetails ? 'YES' : 'NO');
        } else if (!isFollowUp) {
          console.log('🔍 [EVENT QUESTION] Not a follow-up, searching for specific event');
          eventDetails = await findEventFromQuery(intent, effectiveCity);
          console.log('🔍 [EVENT QUESTION] Event details found by query:', eventDetails ? 'YES' : 'NO');
        } else {
          console.log('🔍 [EVENT QUESTION] Follow-up question detected, looking for event in conversation history');
          // For follow-up questions, try to extract event info from conversation history
          for (let i = conversationHistory.length - 1; i >= 0; i--) {
            const msg = conversationHistory[i];
            if (msg.role === 'assistant' && msg.content && msg.content.includes('Check out')) {
              console.log('🔍 [EVENT QUESTION] Found event mention in conversation:', msg.content);
              // Try to extract event details from the conversation
              const eventMatch = msg.content.match(/Check out "(.+?)" at (.+?) in/);
              if (eventMatch) {
                const eventName = eventMatch[1];
                const venueName = eventMatch[2];
                console.log('🔍 [EVENT QUESTION] Extracted from conversation - Event:', eventName, 'Venue:', venueName);
                
                // Try to find this specific event
                const specificEvents = await searchEventsForChatbot(eventName, effectiveCity);
                if (specificEvents.length > 0) {
                  eventDetails = specificEvents[0];
                  console.log('🔍 [EVENT QUESTION] Found event from conversation history:', eventDetails.name);
                }
              }
              break;
            }
          }
        }

        console.log('📋 [EVENT QUESTION] Final event details:', eventDetails ? {
          name: eventDetails.name,
          venue: eventDetails.venue,
          date: eventDetails.date
        } : 'NONE');

        // For follow-up questions, let AI handle the context from conversation history
        console.log('🤖 [EVENT QUESTION] Calling AI with context:', {
          isFollowUp,
          hasEventDetails: !!eventDetails,
          conversationHistoryLength: conversationHistory.length
        });
        
        const eventResponse = await openRouterService.answerEventQuestion(
          message,
          eventDetails,
          { 
            city: effectiveCity, 
            userId, 
            intent, 
            conversationHistory, 
            userLocation,
            isFollowUp
          }
        );
        
        console.log('🤖 [EVENT QUESTION] AI response length:', eventResponse.length);
        console.log('🤖 [EVENT QUESTION] AI response preview:', eventResponse.substring(0, 100) + '...');
        
        await streamResponse(eventResponse, res);
        response = eventResponse;
        break;

      case 'club_question':
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
            responseType = 7;
        let bookingData: any[] = [];
        if (userId) {
          try {
                const bookingStartTime = Date.now();
            const userData = await User.findById(userId).populate({
              path: "orders",
              populate: [
                { path: "event", model: "Event" },
                { path: "ticket", model: "Ticket" },
                { path: "club", model: "Club" },
              ],
            });
                timings.bookingFetch = Date.now() - bookingStartTime;
            
                // Filter for only paid bookings (not yet scanned)
                const paidBookings = (userData?.orders || []).filter((booking: any) => booking.status === 'paid');
                
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
                
                // Store booking data for cards
                eventsData = bookingData;
                
          } catch (error) {
            console.error('Error getting booking data:', error);
          }
        }
        
            const aiStartTime = Date.now();
            const bookingsResponse = await openRouterService.handleMyBookings(
          message,
          conversationHistory,
          { city: effectiveCity, userId, screen, bookings: bookingData }
        );
            timings.aiResponse = Date.now() - aiStartTime;
            
            const streamStartTime = Date.now();
            await streamResponse(bookingsResponse, res);
            timings.streaming = Date.now() - streamStartTime;
            response = bookingsResponse;
        break;

      case 'booking_status':
            responseType = 8;
            const statusStartTime = Date.now();
            const statusResponse = await openRouterService.handleBookingStatus(
          message,
          conversationHistory,
          { city: effectiveCity, userId, screen }
        );
            timings.aiResponse = Date.now() - statusStartTime;
            
            const statusStreamStartTime = Date.now();
            await streamResponse(statusResponse, res);
            timings.streaming = Date.now() - statusStreamStartTime;
            response = statusResponse;
        break;

      case 'booking_details':
            responseType = 9;
            const detailsStartTime = Date.now();
            const detailsResponse = await openRouterService.handleBookingDetails(
          message,
          conversationHistory,
          { city: effectiveCity, userId, screen }
        );
            timings.aiResponse = Date.now() - detailsStartTime;
            
            const detailsStreamStartTime = Date.now();
            await streamResponse(detailsResponse, res);
            timings.streaming = Date.now() - detailsStreamStartTime;
            response = detailsResponse;
        break;

      case 'club_registration':
            responseType = 10;
            const registrationStartTime = Date.now();
            const registrationResponse = await openRouterService.handleClubRegistration(
          message,
          conversationHistory,
          { city: effectiveCity, userId, screen }
        );
            timings.aiResponse = Date.now() - registrationStartTime;
            
            const registrationStreamStartTime = Date.now();
            await streamResponse(registrationResponse, res);
            timings.streaming = Date.now() - registrationStreamStartTime;
            response = registrationResponse;
        break;

      case 'policy_query':
            responseType = 11;
            const policyStartTime = Date.now();
            const policyResponse = await openRouterService.handlePolicyQuery(
          message,
          conversationHistory,
          { city: effectiveCity, userId, screen }
        );
            timings.aiResponse = Date.now() - policyStartTime;
            
            const policyStreamStartTime = Date.now();
            await streamResponse(policyResponse, res);
            timings.streaming = Date.now() - policyStreamStartTime;
            response = policyResponse;
        break;

      case 'booking_help':
            responseType = 5;
            const helpStartTime = Date.now();
            const helpResponse = await openRouterService.handleBookingHelp(
          message,
          conversationHistory,
          { city: effectiveCity, userId, screen, hasBookings }
        );
            timings.aiResponse = Date.now() - helpStartTime;
            
            const helpStreamStartTime = Date.now();
            await streamResponse(helpResponse, res);
            timings.streaming = Date.now() - helpStreamStartTime;
            response = helpResponse;
        break;

      case 'directions':
            responseType = 6;
            const directionsStartTime = Date.now();
            const directionsResponse = await openRouterService.handleDirections(
          message,
          intent.extractedInfo,
          { city: effectiveCity, userLocation, conversationHistory, screen }
        );
            timings.aiResponse = Date.now() - directionsStartTime;
            
            const directionsStreamStartTime = Date.now();
            await streamResponse(directionsResponse, res);
            timings.streaming = Date.now() - directionsStreamStartTime;
            response = directionsResponse;
        break;

      default:
            responseType = 0;
            const generalStartTime = Date.now();
            const generalResponse = await openRouterService.handleGeneralConversation(message, conversationHistory, { screen, hasBookings, city: effectiveCity });
            timings.aiResponse = Date.now() - generalStartTime;
            
            const generalStreamStartTime = Date.now();
            await streamResponse(generalResponse, res);
            timings.streaming = Date.now() - generalStreamStartTime;
            response = generalResponse;
        break;
    }

        // Get actual data for cards
        const cardStartTime = Date.now();
        let cardData = null;
        if (intent.showCards) {
          if (intent.type === 'find_events') {
            cardData = [{
              type: 'events',
              title: 'Upcoming Events',
              data: eventsData.slice(0, 4) // Limit to 4 events
            }];
          } else if (intent.type === 'find_clubs') {
            cardData = [{
              type: 'clubs',
              title: 'Popular Clubs',
              data: clubsData.slice(0, 4) // Limit to 4 clubs
            }];
          } else if (intent.type === 'my_bookings') {
            cardData = [{
              type: 'mixed',
              title: 'Your Bookings',
              data: eventsData.slice(0, 4) // Limit to 4 bookings
            }];
          }
        }
        timings.cardGeneration = Date.now() - cardStartTime;
        
        const finalResponseStartTime = Date.now();
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
        timings.finalResponse = Date.now() - finalResponseStartTime;

        const cleanupStartTime = Date.now();
        clearInterval(heartbeatInterval);
        res.end();
        timings.cleanup = Date.now() - cleanupStartTime;
        
        // Performance report
        timings.totalTime = Date.now() - startTime;
        
        // Calculate unaccounted time
        const accountedTime = (timings.requestStart || 0) + 
                            (timings.intentAnalysis || 0) + 
                            (timings.bookingFetch || 0) + 
                            (timings.aiQuery || 0) + 
                            (timings.distanceCalculation || 0) + 
                            (timings.eventExtraction || 0) + 
                            (timings.dataProcessing || 0) + 
                            (timings.aiResponse || 0) + 
                            (timings.streaming || 0) + 
                            (timings.cardGeneration || 0) + 
                            (timings.finalResponse || 0) + 
                            (timings.cleanup || 0) + 
                            (timings.fallbackSearch || 0) + 
                            (timings.fallbackAi || 0) + 
                            (timings.fallbackStreaming || 0);
        
        timings.unaccountedTime = timings.totalTime - accountedTime;
        
        console.log('⚡ [PERFORMANCE] Detailed Chatbot Response Times:', {
          '📊 TOTAL TIME': `${timings.totalTime}ms`,
          '🔍 Intent Analysis': `${timings.intentAnalysis || 0}ms`,
          '💾 Booking Fetch': `${timings.bookingFetch || 0}ms`,
          '🤖 AI Query': `${timings.aiQuery || 0}ms`,
          '🗺️ Distance Calculation': `${timings.distanceCalculation || 0}ms`,
          '📋 Event Extraction': `${timings.eventExtraction || 0}ms`,
          '⚙️ Data Processing': `${timings.dataProcessing || 0}ms`,
          '🧠 AI Response': `${timings.aiResponse || 0}ms`,
          '📡 Streaming': `${timings.streaming || 0}ms`,
          '🎴 Card Generation': `${timings.cardGeneration || 0}ms`,
          '📤 Final Response': `${timings.finalResponse || 0}ms`,
          '🧹 Cleanup': `${timings.cleanup || 0}ms`,
          '🔄 Fallback Search': `${timings.fallbackSearch || 0}ms`,
          '🔄 Fallback AI': `${timings.fallbackAi || 0}ms`,
          '🔄 Fallback Streaming': `${timings.fallbackStreaming || 0}ms`,
          '❓ Unaccounted Time': `${timings.unaccountedTime}ms`,
          '🎯 Intent': intent.type,
          '🎴 Has Cards': !!cardData
        });
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
        console.log('this is what i am worried');
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
          console.log('this is what i have rn');
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
        
        console.log('🎯 [EVENT QUESTION NON-STREAMING] Starting event question processing');
        console.log('🎯 [EVENT QUESTION NON-STREAMING] Message:', message);
        console.log('🎯 [EVENT QUESTION NON-STREAMING] EventId:', eventId);
        console.log('🎯 [EVENT QUESTION NON-STREAMING] Intent:', intent);
        console.log('🎯 [EVENT QUESTION NON-STREAMING] Conversation history length:', conversationHistory.length);
        
        // Check if this is a follow-up question
        const isFollowUp = isFollowUpQuestion(message);
        console.log('🎯 [EVENT QUESTION NON-STREAMING] Is follow-up:', isFollowUp);
        
        console.log('🎯 Processing event question:', {
          message,
          intent: intent.type,
          extractedInfo: intent.extractedInfo,
          eventId,
          effectiveCity,
          isFollowUp
        });
        
        if (eventId) {
          console.log('🔍 [EVENT QUESTION NON-STREAMING] Getting event details by ID:', eventId);
          eventDetails = await getEventDetails(eventId);
          console.log('🔍 [EVENT QUESTION NON-STREAMING] Event details found by ID:', eventDetails ? 'YES' : 'NO');
        } else if (!isFollowUp) {
          console.log('🔍 [EVENT QUESTION NON-STREAMING] Not a follow-up, searching for specific event');
          eventDetails = await findEventFromQuery(intent, effectiveCity);
          console.log('🔍 [EVENT QUESTION NON-STREAMING] Event details found by query:', eventDetails ? 'YES' : 'NO');
        } else {
          console.log('🔍 [EVENT QUESTION NON-STREAMING] Follow-up question detected, skipping event search');
        }

        console.log('📋 [EVENT QUESTION NON-STREAMING] Event details found:', eventDetails ? 'YES' : 'NO');
        if (eventDetails) {
          console.log('✅ [EVENT QUESTION NON-STREAMING] Event details:', {
            name: eventDetails.name,
            venue: eventDetails.venue,
            date: eventDetails.date,
            time: eventDetails.time
          });
        }

        console.log('🤖 [EVENT QUESTION NON-STREAMING] Calling AI with context:', {
          isFollowUp,
          hasEventDetails: !!eventDetails,
          conversationHistoryLength: conversationHistory.length
        });

        // For follow-up questions, let AI handle the context from conversation history
        const eventResponse = await openRouterService.answerEventQuestion(
          message,
          eventDetails,
          { 
            city: effectiveCity, 
            userId, 
            intent, 
            conversationHistory, 
            userLocation,
            isFollowUp
          }
        );
        
        console.log('🤖 [EVENT QUESTION NON-STREAMING] AI response length:', eventResponse.length);
        console.log('🤖 [EVENT QUESTION NON-STREAMING] AI response preview:', eventResponse.substring(0, 100) + '...');
        
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
    
    
    const cityString = typeof city === 'string' ? city : 'Dubai';
    const screenType = typeof screen === 'string' ? screen.toUpperCase() as ScreenType : 'GENERAL';

    // Get contextual suggestions based on screen and user context
    const contextualSuggestions = getContextualSuggestions(
      screenType,
      cityString
    );

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

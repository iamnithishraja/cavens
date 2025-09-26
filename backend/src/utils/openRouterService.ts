import axios from 'axios';

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
      tool_calls?: Array<{
        id: string;
        type: 'function';
        function: {
          name: string;
          arguments: string;
        };
      }>;
    };
  }>;
}

interface ChatbotIntent {
  type: 'find_events' | 'find_clubs' | 'event_question' | 'club_question' | 'filter_events' | 'filter_clubs' | 'booking_help' | 'booking_status' | 'booking_details' | 'my_bookings' | 'directions' | 'club_registration' | 'policy_query' | 'general';
  confidence: number;
  query?: string;
  eventId?: string;
  eventName?: string;
  clubName?: string;
  showCards?: boolean; // NEW: Whether to show cards or just text
  cardType?: 'events' | 'clubs' | 'mixed'; // NEW: Type of cards to show
  extractedInfo?: {
    eventName?: string;
    venueName?: string;
    clubName?: string;
    date?: string;
    location?: string;
    nearMe?: boolean;
    bookingId?: string;
    bookingStatus?: string;
    keywords?: string[];
    filters?: {
      price?: { min?: number; max?: number };
      musicGenre?: string[];
      clubType?: string[];
      date?: string;
      distance?: number;
    };
  };
}

class OpenRouterService {
  private apiKey: string;
  private baseURL = 'https://openrouter.ai/api/v1';

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    if (!this.apiKey) {
      console.warn('OpenRouter API key not found in environment variables');
    }
  }

  async analyzeIntent(userMessage: string, conversationHistory: any[] = []): Promise<ChatbotIntent> {
    try {
      // OPTIMIZATION 1: Fast keyword-based intent detection (no AI call needed)
      const lowerMessage = userMessage.toLowerCase();
      
      // Quick keyword matching for common intents
      if (lowerMessage.includes('my booking') || lowerMessage.includes('my ticket') || lowerMessage.includes('my order') || lowerMessage.includes('show my')) {
        return { 
          type: 'my_bookings', 
          confidence: 0.9,
          showCards: true,
          cardType: 'mixed'
        };
      }
      
      if (lowerMessage.includes('find event') || lowerMessage.includes('show event') || lowerMessage.includes('event near') || lowerMessage.includes('what event')) {
        return { 
          type: 'find_events', 
          confidence: 0.9,
          showCards: true,
          cardType: 'events',
          extractedInfo: { nearMe: lowerMessage.includes('near me') }
        };
      }
      
      if (lowerMessage.includes('find club') || lowerMessage.includes('show club') || lowerMessage.includes('club near') || lowerMessage.includes('what club')) {
        return { 
          type: 'find_clubs', 
          confidence: 0.9,
          showCards: true,
          cardType: 'clubs',
          extractedInfo: { nearMe: lowerMessage.includes('near me') }
        };
      }

      // OPTIMIZATION 2: Minimal AI call with shorter prompt and faster model
      const messages: OpenRouterMessage[] = [
        {
          role: 'system',
          content: `Classify intent. Return ONLY JSON: {"type": "find_events|find_clubs|event_question|club_question|my_bookings|general", "confidence": 0.9, "showCards": true, "cardType": "events|clubs|mixed"}`
        },
        {
        role: 'user',
        content: userMessage
        }
      ];

      const response = await axios.post<OpenRouterResponse>(
        `${this.baseURL}/chat/completions`,
        {
          model: 'openai/gpt-4o-mini',
          messages,
          max_tokens: 50, // Much smaller response
          temperature: 0.1, // Lower temperature for consistency
          stop: ['}'] // Stop at end of JSON
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://cavens.app',
            'X-Title': 'Cavens AI Assistant'
          },
          timeout: 8000 // 8 second timeout for intent analysis
        }
      );

      const content = response.data.choices[0]?.message?.content || '';
      
      try {
        // Clean the content to extract just the JSON part
        let jsonContent = content.trim();
        
        // If the response contains extra text, try to extract just the JSON
        const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonContent = jsonMatch[0];
        }
        
        const intent = JSON.parse(jsonContent) as ChatbotIntent;
        return intent;
      } catch (parseError) {
        
        // Fast fallback based on keywords
        if (lowerMessage.includes('event') || lowerMessage.includes('party')) {
          return { 
            type: 'find_events', 
            confidence: 0.7,
            showCards: true,
            cardType: 'events'
          };
        } else if (lowerMessage.includes('club') || lowerMessage.includes('venue')) {
          return { 
            type: 'find_clubs', 
            confidence: 0.7,
            showCards: true,
            cardType: 'clubs'
          };
        }
        
        return {
          type: 'general',
          confidence: 0.5,
          showCards: false
        };
      }

    } catch (error: any) {
      console.error('Error analyzing intent:', error);
      console.error('Intent analysis error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        model: 'openai/gpt-4o-mini'
      });
      return {
        type: 'general',
        confidence: 0.5
      };
    }
  }

  async generateResponse(
    userMessage: string, 
    context: any = {}, 
    systemPrompt: string
  ): Promise<string> {
    try {
      const messages: OpenRouterMessage[] = [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userMessage
        }
      ];

      const response = await axios.post<OpenRouterResponse>(
        `${this.baseURL}/chat/completions`,
        {
          model: 'openai/gpt-4o-mini', // Fast and reliable model for responses
          messages,
          max_tokens: 150, // Very limited for concise responses
          temperature: 0.2, // Lower temperature for more focused responses
          stop: ["\n\n", "User:", "Assistant:"] // Multiple stop conditions
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://cavens.app',
            'X-Title': 'Cavens AI Assistant'
          },
          timeout: 10000 // 10 second timeout for response generation
        }
      );

      return response.data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    } catch (error: any) {
      console.error('Error generating response:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        model: 'openai/gpt-4o-mini'
      });
      return 'Sorry, I encountered an error while processing your request.';
    }
  }

  async generateEventRecommendations(
    query: string,
    events: any[],
    userPreferences?: any,
    conversationHistory: any[] = [],
    extractedInfo?: any
  ): Promise<string> {
    const conversationContext = conversationHistory.length > 0 
      ? `\nConversation History:\n${conversationHistory.slice(-4).map(msg => `${msg.role}: ${msg.content}`).join('\n')}\n`
      : '';

    const locationContext = extractedInfo?.nearMe 
      ? `The user asked for events "near me" - these events are in their current city.`
      : extractedInfo?.location 
        ? `The user is looking for events in ${extractedInfo.location}.`
        : '';

    // Create concise event summaries for Claude (limit to 5 events max)
    const limitedEvents = events.slice(0, 5).map(event => ({
      name: event.name,
      date: event.date,
      time: event.time,
      venue: event.venue,
      city: event.city,
      djArtists: event.djArtists,
      tickets: event.tickets?.slice(0, 2) // Only first 2 ticket types
    }));

    const systemPrompt = `You are Cavens AI, a helpful assistant for a nightlife events app. 

${conversationContext}
${locationContext}

Available events (${events.length} total):
${JSON.stringify(limitedEvents, null, 2)}

${events.length === 0 ? 
  'No events available. Politely explain and suggest checking back later.' :
  'Recommend 1-2 best events. Include key details. Keep under 2 sentences.'}`;

    return this.generateResponse(query, { events, userPreferences, conversationHistory }, systemPrompt);
  }

  async answerEventQuestion(
    question: string,
    eventDetails: any,
    additionalContext?: any
  ): Promise<string> {
    console.log('🤖 [AI EVENT QUESTION] Starting AI event question processing');
    console.log('🤖 [AI EVENT QUESTION] Question:', question);
    console.log('🤖 [AI EVENT QUESTION] Event details:', eventDetails ? 'PRESENT' : 'NONE');
    console.log('🤖 [AI EVENT QUESTION] Additional context:', additionalContext);
    
    let systemPrompt = '';

    const { conversationHistory = [], isFollowUp } = additionalContext || {};
    console.log('🤖 [AI EVENT QUESTION] Conversation history length:', conversationHistory.length);
    console.log('🤖 [AI EVENT QUESTION] Is follow-up:', isFollowUp);
    
    const conversationContext = conversationHistory.length > 0 
      ? `\nConversation History:\n${conversationHistory.slice(-2).map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}\n`
      : '';
    
    console.log('🤖 [AI EVENT QUESTION] Conversation context length:', conversationContext.length);

    if (eventDetails) {
      // Create a concise event summary for Claude
      const eventSummary = {
        name: eventDetails.name,
        date: eventDetails.date,
        time: eventDetails.time,
        venue: eventDetails.venue,
        city: eventDetails.city,
        djArtists: eventDetails.djArtists,
        description: eventDetails.description?.substring(0, 200) + '...', // Truncate description
        tickets: eventDetails.tickets?.slice(0, 3) // Only first 3 ticket types
      };

      // Enhanced context for follow-up questions
      const { isFollowUp } = additionalContext || {};
      
      console.log('🤖 [AI EVENT QUESTION] Processing with event details');
      console.log('🤖 [AI EVENT QUESTION] Event summary:', eventSummary);
      
      let contextInfo = '';
      if (isFollowUp) {
        contextInfo = `\nThis is a follow-up question. The user is asking for more details about an event we discussed earlier. Use the conversation history to understand what event they're referring to.`;
        console.log('🤖 [AI EVENT QUESTION] Added follow-up context info');
      }

      systemPrompt = `You are Cavens AI, a helpful assistant for a nightlife events app.

${conversationContext}${contextInfo}

${eventDetails ? `Answer the user's question about this event using ONLY the data below:
${JSON.stringify(eventSummary, null, 2)}` : `The user is asking about an event but no specific event details were found. Use the conversation history to understand what they're asking about and provide a helpful response.`}

Keep your response under 2 sentences. Be concise and helpful. If you don't have specific information, say so.`;

      console.log('🤖 [AI EVENT QUESTION] System prompt length:', systemPrompt.length);
      console.log('🤖 [AI EVENT QUESTION] System prompt preview:', systemPrompt.substring(0, 200) + '...');
    } else {
      // No specific event found
      console.log('🤖 [AI EVENT QUESTION] Processing without event details');
      const { intent } = additionalContext || {};
      const extractedInfo = intent?.extractedInfo || {};
      
      console.log('🤖 [AI EVENT QUESTION] Intent:', intent);
      console.log('🤖 [AI EVENT QUESTION] Extracted info:', extractedInfo);
      
      systemPrompt = `You are Cavens AI, a helpful assistant for a nightlife events app.

${conversationContext}

The user asked: "${question}"

I tried to find a specific event but couldn't locate one that matches their query. Here's what I extracted from their question:
${JSON.stringify(extractedInfo, null, 2)}

Based on the conversation history, respond helpfully by:
1. Acknowledging that you couldn't find the specific event they mentioned
2. Referencing previous conversation if they might be referring to something discussed earlier
3. Suggesting they try a more specific search or provide more details
4. Offering to help them find similar events or search by different criteria
5. Being encouraging and helpful

Use a friendly, apologetic but helpful tone with appropriate emojis.`;

      console.log('🤖 [AI EVENT QUESTION] System prompt for no event details length:', systemPrompt.length);
      console.log('🤖 [AI EVENT QUESTION] System prompt preview:', systemPrompt.substring(0, 200) + '...');
    }

    console.log('🤖 [AI EVENT QUESTION] Calling generateResponse...');
    const response = await this.generateResponse(question, { eventDetails, additionalContext }, systemPrompt);
    console.log('🤖 [AI EVENT QUESTION] Generated response length:', response.length);
    console.log('🤖 [AI EVENT QUESTION] Generated response preview:', response.substring(0, 100) + '...');
    
    return response;
  }

  async handleGeneralConversation(message: string, conversationHistory: any[] = [], screenContext?: any): Promise<string> {
    const conversationContext = conversationHistory.length > 0 
      ? `\nConversation History:\n${conversationHistory.slice(-2).map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}\n`
      : '';

    // Add screen-specific context
    const screenContextInfo = this.getScreenContextInfo(screenContext);

    const systemPrompt = `You are Cavens AI, a friendly assistant for a nightlife events app called Cavens.

${conversationContext}
${screenContextInfo}

Cavens helps users discover amazing nightlife events, parties, and club experiences. You can help users:
- Find events based on their preferences
- Answer questions about specific events
- Provide information about venues and clubs
- Help with booking and tickets

Based on the conversation history and current screen context, respond to the user in a friendly, helpful way. Reference previous conversation naturally when relevant. If they're not asking about events specifically, engage in light conversation but try to naturally guide them toward discovering events on the app.

Keep responses concise and use appropriate emojis.`;

    return this.generateResponse(message, { conversationHistory, screenContext }, systemPrompt);
  }

  private getScreenContextInfo(screenContext?: any): string {
    if (!screenContext) return '';

    const { screen, hasBookings, city } = screenContext;
    
    switch (screen) {
      case 'HOME':
        return `The user is currently on the home screen where they can discover featured events and popular venues. They can see trending events and get personalized recommendations.`;
      case 'MAP':
        return `The user is currently on the map screen where they can view clubs and venues on a map. They can see locations, get directions, and find nearby venues. Consider suggesting location-based help like "Show me clubs near me" or "Get directions to the nearest club".`;
      case 'BOOKINGS':
        return `The user is currently on the bookings screen ${hasBookings ? 'and has active bookings' : 'but has no current bookings'}. ${hasBookings ? 'They can manage their existing bookings, view ticket details, and get help with their reservations.' : 'You can help them find events to book or explain how the booking process works.'}`;
      case 'PROFILE':
        return `The user is currently on their profile screen where they can manage their account settings, view booking history, and access account-related features. Consider helping with profile management, account settings, or booking history questions.`;
      default:
        return '';
    }
  }

  async generateClubRecommendations(
    query: string,
    clubs: any[],
    userPreferences?: any,
    conversationHistory: any[] = [],
    extractedInfo?: any
  ): Promise<string> {
    const conversationContext = conversationHistory.length > 0 
      ? `\nConversation History:\n${conversationHistory.slice(-2).map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}\n`
      : '';

    const locationContext = extractedInfo?.nearMe ? 'The user is looking for clubs near their current location.' : '';

    // Create concise club summaries for Claude (limit to 5 clubs max)
    const limitedClubs = clubs.slice(0, 5).map(club => ({
      name: club.name,
      type: club.type,
      city: club.city,
      rating: club.rating,
      address: club.address,
      eventsCount: club.eventsCount
    }));

    const systemPrompt = `You are Cavens AI, a helpful assistant for a nightlife events app.

${conversationContext}
${locationContext}

Available clubs (${clubs.length} total):
${JSON.stringify(limitedClubs, null, 2)}

${clubs.length === 0 ? 
  'No clubs available. Politely explain and suggest checking back later.' :
  'Recommend 1-2 best clubs. Include key details. Keep under 2 sentences.'}`;

    return this.generateResponse(query, { clubs, userPreferences, conversationHistory }, systemPrompt);
  }

  async answerClubQuestion(
    question: string,
    clubDetails: any,
    additionalContext?: any
  ): Promise<string> {
    const { conversationHistory = [] } = additionalContext || {};
    const conversationContext = conversationHistory.length > 0 
      ? `\nConversation History:\n${conversationHistory.slice(-2).map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}\n`
      : '';

    let systemPrompt = '';

    if (clubDetails) {
      systemPrompt = `You are Cavens AI, a helpful assistant for a nightlife events app.

${conversationContext}

IMPORTANT: You can ONLY use the club data provided below. Do NOT make up information about this club.

The user is asking about this specific club/venue from the database:
${JSON.stringify(clubDetails, null, 2)}

Additional context: ${JSON.stringify(additionalContext || {}, null, 2)}

Based on the conversation history and ONLY the club data provided above, answer the user's question. If the specific information they're asking for is not in the club data, honestly say you don't have that information and suggest they contact the venue directly.

NEVER make up club details. Only use the actual data provided.`;
    } else {
      systemPrompt = `You are Cavens AI, a helpful assistant for a nightlife events app.

${conversationContext}

The user asked: "${question}"

I couldn't find the specific club they mentioned. Respond helpfully by:
1. Acknowledging that you couldn't find the club
2. Suggesting they try a more specific search
3. Offering to help them find similar venues or search by different criteria
4. Being encouraging and helpful

Use a friendly, apologetic but helpful tone with appropriate emojis.`;
    }

    return this.generateResponse(question, { clubDetails, additionalContext }, systemPrompt);
  }

  async handleBookingHelp(
    message: string,
    conversationHistory: any[] = [],
    context?: any
  ): Promise<string> {
    const conversationContext = conversationHistory.length > 0 
      ? `\nConversation History:\n${conversationHistory.slice(-2).map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}\n`
      : '';

    // Add screen-specific context for booking help
    const screenContextInfo = this.getScreenContextInfo(context);

    const systemPrompt = `You are Cavens AI, a helpful assistant for a nightlife events app.

${conversationContext}
${screenContextInfo}

The user needs help with booking, tickets, or payments. Based on the conversation history and current screen context, provide helpful guidance about:

1. How to book tickets for events
2. Payment methods and security
3. Ticket confirmation and QR codes
4. Refund and cancellation policies
5. Group bookings and special offers
6. Troubleshooting booking issues

${context?.hasBookings ? 'The user has existing bookings, so you can also help with managing current reservations, viewing ticket details, or answering questions about their upcoming events.' : 'The user doesn\'t have current bookings, so focus on helping them find events to book or explaining the booking process.'}

Be helpful, reassuring, and guide them through the process step by step. If they need specific technical support, suggest they contact customer service.

Use a friendly, supportive tone with appropriate emojis.`;

    return this.generateResponse(message, { conversationHistory, context }, systemPrompt);
  }

  async handleMyBookings(
    message: string,
    conversationHistory: any[] = [],
    context?: any
  ): Promise<string> {
    const conversationContext = conversationHistory.length > 0 
      ? `\nConversation History:\n${conversationHistory.slice(-2).map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}\n`
      : '';

    const screenContextInfo = this.getScreenContextInfo(context);

    // Get booking data from context if available
    const bookings = context?.bookings || [];
    const paidBookings = bookings.filter((booking: any) => booking.bookingStatus === 'paid');
    const scannedBookings = bookings.filter((booking: any) => booking.bookingStatus === 'scanned');

    // Create concise booking summary for Claude
    const bookingSummary = bookings.slice(0, 3).map((booking: any) => ({
      name: booking.name,
      venue: booking.venue,
      date: booking.date,
      status: booking.bookingStatus
    }));

    const systemPrompt = `You are Cavens AI, a helpful assistant for a nightlife events app.

${conversationContext}
${screenContextInfo}

User's bookings (${bookings.length} total):
${JSON.stringify(bookingSummary, null, 2)}

${bookings.length === 0 ? 
  'No bookings yet. Encourage them to browse events and make their first booking.' :
  `User has ${bookings.length} booking${bookings.length === 1 ? '' : 's'}. ${paidBookings.length} ready to use, ${scannedBookings.length} already used. Keep response under 2 sentences.`}`;

    return this.generateResponse(message, { conversationHistory, context, bookings }, systemPrompt);
  }

  async handleBookingStatus(
    message: string,
    conversationHistory: any[] = [],
    context?: any
  ): Promise<string> {
    const conversationContext = conversationHistory.length > 0 
      ? `\nConversation History:\n${conversationHistory.slice(-2).map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}\n`
      : '';

    const systemPrompt = `You are Cavens AI, a helpful assistant for a nightlife events app.

${conversationContext}

The user is asking about the status of their booking. Respond helpfully by:

1. **Acknowledge their concern** about booking status
2. **Guide them to check their bookings** in the app
3. **Explain booking statuses** (confirmed, pending, cancelled)
4. **Offer to help** if they need to check a specific booking
5. **Provide reassurance** about booking security

Use a helpful, reassuring tone with appropriate emojis. Keep the response concise but informative.`;

    return this.generateResponse(message, { conversationHistory, context }, systemPrompt);
  }

  async handleBookingDetails(
    message: string,
    conversationHistory: any[] = [],
    context?: any
  ): Promise<string> {
    const conversationContext = conversationHistory.length > 0 
      ? `\nConversation History:\n${conversationHistory.slice(-2).map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}\n`
      : '';

    const systemPrompt = `You are Cavens AI, a helpful assistant for a nightlife events app.

${conversationContext}

The user is asking about their booking details. Respond helpfully by:

1. **Acknowledge their request** for booking details
2. **Guide them to their bookings** to see full details
3. **Explain what details they can see** (event info, venue, date, time, QR codes)
4. **Offer to help** with specific booking questions
5. **Mention important details** like arrival time, dress code, etc.

Use a friendly, helpful tone with appropriate emojis. Keep the response concise but informative.`;

    return this.generateResponse(message, { conversationHistory, context }, systemPrompt);
  }

  async handleDirections(
    message: string,
    extractedInfo: any,
    context?: any
  ): Promise<string> {
    const { conversationHistory = [], userLocation, screen } = context || {};
    const conversationContext = conversationHistory.length > 0 
      ? `\nConversation History:\n${conversationHistory.slice(-2).map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}\n`
      : '';

    const locationContext = userLocation 
      ? `User's current location: ${userLocation.latitude}, ${userLocation.longitude}`
      : 'User location not available';

    // Add screen-specific context for directions
    const screenContextInfo = this.getScreenContextInfo(context);

    const systemPrompt = `You are Cavens AI, a helpful assistant for a nightlife events app.

${conversationContext}
${locationContext}
${screenContextInfo}

The user is asking for directions or location information. Based on the extracted info:
${JSON.stringify(extractedInfo || {}, null, 2)}

Provide helpful information about:
1. How to get to the venue/event location
2. Transportation options (taxi, metro, walking)
3. Parking information if available
4. Nearby landmarks or references
5. Estimated travel time if possible

${screen === 'MAP' ? 'Since the user is on the map screen, they can easily see venue locations and get directions directly from the map interface. Suggest they use the map features for the most accurate directions.' : 'If you have specific venue information from previous conversation, reference it. Otherwise, provide general guidance and suggest they use the map link in the app.'}

Use a helpful, practical tone with appropriate emojis.`;

    return this.generateResponse(message, { extractedInfo, context }, systemPrompt);
  }

  async generateDatabaseQuery(
    userMessage: string,
    intent: ChatbotIntent, 
    userId?: string
  ): Promise<{ model: string; query: any; populate?: any }> {
    const today = new Date().toISOString().split('T')[0];

    // Rule-based: find clubs
    if (intent.type === 'find_clubs') {
          return {
            model: 'Club',
        query: {
          isApproved: true,
          ...(intent.extractedInfo?.location
            ? { city: { $regex: `^${intent.extractedInfo.location}$`, $options: 'i' } }
            : {})
        }
      };
    }

    // Rule-based: find events
    if (intent.type === 'find_events') {
          return {
        model: 'Event',
            query: { 
          status: 'active',
          date: { $gte: today },
          ...(intent.extractedInfo?.location
            ? { city: { $regex: `^${intent.extractedInfo.location}$`, $options: 'i' } }
            : {}),
          ...(intent.extractedInfo?.keywords
            ? { $or: intent.extractedInfo.keywords.map(k => ({
                name: { $regex: k, $options: 'i' }
              })) }
            : {})
        }
      };
    }

    // Rule-based: bookings (requires userId)
    if (intent.type?.includes('booking') && userId) {
      const statusMap: Record<string, string> = {
        booking_status: 'paid',
        my_bookings: 'paid',
        booking_details: 'paid',
      };
      return {
        model: 'User',
        query: { _id: userId },
        populate: {
          path: 'orders',
          match: { status: statusMap[intent.type] || 'paid' },
          populate: [{ path: 'event' }, { path: 'club' }, { path: 'ticket' }]
        }
      };
    }

    // AI fallback (when rules can't determine what to do)
      return {
        model: 'Club',
        query: { isApproved: true }
      };
    }

  private getSchemaForAI() {
    return {
      Club: {
        name: 'string',
        city: 'string',
        isApproved: 'boolean',
        rating: 'number',
        typeOfVenue: 'string'
      },
      Event: {
        name: 'string',
        date: 'string',
        status: 'string',
        city: 'string'
      },
      User: {
        _id: 'ObjectId',
        orders: 'array'
      }
    };
  }

  async handleClubRegistration(
    message: string,
    conversationHistory: any[] = [],
    context?: any
  ): Promise<string> {
    const conversationContext = conversationHistory.length > 0 
      ? `\nConversation History:\n${conversationHistory.slice(-2).map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}\n`
      : '';

    const systemPrompt = `You are Cavens AI, a helpful assistant for a nightlife events app.

${conversationContext}

The user is asking about how to become a club owner/partner with Cavens. Provide accurate information about the club registration process:

**CLUB REGISTRATION PROCESS:**

1. **Switch to Club Mode**: 
   - Go to your Profile tab
   - Look for the "Switch to Club" button
   - Tap it to start the club registration process

2. **Fill Out the Registration Form**:
   - You'll need to provide club details (name, location, type, etc.)
   - Upload required documents and images
   - Complete all required fields in the form

3. **Admin Review Process**:
   - Your application will be reviewed by Cavens admin team
   - This usually takes a few business days
   - Admin may contact you for additional information or clarification

4. **Approval & Activation**:
   - Once approved, you'll receive confirmation
   - Your club account will be activated
   - You can start creating and managing events

**IMPORTANT NOTES:**
- Make sure you have all required documents ready
- Provide accurate information in the registration form
- Be patient during the review process
- Admin team may contact you via email or phone for verification

Respond with enthusiasm and encouragement, mentioning that becoming a club partner is a great opportunity to reach more customers and grow their business. Use a friendly, professional tone with appropriate emojis.`;

    return this.generateResponse(message, { conversationHistory, context }, systemPrompt);
  }


  // Policy knowledge base for dynamic responses
  private getPolicyKnowledgeBase(): { [key: string]: any } {
    return {
      refund: {
        title: "REFUND POLICY",
        status: "Cavens does not currently offer refunds for event tickets.",
        reasons: [
          "Event tickets are non-refundable to protect venues and event organizers",
          "This ensures fair pricing and prevents last-minute cancellations",
          "Venues need guaranteed attendance for planning purposes"
        ],
        alternatives: [
          "Transfer to Friend: You can share your ticket with friends or family",
          "Sell to Others: You can transfer your ticket to someone else who wants to attend",
          "Contact Support: In exceptional circumstances (event cancellation, venue issues), contact our support team",
          "Event Rescheduling: If an event is rescheduled, your ticket remains valid for the new date"
        ],
        notes: [
          "All sales are final",
          "Tickets cannot be refunded for change of mind",
          "This policy applies to all events on Cavens platform",
          "Check event details before booking to avoid disappointment"
        ]
      },
      cancellation: {
        title: "CANCELLATION POLICY",
        status: "Cavens does not currently allow ticket cancellations after purchase.",
        reasons: [
          "Event tickets are non-cancellable to protect venues and event organizers",
          "This ensures fair pricing and prevents last-minute cancellations",
          "Venues need guaranteed attendance for planning purposes"
        ],
        alternatives: [
          "Transfer to Friend: You can share your ticket with friends or family",
          "Sell to Others: You can transfer your ticket to someone else who wants to attend",
          "Contact Support: In exceptional circumstances (event cancellation, venue issues), contact our support team",
          "Event Rescheduling: If an event is rescheduled, your ticket remains valid for the new date"
        ],
        notes: [
          "All sales are final",
          "Tickets cannot be cancelled for change of mind",
          "This policy applies to all events on Cavens platform",
          "Check event details before booking to avoid disappointment"
        ]
      },
      general: {
        title: "BOOKING POLICIES & TERMS",
        sections: [
          {
            title: "Ticket Sales",
            points: [
              "All ticket sales are final",
              "No refunds or cancellations after purchase",
              "Prices may vary based on demand and availability"
            ]
          },
          {
            title: "Event Attendance",
            points: [
              "Arrive on time for events",
              "Bring valid ID for age verification",
              "Follow venue dress codes and rules",
              "Respect other attendees and venue staff"
            ]
          },
          {
            title: "Ticket Transfer",
            points: [
              "You can transfer tickets to friends or family",
              "Use the share feature in your bookings",
              "Ensure the recipient has the Cavens app"
            ]
          },
          {
            title: "Event Changes",
            points: [
              "If an event is rescheduled, your ticket remains valid",
              "If an event is cancelled, contact support for assistance",
              "Venue changes will be communicated via app notifications"
            ]
          },
          {
            title: "Age Restrictions",
            points: [
              "Follow venue age requirements (usually 18+ or 21+)",
              "Bring valid government-issued ID",
              "Underage attendees will be denied entry"
            ]
          },
          {
            title: "Dress Code",
            points: [
              "Check event details for specific dress codes",
              "Smart casual is generally recommended",
              "Some venues may have specific requirements"
            ]
          },
          {
            title: "Payment",
            points: [
              "Secure payment processing",
              "All major credit cards accepted",
              "Payment confirmation sent via email"
            ]
          },
          {
            title: "Support",
            points: [
              "Contact support for genuine issues",
              "Response time: within 24 hours",
              "Documentation may be required for claims"
            ]
          }
        ]
      }
    };
  }

  // Extract policy type from user message
  private extractPolicyType(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('refund') || lowerMessage.includes('money back')) {
      return 'refund';
    }
    
    if (lowerMessage.includes('cancel') || lowerMessage.includes('cancellation')) {
      return 'cancellation';
    }
    
    return 'general';
  }

  async handlePolicyQuery(
    message: string,
    conversationHistory: any[] = [],
    context?: any
  ): Promise<string> {
    const conversationContext = conversationHistory.length > 0 
      ? `\nConversation History:\n${conversationHistory.slice(-2).map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}\n`
      : '';

    const policyType = this.extractPolicyType(message);
    const policyData = this.getPolicyKnowledgeBase()[policyType];

    let systemPrompt = `You are Cavens AI, a helpful assistant for a nightlife events app.

${conversationContext}

The user is asking about booking policies. Based on their query, provide accurate information about Cavens' policies.

**${policyData.title}:**

`;

    if (policyType === 'general') {
      systemPrompt += `**Current Status**: Here are our comprehensive booking policies and terms.

`;
      policyData.sections.forEach((section: any) => {
        systemPrompt += `**${section.title}:**\n`;
        section.points.forEach((point: string) => {
          systemPrompt += `- ${point}\n`;
        });
        systemPrompt += `\n`;
      });
      
      systemPrompt += `**Important Reminders:**
- Read event details carefully before booking
- Check venue location and timing
- Plan your transportation in advance
- Have fun and stay safe! 🎉

Respond with a helpful, comprehensive overview of the booking policies. Use a friendly, professional tone with appropriate emojis and clear structure.`;
    } else {
      systemPrompt += `**Current Status**: ${policyData.status}

**Why This Policy?**
${policyData.reasons.map((reason: string) => `- ${reason}`).join('\n')}

**What You Can Do Instead:**
${policyData.alternatives.map((alt: string) => `${alt}`).join('\n')}

**Important Notes:**
${policyData.notes.map((note: string) => `- ${note}`).join('\n')}

**Support Contact:**
- For genuine issues (event cancelled, venue problems), contact our support team
- We'll review each case individually
- Documentation may be required for exceptional circumstances

Respond with empathy and understanding, but be clear about the policy. Offer alternative solutions and emphasize the importance of checking event details before booking. Use a friendly, professional tone with appropriate emojis.`;
    }

    return this.generateResponse(message, { conversationHistory, context, policyType }, systemPrompt);
  }
}

export const openRouterService = new OpenRouterService();
export default openRouterService;

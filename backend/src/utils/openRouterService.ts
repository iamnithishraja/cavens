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
  type: 'find_events' | 'find_clubs' | 'event_question' | 'club_question' | 'filter_events' | 'filter_clubs' | 'booking_help' | 'booking_status' | 'booking_details' | 'my_bookings' | 'directions' | 'general';
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
      // Build conversation context
      const messages: OpenRouterMessage[] = [
        {
          role: 'system',
          content: `You are an AI assistant for a nightlife events app called Cavens. Analyze user messages and determine their intent and whether to show cards or text responses.

CRITICAL: Respond ONLY with valid JSON. Do not include any explanatory text before or after the JSON.

Analyze the user's message and determine:
1. **Intent type**: find_events, find_clubs, event_question, club_question, booking_help, booking_status, booking_details, my_bookings, general, etc.
2. **showCards**: true if user wants to see actual event/club cards, false for text-only responses
3. **cardType**: "events", "clubs", or "mixed" when showCards is true

**CARD DETECTION RULES:**
- Show cards for: "show me events", "find clubs", "what events are happening", "list venues", "recommend events"
- Show text for: "what time does it start", "how much does it cost", "tell me about this event", general questions

**BOOKING INTENT DETECTION:**
- **my_bookings**: "show my bookings", "what are my bookings", "my tickets", "my reservations"
- **booking_status**: "status of my booking", "is my booking confirmed", "booking status"
- **booking_details**: "details of my booking", "booking information", "my ticket details"
- **booking_help**: "how to book", "booking process", "how to cancel", "refund policy"

**EVENT NAME EXTRACTION:**
- Extract event names, DJ names, venue names from questions
- Look for specific event references in conversation history
- Identify when user is asking about a specific event vs general events

Respond with ONLY this JSON format:
{
  "type": "intent_type", 
  "confidence": 0.9, 
  "showCards": true/false,
  "cardType": "events/clubs/mixed",
  "query": "search terms", 
  "extractedInfo": {
    "location": "city",
    "eventName": "specific event name",
    "venueName": "venue name",
    "djName": "DJ name",
    "nearMe": true/false
  }
}

Examples:
"Find events near me" -> {"type": "find_events", "confidence": 0.9, "showCards": true, "cardType": "events", "extractedInfo": {"nearMe": true}}
"Show me clubs in Dubai" -> {"type": "find_clubs", "confidence": 0.9, "showCards": true, "cardType": "clubs", "extractedInfo": {"location": "Dubai"}}
"What time does the party start?" -> {"type": "event_question", "confidence": 0.8, "showCards": false}
"What's the cover charge?" -> {"type": "event_question", "confidence": 0.8, "showCards": false}
"Tell me about the Tech House Night at XYZ Club" -> {"type": "event_question", "confidence": 0.9, "showCards": false, "extractedInfo": {"eventName": "Tech House Night", "venueName": "XYZ Club"}}
"What time does DJ John's set start?" -> {"type": "event_question", "confidence": 0.9, "showCards": false, "extractedInfo": {"djName": "DJ John"}}
"Show my bookings" -> {"type": "my_bookings", "confidence": 0.9, "showCards": true, "cardType": "events"}
"What's the status of my booking?" -> {"type": "booking_status", "confidence": 0.9, "showCards": false}
"Tell me about my ticket details" -> {"type": "booking_details", "confidence": 0.9, "showCards": false}
"How do I book tickets?" -> {"type": "booking_help", "confidence": 0.9, "showCards": false}
"Hello" -> {"type": "general", "confidence": 0.9, "showCards": false}
"Recommend some events" -> {"type": "find_events", "confidence": 0.9, "showCards": true, "cardType": "events"}

RESPOND WITH ONLY JSON - NO OTHER TEXT.`
        }
      ];

      // Add conversation history (last 3 messages for context - reduced for speed)
      const recentHistory = conversationHistory.slice(-3);
      if (recentHistory.length > 0) {
        messages.push({
          role: 'system',
          content: `CONVERSATION HISTORY for context:
${recentHistory.map((msg: any, index: number) => 
  `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
).join('\n')}

Use this conversation history to understand context. If the user is asking about a specific event/venue mentioned in previous messages, extract that information.`
        });
      }

      // Add current user message
      messages.push({
        role: 'user',
        content: userMessage
      });

      const response = await axios.post<OpenRouterResponse>(
        `${this.baseURL}/chat/completions`,
        {
          model: 'anthropic/claude-3.5-sonnet',
          messages,
          max_tokens: 150, // Reduced from 200
          temperature: 0.3
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
        
        // Simple fallback based on keywords
        const lowerMessage = content.toLowerCase();
        if (lowerMessage.includes('event') || lowerMessage.includes('party')) {
          return { type: 'find_events', confidence: 0.7 };
        } else if (lowerMessage.includes('club') || lowerMessage.includes('venue')) {
          return { type: 'find_clubs', confidence: 0.7 };
        }
        
        return {
          type: 'general',
          confidence: 0.5
        };
      }

    } catch (error) {
      console.error('Error analyzing intent:', error);
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
          model: 'anthropic/claude-3.5-sonnet',
          messages,
          max_tokens: 300, // Reduced from 500
          temperature: 0.7
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

    } catch (error) {
      console.error('Error generating response:', error);
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

    const systemPrompt = `You are Cavens AI, a helpful assistant for a nightlife events app. 

${conversationContext}
${locationContext}

IMPORTANT: You can ONLY use the events data provided below. Do NOT make up events or suggest events that are not in this list. If no events are provided, acknowledge that no events are currently available.

The user is looking for events. Here are the ONLY available events from the database:
${JSON.stringify(events, null, 2)}

User preferences: ${JSON.stringify(userPreferences || {}, null, 2)}

Based on the conversation history and ONLY the events provided above:
${events.length === 0 ? 
  '- Since no events are available, politely explain that there are currently no events in their area and suggest they check back later or try a different city.' :
  `- Recommend the best 1-3 events from the list above
- Explain why these events match their request
- Include key details like date, time, venue, and price from the provided data
- Use a friendly, enthusiastic tone
- Encourage them to book tickets`
}

NEVER suggest events that are not in the provided list. Only use actual database data.`;

    return this.generateResponse(query, { events, userPreferences, conversationHistory }, systemPrompt);
  }

  async answerEventQuestion(
    question: string,
    eventDetails: any,
    additionalContext?: any
  ): Promise<string> {
    let systemPrompt = '';

    const { conversationHistory = [] } = additionalContext || {};
    const conversationContext = conversationHistory.length > 0 
      ? `\nConversation History:\n${conversationHistory.slice(-2).map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}\n`
      : '';

    if (eventDetails) {
      systemPrompt = `You are Cavens AI, a helpful assistant for a nightlife events app.

${conversationContext}

IMPORTANT: You can ONLY use the event data provided below. Do NOT make up information about this event.

The user is asking about this specific event from the database:
${JSON.stringify(eventDetails, null, 2)}

Additional context: ${JSON.stringify(additionalContext || {}, null, 2)}

Based on the conversation history and ONLY the event data provided above, provide a comprehensive and detailed answer to the user's question. Include:

1. **Event Overview**: Name, date, time, venue
2. **Specific Details**: Answer their specific question (time, price, location, etc.)
3. **Additional Info**: DJ/artists, description, ticket types, contact info if relevant
4. **Next Steps**: Suggest booking tickets or contacting the venue

Be enthusiastic and helpful. If the specific information they're asking for is not in the event data, honestly say you don't have that information and suggest they contact the venue directly.

NEVER make up event details. Only use the actual data provided.`;
    } else {
      // No specific event found
      const { intent } = additionalContext || {};
      const extractedInfo = intent?.extractedInfo || {};
      
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
    }

    return this.generateResponse(question, { eventDetails, additionalContext }, systemPrompt);
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

    const systemPrompt = `You are Cavens AI, a helpful assistant for a nightlife events app.

${conversationContext}
${locationContext}

IMPORTANT: You can ONLY use the clubs data provided below. Do NOT make up clubs or suggest venues that are not in this list. If no clubs are provided, acknowledge that no clubs are currently available.

The user is looking for clubs/venues. Here are the ONLY available clubs from the database:
${JSON.stringify(clubs, null, 2)}

User preferences: ${JSON.stringify(userPreferences || {}, null, 2)}

Based on the conversation history and ONLY the clubs provided above:
${clubs.length === 0 ? 
  '- Since no clubs are available, politely explain that there are currently no clubs in their area and suggest they check back later or try a different city.' :
  `- Recommend the best 1-3 clubs from the list above
- Explain why these clubs match their request  
- Include key details like location, type, rating from the provided data
- Mention any events if included in the data
- Use a friendly, enthusiastic tone
- Suggest they can find events at these venues`
}

NEVER suggest clubs that are not in the provided list. Only use actual database data.`;

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

    const systemPrompt = `You are Cavens AI, a helpful assistant for a nightlife events app.

${conversationContext}
${screenContextInfo}

The user is asking about their bookings/tickets. Here's their booking information:

**Total Bookings**: ${bookings.length}
**Paid Bookings (Ready to Use)**: ${paidBookings.length}
**Scanned Bookings (Already Used)**: ${scannedBookings.length}

${bookings.length > 0 ? `
**Recent Bookings**:
${bookings.slice(0, 3).map((booking: any, index: number) => 
  `${index + 1}. ${booking.name} at ${booking.venue} - ${booking.bookingStatus === 'paid' ? '✅ Ready' : '📱 Scanned'}`
).join('\n')}
` : ''}

Respond based on their actual booking data:

${bookings.length === 0 ? `
The user has no bookings yet. Encourage them to:
1. Browse available events
2. Make their first booking
3. Explain the booking process
` : `
The user has ${bookings.length} booking${bookings.length === 1 ? '' : 's'}. 

${paidBookings.length > 0 ? `
**Active Tickets (${paidBookings.length})**: These are ready to use! Mention they can:
- View QR codes for entry
- Get venue directions  
- Check event details and times
- Share tickets with friends
` : ''}

${scannedBookings.length > 0 ? `
**Used Tickets (${scannedBookings.length})**: These have been scanned at events.
` : ''}

Guide them to manage their bookings and offer specific help.
`}

Use a friendly, helpful tone with appropriate emojis. Be specific about their actual bookings.`;

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
    intent: any,
    databaseSchema: string
  ): Promise<{ model: string; query: any; populate?: any }> {
    try {
      const systemPrompt = `You are a MongoDB query generator for a nightlife events app. 

DATABASE SCHEMA:
${databaseSchema}

Based on the user's message and intent, generate the optimal MongoDB query.

User message: "${userMessage}"
Intent: ${JSON.stringify(intent, null, 2)}
Current date: "${new Date().toISOString().split('T')[0]}" (use this for filtering upcoming events)

Respond with ONLY a JSON object in this format:
{
  "model": "Club|Event|User|Order",
  "query": { /* MongoDB query object */ },
  "populate": { /* populate options if needed */ }
}

Examples:
- "Find clubs in Dubai" → {"model": "Club", "query": {"city": {"$regex": "^Dubai$", "$options": "i"}, "isApproved": true}}
- "Events with hip-hop" → {"model": "Club", "query": {"events": {"$exists": true}, "isApproved": true}, "populate": {"path": "events", "match": {"status": "active", "$or": [{"name": {"$regex": "hip-hop", "$options": "i"}}, {"djArtists": {"$regex": "hip-hop", "$options": "i"}}]}}}
- "Rooftop venues" → {"model": "Club", "query": {"typeOfVenue": {"$regex": "rooftop", "$options": "i"}, "isApproved": true}}
- "My bookings" → {"model": "User", "query": {"_id": "USER_ID"}, "populate": {"path": "orders", "populate": [{"path": "event"}, {"path": "club"}, {"path": "ticket"}]}}
- "Show my orders" → {"model": "User", "query": {"_id": "USER_ID"}, "populate": {"path": "orders", "populate": [{"path": "event"}, {"path": "club"}, {"path": "ticket"}]}}
- "My tickets" → {"model": "User", "query": {"_id": "USER_ID"}, "populate": {"path": "orders", "populate": [{"path": "event"}, {"path": "club"}, {"path": "ticket"}]}}
- "Booking status" → {"model": "User", "query": {"_id": "USER_ID"}, "populate": {"path": "orders", "match": {"status": "STATUS_VALUE"}, "populate": [{"path": "event"}, {"path": "club"}, {"path": "ticket"}]}}

IMPORTANT: 
- For upcoming events, filter by date: {"date": {"$gte": "2024-01-01"}} (use current date provided above)
- Do NOT use JavaScript functions like new Date() in queries
- Use simple string values for dates in YYYY-MM-DD format
- Keep all values as basic JSON types (string, number, boolean, object, array)
- Always filter events by status: "active" and upcoming dates
- For user bookings: Use User model with _id query and populate orders
- For orders: Order model does NOT have userId field - use User.orders relationship
- Replace "USER_ID" in examples with the actual userId from intent
- For booking queries, always populate: event, club, and ticket references
- The chatbot uses the same query pattern as getBookings function in userController
- Status filtering: Use {"match": {"status": "paid"}} for paid orders, {"match": {"status": "scanned"}} for scanned orders

RESPOND WITH ONLY JSON - NO OTHER TEXT.`;

      const response = await this.generateResponse(userMessage, { intent }, systemPrompt);
      
      try {
        // Extract JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        throw new Error('No JSON found in response');
      } catch (parseError) {
        // Fallback to simple query based on intent
        if (intent.type?.includes('club')) {
          return {
            model: 'Club',
            query: { isApproved: true }
          };
        } else {
          return {
            model: 'Club',
            query: { 
              isApproved: true,
              events: { $exists: true, $not: { $size: 0 } }
            },
            populate: {
              path: 'events',
              match: { status: 'active' },
              populate: { path: 'tickets' }
            }
          };
        }
      }

    } catch (error) {
      console.error('Error generating database query:', error);
      return {
        model: 'Club',
        query: { isApproved: true }
      };
    }
  }
}

export const openRouterService = new OpenRouterService();
export default openRouterService;

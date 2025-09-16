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
  type: 'find_events' | 'find_clubs' | 'event_question' | 'club_question' | 'filter_events' | 'filter_clubs' | 'booking_help' | 'directions' | 'general';
  confidence: number;
  query?: string;
  eventId?: string;
  eventName?: string;
  clubName?: string;
  extractedInfo?: {
    eventName?: string;
    venueName?: string;
    clubName?: string;
    date?: string;
    location?: string;
    nearMe?: boolean;
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
          content: `You are an AI assistant for a nightlife events app called Cavens. Analyze user messages and determine their intent.

CRITICAL: Respond ONLY with valid JSON. Do not include any explanatory text before or after the JSON.

Analyze the user's message and determine the intent type:
1. **find_events** - Finding/searching for events
2. **find_clubs** - Finding/searching for clubs/venues  
3. **event_question** - Questions about specific events
4. **club_question** - Questions about specific clubs/venues
5. **general** - General conversation

Respond with ONLY this JSON format:
{"type": "intent_type", "confidence": 0.9, "query": "search terms", "extractedInfo": {"location": "city"}}

Examples:
"Find events near me" -> {"type": "find_events", "confidence": 0.9, "extractedInfo": {"nearMe": true}}
"Show me clubs in Dubai" -> {"type": "find_clubs", "confidence": 0.9, "extractedInfo": {"location": "Dubai"}}
"What time does the party start?" -> {"type": "event_question", "confidence": 0.8}
"Hello" -> {"type": "general", "confidence": 0.9}

RESPOND WITH ONLY JSON - NO OTHER TEXT.`
        }
      ];

      // Add conversation history (last 6 messages for context)
      const recentHistory = conversationHistory.slice(-6);
      recentHistory.forEach((msg: any) => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      });

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
          max_tokens: 200,
          temperature: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://cavens.app',
            'X-Title': 'Cavens AI Assistant'
          }
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
        console.log('✅ Successfully parsed intent:', intent);
        return intent;
      } catch (parseError) {
        console.error('❌ Failed to parse intent response:', content);
        console.error('❌ Parse error:', parseError);
        
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
          max_tokens: 500,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://cavens.app',
            'X-Title': 'Cavens AI Assistant'
          }
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
      ? `\nConversation History:\n${conversationHistory.slice(-4).map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}\n`
      : '';

    if (eventDetails) {
      systemPrompt = `You are Cavens AI, a helpful assistant for a nightlife events app.

${conversationContext}

IMPORTANT: You can ONLY use the event data provided below. Do NOT make up information about this event.

The user is asking about this specific event from the database:
${JSON.stringify(eventDetails, null, 2)}

Additional context: ${JSON.stringify(additionalContext || {}, null, 2)}

Based on the conversation history and ONLY the event data provided above, answer the user's question. If the specific information they're asking for is not in the event data, honestly say you don't have that information and suggest they contact the venue.

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

  async handleGeneralConversation(message: string, conversationHistory: any[] = []): Promise<string> {
    const conversationContext = conversationHistory.length > 0 
      ? `\nConversation History:\n${conversationHistory.slice(-4).map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}\n`
      : '';

    const systemPrompt = `You are Cavens AI, a friendly assistant for a nightlife events app called Cavens.

${conversationContext}

Cavens helps users discover amazing nightlife events, parties, and club experiences. You can help users:
- Find events based on their preferences
- Answer questions about specific events
- Provide information about venues and clubs
- Help with booking and tickets

Based on the conversation history, respond to the user in a friendly, helpful way. Reference previous conversation naturally when relevant. If they're not asking about events specifically, engage in light conversation but try to naturally guide them toward discovering events on the app.

Keep responses concise and use appropriate emojis.`;

    return this.generateResponse(message, { conversationHistory }, systemPrompt);
  }

  async generateClubRecommendations(
    query: string,
    clubs: any[],
    userPreferences?: any,
    conversationHistory: any[] = [],
    extractedInfo?: any
  ): Promise<string> {
    const conversationContext = conversationHistory.length > 0 
      ? `\nConversation History:\n${conversationHistory.slice(-4).map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}\n`
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
      ? `\nConversation History:\n${conversationHistory.slice(-4).map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}\n`
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
      ? `\nConversation History:\n${conversationHistory.slice(-4).map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}\n`
      : '';

    const systemPrompt = `You are Cavens AI, a helpful assistant for a nightlife events app.

${conversationContext}

The user needs help with booking, tickets, or payments. Based on the conversation history, provide helpful guidance about:

1. How to book tickets for events
2. Payment methods and security
3. Ticket confirmation and QR codes
4. Refund and cancellation policies
5. Group bookings and special offers
6. Troubleshooting booking issues

Be helpful, reassuring, and guide them through the process step by step. If they need specific technical support, suggest they contact customer service.

Use a friendly, supportive tone with appropriate emojis.`;

    return this.generateResponse(message, { conversationHistory, context }, systemPrompt);
  }

  async handleDirections(
    message: string,
    extractedInfo: any,
    context?: any
  ): Promise<string> {
    const { conversationHistory = [], userLocation } = context || {};
    const conversationContext = conversationHistory.length > 0 
      ? `\nConversation History:\n${conversationHistory.slice(-4).map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}\n`
      : '';

    const locationContext = userLocation 
      ? `User's current location: ${userLocation.latitude}, ${userLocation.longitude}`
      : 'User location not available';

    const systemPrompt = `You are Cavens AI, a helpful assistant for a nightlife events app.

${conversationContext}
${locationContext}

The user is asking for directions or location information. Based on the extracted info:
${JSON.stringify(extractedInfo || {}, null, 2)}

Provide helpful information about:
1. How to get to the venue/event location
2. Transportation options (taxi, metro, walking)
3. Parking information if available
4. Nearby landmarks or references
5. Estimated travel time if possible

If you have specific venue information from previous conversation, reference it. Otherwise, provide general guidance and suggest they use the map link in the app.

Use a helpful, practical tone with appropriate emojis.`;

    return this.generateResponse(message, { extractedInfo, context }, systemPrompt);
  }
}

export const openRouterService = new OpenRouterService();
export default openRouterService;

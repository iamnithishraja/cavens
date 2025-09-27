import openRouterService from './openRouterService';
import User from '../models/userModel';
import { executeAIGeneratedQuery, extractEventsFromClubs } from './chatbotDatabaseUtils';

// Get card data for chatbot responses
export async function getCardData(intent: any, city: string, userId?: string): Promise<any[]> {
  try {
    console.log('🎯 [CARD DEBUG] Getting card data for intent:', intent.type);
    
    // Simple card data based on intent type
    if (intent.type === 'find_events' || intent.type === 'filter_events') {
      console.log('🎯 [CARD DEBUG] Returning event cards');
      return [{
        type: 'event',
        title: 'Upcoming Events',
        data: [] // Will be populated by the frontend
      }];
    }
    
    if (intent.type === 'find_clubs' || intent.type === 'filter_clubs') {
      console.log('🎯 [CARD DEBUG] Returning club cards');
      return [{
        type: 'club',
        title: 'Popular Clubs',
        data: [] // Will be populated by the frontend
      }];
    }
    
    if (intent.type === 'my_bookings') {
      console.log('🎯 [CARD DEBUG] Returning booking cards');
      return [{
        type: 'booking',
        title: 'Your Bookings',
        data: [] // Will be populated by the frontend
      }];
    }
    
    console.log('🎯 [CARD DEBUG] No cards for intent:', intent.type);
    return [];
  } catch (error) {
    console.error('Error getting card data:', error);
    return [];
  }
}

// Stream response word by word (optimized)
export async function streamResponse(response: string, res: any): Promise<void> {
  const words = response.split(' ');
  
  // Much faster streaming - 20ms delay instead of 100ms
  const delay = 20;
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (!word) continue;
    
    res.write(`data: ${JSON.stringify({ 
      type: 'token', 
      token: (i > 0 ? ' ' : '') + word,
      isComplete: i === words.length - 1
    })}\n\n`);
    
    // Only delay if not the last word
    if (i < words.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Generate response based on intent and query results
export async function generateResponse(
  message: string, 
  intent: any, 
  aiQuery: any, 
  preferences: any, 
  conversationHistory: any[], 
  screen: string, 
  hasBookings: boolean, 
  cityString: string
): Promise<{ response: string; responseType: number }> {
  
  if (intent.type === 'find_events' || intent.type === 'filter_events') {
    const responseType = 2;
    if (aiQuery.type === 'Club') {
      const events = extractEventsFromClubs(aiQuery.data);
      const response = await openRouterService.generateEventRecommendations(
        message, events, preferences, conversationHistory, intent.extractedInfo
      );
      return { response, responseType };
    } else {
      const response = await openRouterService.generateEventRecommendations(
        message, aiQuery.data, preferences, conversationHistory, intent.extractedInfo
      );
      return { response, responseType };
    }
  } else if (intent.type === 'find_clubs' || intent.type === 'filter_clubs') {
    const responseType = 3;
    const response = await openRouterService.generateClubRecommendations(
      message, aiQuery.data, preferences, conversationHistory, intent.extractedInfo
    );
    return { response, responseType };
  } else {
    const responseType = 0;
    const response = await openRouterService.handleGeneralConversation(
      message, conversationHistory, { screen, hasBookings, city: cityString }
    );
    return { response, responseType };
  }
}


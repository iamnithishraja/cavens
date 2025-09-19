export interface ChatbotSuggestion {
  text: string;
  category: 'events' | 'clubs' | 'bookings' | 'general' | 'help';
}

export const CHATBOT_SUGGESTIONS = {
  // Home Screen Suggestions
  HOME: [
    { text: "Find events near me", category: 'events' as const },
    { text: "What's happening tonight?", category: 'events' as const },
    { text: "Show me clubs in Dubai", category: 'clubs' as const },
    { text: "Events this weekend", category: 'events' as const },
    { text: "Best nightclubs for electronic music", category: 'clubs' as const },
    { text: "Events under د.إ 100", category: 'events' as const },
  ],

  // Map Screen Suggestions (for userTabs/map.tsx)
  MAP: [
    { text: "Clubs within 5km", category: 'clubs' as const },
    { text: "Get directions to nearest club", category: 'help' as const },
    { text: "Show clubs by rating", category: 'clubs' as const },
    { text: "What's the parking situation?", category: 'help' as const },
    { text: "Clubs accessible by metro", category: 'clubs' as const },
    { text: "Show me club photos", category: 'clubs' as const },
  ],

  // Bookings Screen Suggestions
  BOOKINGS: [
    { text: "Show my upcoming events", category: 'bookings' as const },
    { text: "How do I cancel a booking?", category: 'help' as const },
    { text: "Can I transfer my ticket?", category: 'help' as const },
    { text: "What's the refund policy?", category: 'help' as const },
    { text: "How to show my QR code?", category: 'help' as const },
  ],

  // Profile Screen Suggestions
  PROFILE: [
    { text: "How to update my preferences?", category: 'help' as const },
    { text: "Change notification settings", category: 'help' as const },
    { text: "View my booking history", category: 'bookings' as const },
    { text: "How to become a club owner?", category: 'help' as const },
    { text: "Account security settings", category: 'help' as const },
    { text: "Contact support", category: 'help' as const },
  ],

  // General Fallback Suggestions (used when screen not specified)
  GENERAL: [
    { text: "Find events near me", category: 'events' as const },
    { text: "Show me clubs in Dubai", category: 'clubs' as const },
    { text: "What's happening tonight?", category: 'events' as const },
    { text: "How do I book tickets?", category: 'help' as const },
    { text: "Events this weekend", category: 'events' as const },
    { text: "Contact support", category: 'help' as const },
  ]
};

export type ScreenType = keyof typeof CHATBOT_SUGGESTIONS;

export const getScreenSuggestions = (screen: ScreenType = 'GENERAL'): ChatbotSuggestion[] => {
  return CHATBOT_SUGGESTIONS[screen] || CHATBOT_SUGGESTIONS.GENERAL;
};

// Dynamic suggestions based on user context
export const getContextualSuggestions = (
  screen: ScreenType,
  city?: string
): ChatbotSuggestion[] => {
  console.log('🔧 getContextualSuggestions called with:', { screen, city });
  
  let suggestions = [...getScreenSuggestions(screen)];
  
  console.log('📋 Base screen suggestions for', screen, ':', suggestions);
  
  // Add city-specific suggestions
  if (city && city !== 'Dubai') {
    suggestions.unshift({ 
      text: `Find events in ${city}`, 
      category: 'events' as const 
    });
    suggestions.unshift({ 
      text: `Show me clubs in ${city}`, 
      category: 'clubs' as const 
    });
  }
  
  const finalSuggestions = suggestions.slice(0, 6); // Limit to 6 suggestions
  console.log('✅ Final suggestions:', finalSuggestions);
  
  return finalSuggestions;
};

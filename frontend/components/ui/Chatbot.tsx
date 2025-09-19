import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import apiClient from '@/app/api/client';
import ChatbotCardsContainer from '@/components/chatbot/ChatbotCardsContainer';
import { store } from '@/utils';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  type?: number; // 0: general, 1: event question, 2: find events
  timestamp: Date;
  showCards?: boolean;
  cardType?: 'events' | 'clubs' | 'mixed';
  cards?: any[];
}

interface ChatbotProps {
  isVisible: boolean;
  onClose: () => void;
  initialMessage?: string;
  eventId?: string;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  city?: string;
  screen?: 'HOME' | 'MAP' | 'BOOKINGS' | 'PROFILE' | 'GENERAL';
}

const { width, height } = Dimensions.get('window');

const Chatbot: React.FC<ChatbotProps> = ({ 
  isVisible, 
  onClose, 
  initialMessage,
  eventId,
  userLocation,
  city = 'Dubai',
  screen = 'GENERAL'
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const slideAnimation = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (isVisible) {
      // Slide in animation
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Load initial data
      loadSuggestions();
      
      if (initialMessage) {
        sendMessage(initialMessage);
      } else {
        // Add welcome message
        setMessages([{
          id: '1',
          text: "Hi! I'm Cavens AI 🎉 I can help you find amazing events and answer questions about nightlife in your city. What can I help you with?",
          isUser: false,
          timestamp: new Date()
        }]);
      }
    } else {
      // Slide out animation
      Animated.timing(slideAnimation, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, initialMessage, screen, city]);

  const loadSuggestions = async () => {
    try {
      const cityName = typeof city === 'string' ? city : city || 'Dubai';
      const apiUrl = `/api/chatbot/suggestions?city=${cityName}&screen=${screen}`;
      
      
      const response = await apiClient.get(apiUrl);
      
      if (response.data.success) {
        setSuggestions(response.data.data.suggestions);
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const sendMessage = async (text: string = inputText) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Prepare conversation history for the API
      const conversationHistory = messages.map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text,
        timestamp: msg.timestamp.toISOString(),
        type: msg.type
      }));

          // Check if user is authenticated
          const token = await store.get('token');

      const response = await apiClient.post('/api/chatbot/chat', {
        message: text.trim(),
        eventId,
        city: typeof city === 'string' ? city : city || 'Dubai',
        userLocation,
        conversationHistory,
        screen,
        preferences: {
          // Add user preferences here if available
        }
      });

          if (response.data.success) {
            const botMessage: Message = {
              id: (Date.now() + 1).toString(),
              text: response.data.data.response,
              isUser: false,
              type: response.data.data.type,
              timestamp: new Date(),
              showCards: response.data.data.showCards || false,
              cardType: response.data.data.cardType || null,
              cards: response.data.data.cards || null
            };

            setMessages(prev => [...prev, botMessage]);
          } else {
            throw new Error('Failed to get response');
          }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble right now. Please try again later! 😅",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!isVisible) return null;

  return (
    <Animated.View 
      style={[
        styles.container, 
        { transform: [{ translateY: slideAnimation }] }
      ]}
    >
      <LinearGradient
        colors={Colors.gradients.background as [string, string]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.botInfo}>
              <View style={styles.botAvatar}>
                <Text style={styles.botAvatarText}>🤖</Text>
              </View>
              <View>
                <Text style={styles.botName}>Cavens AI</Text>
                <Text style={styles.botStatus}>Online • Ready to help</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
                {messages.map((message) => (
                  <View key={message.id} style={styles.messageWrapper}>
                    <View style={[
                      styles.messageBubble,
                      message.isUser ? styles.userMessage : styles.botMessage
                    ]}>
                      {!message.isUser && (
                        <View style={styles.messageHeader}>
                          <Text style={styles.senderName}>Cavens AI</Text>
                          {message.type !== undefined && (
                            <View style={[
                              styles.typeIndicator,
                              message.type === 2 ? styles.typeFind :
                              message.type === 3 ? styles.typeClubs :
                              message.type === 1 ? styles.typeQuestion :
                              message.type === 4 ? styles.typeClubQuestion :
                              message.type === 5 ? styles.typeBooking :
                              message.type === 6 ? styles.typeDirections :
                              message.type === 7 ? styles.typeMyBookings :
                              message.type === 8 ? styles.typeBookingStatus :
                              message.type === 9 ? styles.typeBookingDetails :
                              message.type === 10 ? styles.typeClubRegistration :
                              message.type === 11 ? styles.typeRefundPolicy :
                              message.type === 12 ? styles.typeCancellationPolicy :
                              message.type === 13 ? styles.typeBookingPolicies :
                              styles.typeGeneral
                            ]}>
                              <Text style={styles.typeText}>
                                {message.type === 2 ? 'Events' :
                                 message.type === 3 ? 'Clubs' :
                                 message.type === 1 ? 'Event Q&A' :
                                 message.type === 4 ? 'Club Q&A' :
                                 message.type === 5 ? 'Booking Help' :
                                 message.type === 6 ? 'Directions' :
                                 message.type === 7 ? 'My Bookings' :
                                 message.type === 8 ? 'Booking Status' :
                                 message.type === 9 ? 'Booking Details' :
                                 message.type === 10 ? 'Club Registration' :
                                 message.type === 11 ? 'Refund Policy' :
                                 message.type === 12 ? 'Cancellation Policy' :
                                 message.type === 13 ? 'Booking Policies' :
                                 'Chat'}
                              </Text>
                            </View>
                          )}
                        </View>
                      )}
                      <Text style={[
                        styles.messageText,
                        message.isUser ? styles.userMessageText : styles.botMessageText
                      ]}>
                        {message.text}
                      </Text>
                      <Text style={[
                        styles.timestamp,
                        message.isUser ? styles.userTimestamp : styles.botTimestamp
                      ]}>
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                    </View>
                    
                    {/* Render cards if available */}
                    {!message.isUser && message.showCards && message.cards && message.cards.length > 0 && (
                      <ChatbotCardsContainer
                        cards={message.cards}
                        cardType={message.cardType || 'events'}
                      />
                    )}
                    
                  </View>
                ))}

            {isLoading && (
              <View style={styles.messageWrapper}>
                <View style={[styles.messageBubble, styles.botMessage, styles.loadingMessage]}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                  <Text style={styles.loadingText}>Cavens AI is thinking...</Text>
                </View>
              </View>
            )}

            {/* Suggestions */}
            {messages.length <= 1 && suggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsTitle}>Try asking:</Text>
                {suggestions.slice(0, 4).map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionChip}
                    onPress={() => handleSuggestionPress(suggestion)}
                  >
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
        </ScrollView>

        {/* Input Area */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask about events, venues, or anything..."
                placeholderTextColor={Colors.textSecondary}
                multiline
                maxLength={500}
                returnKeyType="send"
                onSubmitEditing={() => sendMessage()}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!inputText.trim() || isLoading) && styles.sendButtonDisabled
                ]}
                onPress={() => sendMessage()}
                disabled={!inputText.trim() || isLoading}
              >
                <Text style={styles.sendButtonText}>
                  {isLoading ? '⏳' : '🚀'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.withOpacity.white10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  botInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  botAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botAvatarText: {
    fontSize: 20,
  },
  botName: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  botStatus: {
    color: Colors.success,
    fontSize: 12,
    fontWeight: '500',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.withOpacity.white10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 10,
    flexGrow: 1,
  },
  messageWrapper: {
    marginBottom: 16,
  },
  messageBubble: {
    maxWidth: '85%',
    borderRadius: 20,
    padding: 16,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 8,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.backgroundSecondary,
    borderBottomLeftRadius: 8,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  senderName: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  typeIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  typeFind: {
    backgroundColor: Colors.withOpacity.primary10,
  },
  typeClubs: {
    backgroundColor: 'rgba(0, 102, 204, 0.1)', // Blue for clubs
  },
  typeQuestion: {
    backgroundColor: Colors.withOpacity.primary10,
  },
  typeClubQuestion: {
    backgroundColor: 'rgba(0, 102, 204, 0.1)', // Blue for club questions
  },
  typeBooking: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)', // Green for booking
  },
  typeDirections: {
    backgroundColor: 'rgba(255, 184, 0, 0.1)', // Orange for directions
  },
  typeMyBookings: {
    backgroundColor: 'rgba(156, 39, 176, 0.1)', // Purple for my bookings
  },
  typeBookingStatus: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)', // Green for booking status
  },
  typeBookingDetails: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)', // Blue for booking details
  },
  typeClubRegistration: {
    backgroundColor: 'rgba(156, 39, 176, 0.1)', // Purple for club registration
  },
  typeRefundPolicy: {
    backgroundColor: 'rgba(255, 87, 34, 0.1)', // Orange for refund policy
  },
  typeCancellationPolicy: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)', // Red for cancellation policy
  },
  typeBookingPolicies: {
    backgroundColor: 'rgba(63, 81, 181, 0.1)', // Indigo for booking policies
  },
  typeGeneral: {
    backgroundColor: Colors.withOpacity.white10,
  },
  typeText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '600',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userMessageText: {
    color: Colors.button.text,
  },
  botMessageText: {
    color: Colors.textPrimary,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 6,
  },
  userTimestamp: {
    color: Colors.withOpacity.black60,
    textAlign: 'right',
  },
  botTimestamp: {
    color: Colors.textSecondary,
  },
  loadingMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
  },
  suggestionsContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  suggestionsTitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  suggestionChip: {
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
  },
  suggestionText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: Platform.OS === 'ios' ? 35 : 20,
    borderTopWidth: 1,
    borderTopColor: Colors.withOpacity.white10,
    backgroundColor: Colors.background,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    minHeight: 50,
  },
  textInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 16,
    maxHeight: 100,
    minHeight: 20,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.withOpacity.white10,
  },
  sendButtonText: {
    fontSize: 16,
  },
});

export default Chatbot;

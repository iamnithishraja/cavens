import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions
} from 'react-native';
import { Colors } from '@/constants/Colors';
import ChatbotEventCard from './ChatbotEventCard';
import ChatbotClubCard from './ChatbotClubCard';
import ChatbotBookingCard from './ChatbotBookingCard';

interface ChatbotCardsContainerProps {
  cards: any[];
  cardType: 'events' | 'clubs' | 'mixed';
  title?: string;
}

const { width } = Dimensions.get('window');

const ChatbotCardsContainer: React.FC<ChatbotCardsContainerProps> = ({ 
  cards, 
  cardType, 
  title 
}) => {
  if (!cards || cards.length === 0) {
    return null;
  }

  const getTitle = () => {
    if (title) return title;
    
    switch (cardType) {
      case 'events':
        return `Found ${cards.length} ${cards.length === 1 ? 'event' : 'events'}`;
      case 'clubs':
        return `Found ${cards.length} ${cards.length === 1 ? 'venue' : 'venues'}`;
      case 'mixed':
        return `Found ${cards.length} ${cards.length === 1 ? 'result' : 'results'}`;
      default:
        return 'Results';
    }
  };

  const renderCard = (item: any, index: number) => {
    // Check if this is booking data (has bookingId, bookingStatus, etc.)
    const isBookingData = item.bookingId || item.bookingStatus || item.transactionId;
    
    if (isBookingData) {
      // This is booking data, use ChatbotBookingCard (non-clickable)
      return (
        <ChatbotBookingCard
          key={`booking-${index}`}
          booking={item}
          onPress={() => {
            console.log('Booking card pressed (non-clickable):', item.bookingId);
            // Booking cards are non-clickable in chatbot
          }}
        />
      );
    }

    // For mixed type, determine if it's an event or club
    if (cardType === 'mixed') {
      // Check if item has event-specific properties
      if (item.date || item.time || item.djArtists) {
        return (
          <ChatbotEventCard
            key={`event-${index}`}
            event={item}
          />
        );
      } else {
        return (
          <ChatbotClubCard
            key={`club-${index}`}
            club={item}
            onPress={() => {
              console.log('Club card pressed (non-clickable):', item.name);
              // Club cards are non-clickable in chatbot
            }}
          />
        );
      }
    }

    if (cardType === 'events') {
      console.log('🎯 [CARDS CONTAINER DEBUG] Rendering event card:', {
        eventId: item.id,
        eventName: item.name,
        eventDate: item.date,
        eventTime: item.time,
        venue: item.venue,
        cardType: cardType
      });
      
      return (
        <ChatbotEventCard
          key={`event-${index}`}
          event={item}
        />
      );
    }

    if (cardType === 'clubs') {
      return (
        <ChatbotClubCard
          key={`club-${index}`}
          club={item}
          onPress={() => {
            console.log('Club card pressed (non-clickable):', item.name);
            // Club cards are non-clickable in chatbot
          }}
        />
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{getTitle()}</Text>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {cards.map((card, cardIndex) => 
          card.data ? card.data.map((item: any, itemIndex: number) => 
            renderCard(item, itemIndex)
          ) : null
        )}
      </ScrollView>
      
      <Text style={styles.hint}>
        Swipe to see more {cardType === 'events' ? 'events' : cardType === 'clubs' ? 'venues' : 'results'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  scrollView: {
    marginHorizontal: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  hint: {
    color: Colors.textSecondary,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default ChatbotCardsContainer;

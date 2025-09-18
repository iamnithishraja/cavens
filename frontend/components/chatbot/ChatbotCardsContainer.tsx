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
          />
        );
      }
    }

    if (cardType === 'events') {
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
        {cards.map((card, index) => renderCard(card, index))}
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

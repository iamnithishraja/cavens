import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface AIRecommendation {
  shouldCreateEvent: boolean;
  confidence: number;
  recommendations: string[];
  insights: string[];
  nextSteps: string[];
}

interface AIRecommendationsProps {
  aiRecommendations: AIRecommendation;
}

const AIRecommendations: React.FC<AIRecommendationsProps> = ({ aiRecommendations }) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return Colors.success;
    if (confidence >= 60) return Colors.warning;
    return Colors.error;
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 80) return 'High';
    if (confidence >= 60) return 'Medium';
    return 'Low';
  };

  const getEventDecisionColor = (shouldCreate: boolean) => {
    return shouldCreate ? Colors.success : Colors.warning;
  };

  const getEventDecisionIcon = (shouldCreate: boolean) => {
    return shouldCreate ? 'checkmark-circle' : 'warning';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>AI Recommendations</Text>
      <Text style={styles.subtitle}>Strategic insights powered by AI</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Event Decision Card */}
        <View style={styles.decisionCard}>
          <LinearGradient
            colors={[getEventDecisionColor(aiRecommendations.shouldCreateEvent), getEventDecisionColor(aiRecommendations.shouldCreateEvent) + '80'] as [string, string]}
            style={styles.decisionGradient}
          >
            <View style={styles.decisionHeader}>
              <Ionicons 
                name={getEventDecisionIcon(aiRecommendations.shouldCreateEvent)} 
                size={32} 
                color="white" 
              />
              <View style={styles.decisionText}>
                <Text style={styles.decisionTitle}>
                  {aiRecommendations.shouldCreateEvent ? 'Create Another Event' : 'Wait Before Next Event'}
                </Text>
                <Text style={styles.confidenceText}>
                  Confidence: {getConfidenceText(aiRecommendations.confidence)} ({aiRecommendations.confidence}%)
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Recommendations */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bulb-outline" size={24} color={Colors.primary} />
            <Text style={styles.sectionHeaderText}>Recommendations</Text>
          </View>
          <View style={styles.listContainer}>
            {aiRecommendations.recommendations.map((recommendation, index) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.listText}>{recommendation}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Insights */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="analytics-outline" size={24} color={Colors.blueAccent} />
            <Text style={styles.sectionHeaderText}>Key Insights</Text>
          </View>
          <View style={styles.listContainer}>
            {aiRecommendations.insights.map((insight, index) => (
              <View key={index} style={styles.listItem}>
                <View style={[styles.bulletPoint, { backgroundColor: Colors.blueAccent }]} />
                <Text style={styles.listText}>{insight}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Next Steps */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="arrow-forward-outline" size={24} color={Colors.info} />
            <Text style={styles.sectionHeaderText}>Next Steps</Text>
          </View>
          <View style={styles.listContainer}>
            {aiRecommendations.nextSteps.map((step, index) => (
              <View key={index} style={styles.listItem}>
                <View style={[styles.bulletPoint, { backgroundColor: Colors.info }]} />
                <Text style={styles.listText}>{step}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  decisionCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  decisionGradient: {
    padding: 20,
  },
  decisionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  decisionText: {
    marginLeft: 16,
    flex: 1,
  },
  decisionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  confidenceText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  sectionCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginLeft: 12,
  },
  listContainer: {
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 8,
    marginRight: 12,
  },
  listText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    flex: 1,
  },
});

export default AIRecommendations;

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import PieChart from './PieChart';

interface DemographicsAnalysisProps {
  demographics: {
    ageGroups: {
      data: {
        "18-30": number;
        "30-50": number;
        "50+": number;
      };
      percentages: {
        "18-30": number;
        "30-50": number;
        "50+": number;
      };
    };
    gender: {
      data: {
        male: number;
        female: number;
        other: number;
      };
      percentages: {
        male: number;
        female: number;
        other: number;
      };
    };
    totalUsers: number;
  };
}

const DemographicsAnalysis: React.FC<DemographicsAnalysisProps> = ({ demographics }) => {
  const ageGroupData = [
    {
      key: "18-30" as const,
      label: "18-30",
      description: "Young Adult",
      emoji: "🎉",
      color: "#4F46E5"
    },
    {
      key: "30-50" as const,
      label: "30-50",
      description: "Adult",
      emoji: "👔",
      color: "#059669"
    },
    {
      key: "50+" as const,
      label: "50+",
      description: "Senior",
      emoji: "🎩",
      color: "#DC2626"
    }
  ];

  const genderData = [
    {
      key: "male" as const,
      label: "Male",
      emoji: "👨",
      color: "#3B82F6"
    },
    {
      key: "female" as const,
      label: "Female",
      emoji: "👩",
      color: "#EC4899"
    },
    {
      key: "other" as const,
      label: "Other",
      emoji: "🧑",
      color: "#8B5CF6"
    }
  ];

  const getMaxValue = (data: Record<string, number>) => {
    return Math.max(...Object.values(data));
  };

  const maxAgeValue = getMaxValue(demographics.ageGroups.data);
  const maxGenderValue = getMaxValue(demographics.gender.data);

  if (demographics.totalUsers === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Demographics</Text>
        <View style={styles.emptyCard}>
          <Ionicons name="people-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No Demographics Data</Text>
          <Text style={styles.emptySubtitle}>No user data available for this event</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Demographics Analysis</Text>
      
      {/* Total Users Summary */}
      <View style={styles.summaryCard}>
        <LinearGradient
          colors={Colors.gradients.hero as [string, string]}
          style={styles.summaryGradient}
        >
          <Ionicons name="people-outline" size={24} color="white" />
          <Text style={styles.summaryValue}>{demographics.totalUsers}</Text>
          <Text style={styles.summaryLabel}>Total Attendees</Text>
        </LinearGradient>
      </View>

      {/* Age Groups */}
      <PieChart
        data={demographics.ageGroups.data}
        title="Age Groups Distribution"
        colors={[Colors.blueAccent, Colors.success, Colors.info]}
      />

      {/* Gender Distribution */}
      <PieChart
        data={demographics.gender.data}
        title="Gender Distribution"
        colors={[Colors.blueAccent, Colors.warning, Colors.success]}
      />
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
    marginBottom: 16,
  },
  emptyCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  summaryCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  summaryGradient: {
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.button.text,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.button.text,
    opacity: 0.8,
  },
  subsection: {
    marginBottom: 20,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  chartContainer: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
  },
  chartItem: {
    marginBottom: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  chartEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  chartInfo: {
    flex: 1,
  },
  chartLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  chartDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  chartValues: {
    alignItems: 'flex-end',
  },
  chartCount: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  chartPercentage: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  chartBar: {
    height: 6,
    backgroundColor: Colors.withOpacity.white10,
    borderRadius: 3,
    overflow: 'hidden',
  },
  chartBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  genderContainer: {
    paddingRight: 16,
  },
  genderCard: {
    width: 120,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  genderGradient: {
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
  },
  genderEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  genderLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  genderCount: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  genderPercentage: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  circularProgress: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: Colors.withOpacity.white10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularProgressFill: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
});

export default DemographicsAnalysis;

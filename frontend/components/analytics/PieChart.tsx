import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

interface PieChartProps {
  data: Record<string, number>;
  title: string;
  colors?: string[];
  singleGroupMessage?: string; // Custom message for single group scenarios
}

const PieChart: React.FC<PieChartProps> = ({ 
  data, 
  title, 
  colors = [Colors.primary, Colors.success, Colors.warning, Colors.info, Colors.error],
  singleGroupMessage
}) => {
  const entries = Object.entries(data).filter(([, value]) => value > 0);
  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  
  if (entries.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No data available</Text>
        </View>
      </View>
    );
  }

  // Handle single group scenario - show as a progress card instead of pie chart
  if (entries.length === 1) {
    const [label, value] = entries[0];
    const percentage = Math.round((value / total) * 100);
    
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.singleGroupContainer}>
          <LinearGradient
            colors={[colors[0], colors[0] + '80'] as [string, string]}
            style={styles.singleGroupCard}
          >
            <View style={styles.singleGroupContent}>
              <View style={styles.singleGroupIcon}>
                <Ionicons name="checkmark-circle" size={32} color="white" />
              </View>
              <View style={styles.singleGroupInfo}>
                <Text style={styles.singleGroupLabel}>{label}</Text>
                <Text style={styles.singleGroupValue}>{value} attendees</Text>
                <Text style={styles.singleGroupPercentage}>{percentage}% of total</Text>
                {singleGroupMessage && (
                  <Text style={styles.singleGroupMessage}>{singleGroupMessage}</Text>
                )}
              </View>
            </View>
            <View style={styles.singleGroupProgress}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${percentage}%`,
                      backgroundColor: 'white'
                    }
                  ]} 
                />
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>
    );
  }

  // Calculate angles for each segment
  let currentAngle = 0;
  const segments = entries.map(([label, value], index) => {
    const percentage = (value / total) * 100;
    const angle = (value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle += angle;

    return {
      label,
      value,
      percentage: Math.round(percentage),
      startAngle,
      endAngle,
      color: colors[index % colors.length]
    };
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.chartContainer}>
        {/* Pie Chart Visualization */}
        <View style={styles.pieContainer}>
          <View style={styles.pieChart}>
            {segments.map((segment, index) => {
              const angle = segment.endAngle - segment.startAngle;
              const isLargeArc = angle > 180 ? 1 : 0;
              
              return (
                <View
                  key={segment.label}
                  style={[
                    styles.segment,
                    {
                      backgroundColor: segment.color,
                      transform: [
                        { rotate: `${segment.startAngle}deg` }
                      ]
                    }
                  ]}
                />
              );
            })}
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          {segments.map((segment, index) => (
            <View key={segment.label} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: segment.color }]} />
              <View style={styles.legendText}>
                <Text style={styles.legendLabel}>{segment.label}</Text>
                <Text style={styles.legendValue}>
                  {segment.value} ({segment.percentage}%)
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pieContainer: {
    flex: 1,
    alignItems: 'center',
  },
  pieChart: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.withOpacity.white10,
    position: 'relative',
    overflow: 'hidden',
  },
  segment: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  legend: {
    flex: 1,
    paddingLeft: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    flex: 1,
  },
  legendLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  legendValue: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  // Single group styles
  singleGroupContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  singleGroupCard: {
    padding: 20,
    borderRadius: 16,
  },
  singleGroupContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  singleGroupIcon: {
    marginRight: 16,
  },
  singleGroupInfo: {
    flex: 1,
  },
  singleGroupLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  singleGroupValue: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    marginBottom: 2,
  },
  singleGroupPercentage: {
    fontSize: 12,
    color: 'white',
    opacity: 0.8,
  },
  singleGroupMessage: {
    fontSize: 11,
    color: 'white',
    opacity: 0.7,
    fontStyle: 'italic',
    marginTop: 4,
  },
  singleGroupProgress: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});

export default PieChart;

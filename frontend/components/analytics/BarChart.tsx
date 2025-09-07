import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface BarChartProps {
  data: Record<string, number>;
  title: string;
  color?: string;
  formatValue?: (value: number) => string;
  maxBars?: number;
}

const BarChart: React.FC<BarChartProps> = ({ 
  data, 
  title, 
  color = Colors.primary,
  formatValue = (value) => value.toString(),
  maxBars = 7
}) => {
  const entries = Object.entries(data);
  const maxValue = Math.max(...entries.map(([, value]) => value));
  
  // Sort by value descending and limit to maxBars
  const sortedEntries = entries
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxBars);

  const formatLabel = (label: string) => {
    // Format date labels
    if (label.includes('-')) {
      const date = new Date(label);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    // Format other labels
    return label.length > 10 ? label.substring(0, 10) + '...' : label;
  };

  if (sortedEntries.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No data available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chartContainer}>
        {sortedEntries.map(([label, value], index) => {
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
          
          return (
            <View key={label} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                <View style={styles.barBackground}>
                  <View 
                    style={[
                      styles.bar, 
                      { 
                        height: `${Math.max(percentage, 5)}%`,
                        backgroundColor: color
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.barValue}>{formatValue(value)}</Text>
              </View>
              <Text style={styles.barLabel}>{formatLabel(label)}</Text>
            </View>
          );
        })}
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
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingHorizontal: 8,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  barWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
  barBackground: {
    width: '80%',
    height: '100%',
    backgroundColor: Colors.withOpacity.white10,
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
  barValue: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 4,
    textAlign: 'center',
  },
  barLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    maxWidth: '100%',
  },
});

export default BarChart;

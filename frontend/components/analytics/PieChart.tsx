import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface PieChartProps {
  data: Record<string, number>;
  title: string;
  colors?: string[];
}

const PieChart: React.FC<PieChartProps> = ({ 
  data, 
  title, 
  colors = [Colors.primary, Colors.success, Colors.warning, Colors.info, Colors.error]
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
});

export default PieChart;

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import BarChart from './BarChart';
import { TicketTypeAnalysis } from '@/types/analytics';

interface TicketPerformanceProps {
  ticketTypes: TicketTypeAnalysis[];
}

const TicketPerformance: React.FC<TicketPerformanceProps> = ({ ticketTypes }) => {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `AED ${(amount / 1000).toFixed(1)}k`;
    }
    return `AED ${amount}`;
  };

  // Create data for ticket performance chart
  const ticketPerformanceData = ticketTypes.reduce((acc, ticket) => {
    acc[ticket.name] = ticket.quantitySold;
    return acc;
  }, {} as Record<string, number>);

  if (ticketTypes.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Ticket Performance</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No ticket sales data available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Ticket Performance</Text>
      <Text style={styles.subtitle}>Tickets sold by type</Text>
      <BarChart
        data={ticketPerformanceData}
        title=""
        color="#6366F1"
        formatValue={(value) => `${value} sold`}
        maxBars={5}
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

export default TicketPerformance;

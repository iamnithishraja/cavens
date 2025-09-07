import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { TicketTypeAnalysis } from '@/types/analytics';

interface TicketTypesAnalysisProps {
  ticketTypes: TicketTypeAnalysis[];
}

const TicketTypesAnalysis: React.FC<TicketTypesAnalysisProps> = ({ ticketTypes }) => {
  const formatCurrency = (amount: number) => {
    return `AED ${amount.toLocaleString()}`;
  };

  const getTotalTickets = () => {
    return ticketTypes.reduce((sum, ticket) => sum + ticket.quantitySold, 0);
  };

  const getTotalRevenue = () => {
    return ticketTypes.reduce((sum, ticket) => sum + ticket.revenue, 0);
  };

  const totalTickets = getTotalTickets();
  const totalRevenue = getTotalRevenue();

  if (ticketTypes.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Ticket Types</Text>
        <View style={styles.emptyCard}>
          <Ionicons name="ticket-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No Ticket Sales</Text>
          <Text style={styles.emptySubtitle}>No tickets have been sold for this event yet</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Ticket Types Analysis</Text>
      
      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <LinearGradient
            colors={Colors.gradients.hero as [string, string]}
            style={styles.summaryGradient}
          >
            <Ionicons name="ticket-outline" size={24} color="white" />
            <Text style={styles.summaryValue}>{totalTickets}</Text>
            <Text style={styles.summaryLabel}>Total Sold</Text>
          </LinearGradient>
        </View>
        
        <View style={styles.summaryCard}>
          <LinearGradient
            colors={['#00FF88', '#00CC6A'] as [string, string]}
            style={styles.summaryGradient}
          >
            <Ionicons name="cash-outline" size={24} color="white" />
            <Text style={styles.summaryValue}>{formatCurrency(totalRevenue)}</Text>
            <Text style={styles.summaryLabel}>Total Revenue</Text>
          </LinearGradient>
        </View>
      </View>

      {/* Ticket Types List */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.ticketsContainer}
      >
        {ticketTypes.map((ticket, index) => {
          const percentage = totalTickets > 0 ? Math.round((ticket.quantitySold / totalTickets) * 100) : 0;
          
          return (
            <View key={index} style={styles.ticketCard}>
              <LinearGradient
                colors={[Colors.backgroundSecondary, Colors.backgroundTertiary]}
                style={styles.ticketGradient}
              >
                <View style={styles.ticketHeader}>
                  <Text style={styles.ticketName} numberOfLines={2}>{ticket.name}</Text>
                  <Text style={styles.ticketPrice}>{formatCurrency(ticket.price)}</Text>
                </View>
                
                <View style={styles.ticketStats}>
                  <View style={styles.statRow}>
                    <Ionicons name="ticket-outline" size={16} color={Colors.primary} />
                    <Text style={styles.statValue}>{ticket.quantitySold}</Text>
                    <Text style={styles.statLabel}>sold</Text>
                  </View>
                  
                  <View style={styles.statRow}>
                    <Ionicons name="cash-outline" size={16} color={Colors.success} />
                    <Text style={styles.statValue}>{formatCurrency(ticket.revenue)}</Text>
                    <Text style={styles.statLabel}>revenue</Text>
                  </View>
                  
                  <View style={styles.statRow}>
                    <Ionicons name="pie-chart-outline" size={16} color={Colors.warning} />
                    <Text style={styles.statValue}>{percentage}%</Text>
                    <Text style={styles.statLabel}>of total</Text>
                  </View>
                </View>
                
                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${percentage}%` }
                      ]} 
                    />
                  </View>
                </View>
              </LinearGradient>
            </View>
          );
        })}
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
  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  summaryGradient: {
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.button.text,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.button.text,
    opacity: 0.8,
  },
  ticketsContainer: {
    paddingRight: 16,
  },
  ticketCard: {
    width: 200,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  ticketGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
  },
  ticketHeader: {
    marginBottom: 12,
  },
  ticketName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  ticketPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  ticketStats: {
    gap: 8,
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.withOpacity.white10,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
});

export default TicketTypesAnalysis;

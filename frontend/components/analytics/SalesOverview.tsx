import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface SalesOverviewProps {
  sales: {
    totalSales: number;
    totalRevenue: number;
    totalTicketsSold: number;
    totalOrders: number;
    paidOrders: number;
    averageSpentPerCustomer: number;
    averageTicketsPerOrder: number;
    conversionRate: number;
  };
}

const SalesOverview: React.FC<SalesOverviewProps> = ({ sales }) => {
  const formatCurrency = (amount: number) => {
    return `AED ${amount.toLocaleString()}`;
  };

  const salesData = [
    {
      title: 'Total Revenue',
      value: formatCurrency(sales.totalRevenue),
      icon: 'wallet-outline' as const,
      color: Colors.blueAccent, // Blue
      description: 'Paid orders only'
    },
    {
      title: 'Tickets Sold',
      value: sales.totalTicketsSold.toString(),
      icon: 'ticket-outline' as const,
      color: Colors.success, // Green
      description: 'Total tickets'
    },
    {
      title: 'Avg. Spent',
      value: formatCurrency(sales.averageSpentPerCustomer),
      icon: 'person-outline' as const,
      color: Colors.info, // Info Blue
      description: 'Per customer'
    },
    {
      title: 'Conversion',
      value: `${sales.conversionRate}%`,
      icon: 'trending-up-outline' as const,
      color: Colors.warning, // Orange
      description: 'Paid orders rate'
    }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Sales Overview</Text>
      <View style={styles.grid}>
        {salesData.map((item, index) => (
          <View key={index} style={styles.card}>
            <LinearGradient
              colors={[Colors.backgroundSecondary, Colors.backgroundTertiary]}
              style={styles.cardGradient}
            >
              <View style={styles.cardContent}>
                <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name={item.icon} size={24} color={item.color} />
                </View>
                <View style={styles.textContent}>
                  <Text style={styles.value}>{item.value}</Text>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.description}>{item.description}</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        ))}
      </View>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContent: {
    flex: 1,
  },
  value: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    color: Colors.textMuted,
  },
});

export default SalesOverview;

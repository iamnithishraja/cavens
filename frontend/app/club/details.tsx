import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import ClubDetailsForm from "@/components/screens/ClubDetailsScreen";
import { store } from '@/utils';

export default function ClubDetailsRoute() {
  const [club, setClub] = useState<any>(null);

  useEffect(() => {
    loadClubData();
  }, []);

  const loadClubData = async () => {
    const storedClubData = await store.get('clubData');
    if (storedClubData) {
      setClub(JSON.parse(storedClubData));
    }
  };

  // If user has a club and it's pending approval, show pending message
  if (club && club.status === 'pending') {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={Colors.gradients.background as [string, string]}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <LinearGradient
              colors={Colors.gradients.card as [string, string]}
              style={styles.card}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <LinearGradient
                colors={Colors.gradients.blueGlow as [string, string]}
                style={styles.glowOverlay}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0.3 }}
              />
              <View style={styles.cardContent}>
                <Text style={styles.title}>Pending Approval</Text>
                <Text style={styles.subtitle}>Your club is under review</Text>
                <Text style={styles.description}>
                  Thank you for submitting your club details. Our admin team is currently reviewing your application.
                  You will be notified once your club is approved.
                </Text>
                <Text style={styles.clubName}>{club.name}</Text>
              </View>
            </LinearGradient>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Otherwise show the club details form
  return <ClubDetailsForm />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.borderBlue,
    shadowColor: Colors.accentBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    opacity: 0.3,
  },
  cardContent: {
    padding: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.accentBlue,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  clubName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.accentYellow,
  },
});
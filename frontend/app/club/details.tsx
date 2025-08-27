import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import ClubDetailsForm from "@/components/screens/ClubDetailsScreen";
import { store } from '@/utils';

const { height } = Dimensions.get('window');

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
  
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        {/* Subtle Pattern Overlay */}
        <View style={styles.patternOverlay}>
          <LinearGradient
            colors={['rgba(43, 44, 20, 0.5)', 'transparent', 'transparent']}
            locations={[0.1, 0.3, 1]}
            style={styles.topGlow}
          />
        </View>

        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <View style={styles.card}>
              <View style={styles.cardContent}>
                {/* Status Icon */}
                <View style={styles.iconContainer}>
                  <View style={styles.pendingIconBorder}>
                    <View style={styles.pendingIcon}>
                      <Text style={styles.pendingIconText}>⏳</Text>
                    </View>
                  </View>
                </View>

                {/* Main Content */}
                <View style={styles.textContent}>
                  <Text style={styles.title}>Pending Approval</Text>
                  
                  <View style={styles.subtitleContainer}>
                    <View style={styles.subtitleDot} />
                    <Text style={styles.subtitle}>Your club is under review</Text>
                  </View>

                  <Text style={styles.description}>
                    Thank you for submitting your club details. Our admin team is currently reviewing your application.
                    You will be notified once your club is approved.
                  </Text>

                  {/* Club Name Badge */}
                  
                </View>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  

  // Otherwise show the club details form
  // return <ClubDetailsForm />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  patternOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  topGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.5,
    borderRadius: 0,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
  },
  card: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 40,
    alignItems: 'center',
  },

  // Icon Section
  iconContainer: {
    marginBottom: 32,
  },
  pendingIconBorder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.warning,
  },
  pendingIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingIconText: {
    fontSize: 24,
  },

  // Text Content
  textContent: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },
  subtitleDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.warning,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.warning,
    letterSpacing: 0.3,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
    fontWeight: '400',
    maxWidth: 280,
  },

  // Club Badge
  clubBadgeContainer: {
    width: '100%',
    alignItems: 'center',
  },
  clubBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundTertiary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  clubDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  clubName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
});
import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import Background from "../common/Background";
import BookingActions from "@/components/event/BookingActions";
import CurrencyAED from "@/components/event/CurrencyAED";
import type { EventItem } from "@/components/event/types";

type Props = {
  event: EventItem;
  onGoBack?: () => void;
};

const EventDetailsScreen: React.FC<Props> = ({ event, onGoBack }) => {
  const lowestTicket = useMemo(() => Math.min(...event.tickets.map((t) => t.price)), [event.tickets]);

  return (
    <Background>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Go Back Button */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={onGoBack}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[Colors.surfaceElevated, Colors.surface]}
            style={styles.backButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Image 
              source={{ uri: "https://img.icons8.com/ios-filled/50/FFFFFF/back.png" }} 
              style={styles.backIcon} 
            />
            <Text style={styles.backText}>Back</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.heroImage}>
          <Image source={{ uri: event.coverImage }} style={styles.coverImage} />
        </View>
        <View style={styles.pad}>
          <Text style={styles.name}>{event.name}</Text>
          <Text style={styles.meta}>{event.djArtists}</Text>
          <Text style={styles.meta}>{event.date} • {event.time}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.pricePrefix}>From</Text>
            <CurrencyAED amount={lowestTicket} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.body}>{event.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Guest Experience</Text>
            <Text style={styles.body}>Dress Code: {event.guestExperience.dressCode}</Text>
            <Text style={styles.body}>Entry Rules: {event.guestExperience.entryRules}</Text>
            <Text style={styles.body}>Parking: {event.guestExperience.parkingInfo}</Text>
            <Text style={styles.body}>Accessibility: {event.guestExperience.accessibilityInfo}</Text>
          </View>

          {event.happyHourTimings && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Happy Hour</Text>
              <Text style={styles.body}>{event.happyHourTimings}</Text>
            </View>
          )}

          <BookingActions onBookTickets={() => {}} onBookTable={() => {}} />
        </View>
      </ScrollView>
    </Background>
  );
};

const styles = StyleSheet.create({
  container: { paddingBottom: 24 },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    zIndex: 1000,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderBlue,
    shadowColor: Colors.accentBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  backButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
    tintColor: Colors.textPrimary,
  },
  backText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  heroImage: { width: "100%", height: 250, backgroundColor: Colors.surfaceElevated },
  coverImage: { width: "100%", height: "100%" },
  pad: { paddingHorizontal: 16, paddingTop: 12, gap: 8 },
  name: { color: Colors.textPrimary, fontWeight: "800", fontSize: 22 },
  meta: { color: Colors.textSecondary },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  pricePrefix: { color: Colors.textSecondary, fontWeight: "700" },
  section: { marginTop: 16, gap: 8 },
  sectionTitle: { color: Colors.textPrimary, fontWeight: "800", fontSize: 16 },
  body: { color: Colors.textSecondary, lineHeight: 20 },
});

export default EventDetailsScreen;



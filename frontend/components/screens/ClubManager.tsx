import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";

// Import existing components
import { SafeAreaView } from "react-native-safe-area-context";
import EventsTicketingSection from "./ClubManager/EventsTicketingSection";
import MenuSection from "./ClubManager/MenuSection";
import GalleryMediaSection from "./ClubManager/GalleryMediaSection";
import GuestExperienceSection from "./ClubManager/GuestExperienceSection";
import { ClubEvent, TicketType, MenuItemFull, MenuCategoryId } from "./ClubManager/types";
import apiClient from "@/app/api/client";

// Basics removed per request; using shared types

const ClubManagementForm = () => {
  // Basics removed per request

  // Events & Ticketing
  const [events, setEvents] = useState<ClubEvent[]>([]);

  // Menu Items (interactive list with categories)
  const [menuItems, setMenuItems] = useState<MenuItemFull[]>([]);
  const [happyHourTimings, setHappyHourTimings] = useState("");

  // Gallery & Media
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);
  const [promoVideos, setPromoVideos] = useState<string[]>([]);

  // Guest Experience
  const [dressCode, setDressCode] = useState("");
  const [entryRules, setEntryRules] = useState("");
  const [tableLayoutMap, setTableLayoutMap] = useState<string | null>(null);
  const [parkingInfo, setParkingInfo] = useState("");
  const [accessibilityInfo, setAccessibilityInfo] = useState("");


  const [submitting, setSubmitting] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);

  const addEvent = () => {
    const newEvent: ClubEvent = {
      id: Date.now().toString(),
      name: "",
      date: "",
      time: "",
      djArtists: "",
      description: "",
      ticketTypes: [],
      coverImage: null,
    };
    setEvents([...events, newEvent]);
  };

  // Ensure exactly one event instance is present by default
  useEffect(() => {
    if (events.length === 0) {
      const defaultEvent: ClubEvent = {
        id: Date.now().toString(),
        name: "",
        date: "",
        time: "",
        djArtists: "",
        description: "",
        ticketTypes: [],
        coverImage: null,
      };
      setEvents([defaultEvent]);
    } else if (events.length > 1) {
      setEvents([events[0]]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateEvent = (id: string, field: keyof ClubEvent, value: any) => {
    setEvents(
      events.map((event) =>
        event.id === id ? { ...event, [field]: value } : event
      )
    );
  };

  const removeEvent = (id: string) => {
    setEvents(events.filter((event) => event.id !== id));
  };

  const addTicketToEvent = (eventId: string) => {
    const newTicket: TicketType = {
      id: Date.now().toString(),
      name: "",
      price: "",
      description: "",
      quantity: "",
    };

    setEvents(
      events.map((event) =>
        event.id === eventId
          ? { ...event, ticketTypes: [...event.ticketTypes, newTicket] }
          : event
      )
    );
  };

  const updateEventTicket = (
    eventId: string,
    ticketId: string,
    field: keyof TicketType,
    value: string
  ) => {
    setEvents(
      events.map((event) =>
        event.id === eventId
          ? {
              ...event,
              ticketTypes: event.ticketTypes.map((ticket) =>
                ticket.id === ticketId ? { ...ticket, [field]: value } : ticket
              ),
            }
          : event
      )
    );
  };

  const removeEventTicket = (eventId: string, ticketId: string) => {
    setEvents(
      events.map((event) =>
        event.id === eventId
          ? {
              ...event,
              ticketTypes: event.ticketTypes.filter(
                (ticket) => ticket.id !== ticketId
              ),
            }
          : event
      )
    );
  };

  const addMenuItem = () => {
    const newItem: MenuItemFull = {
      id: Date.now().toString(),
      name: "",
      price: "",
      description: "",
      category: "Appetizers & Snacks",
    };
    setMenuItems((prev) => [newItem, ...prev]);
  };

  const updateMenuItem = (
    itemId: string,
    field: keyof MenuItemFull,
    value: string | MenuCategoryId
  ) => {
    setMenuItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, [field]: value } : i)));
  };

  const removeMenuItem = (itemId: string) => {
    setMenuItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  // Operating hours removed

  const handleSubmit = async () => {
    // Validation logic would go here
    setSubmitting(true);

    // Since we only have one event, structure all data under it
    const eventData = {
      ...events[0],
      ticketTypes: events[0].ticketTypes.map((ticket) => ({
        ...ticket,
        price: ticket.price.toString(),
        quantity: ticket.quantity.toString(),
      })),
      menuItems: menuItems.map((item) => ({
        ...item,
        price: item.price.toString(),
      })),
      happyHourTimings,
      galleryPhotos: galleryPhotos,
      promoVideos: promoVideos,
      guestExperience: {
        dressCode,
        entryRules,
        tableLayoutMap,
        parkingInfo,
        accessibilityInfo,
      },
    };

    const payload = {
      events: [eventData],
    };

    try {
      await apiClient.post("/api/club/manager", payload);
      Alert.alert("Success", "Event created successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to create event");
    } finally {
      setSubmitting(false);
    }
  };

  const sections = ["Events & Ticketing", "Menu", "Gallery & Media", "Guest Info"];

  // Basics section removed

  const renderTicketingSection = () => (
    <>
      <EventsTicketingSection
        events={events}
        onAddEvent={addEvent}
        onRemoveEvent={removeEvent}
        onUpdateEvent={updateEvent as (eventId: string, field: any, value: any) => void}
        onAddTicket={addTicketToEvent}
        onUpdateTicket={updateEventTicket as (
          eventId: string,
          ticketId: string,
          field: any,
          value: string
        ) => void}
        onRemoveTicket={removeEventTicket}
      />
      
      {currentSection === 0 && (
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => setCurrentSection(1)}
        >
          <LinearGradient
            colors={[Colors.accentBlue, "#4A90E2"]}
            style={styles.continueGradient}
          >
            <Text style={styles.continueText}>Continue</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </>
  );

  const renderMenuSection = () => (
    <>
      <MenuSection
        items={menuItems}
        onAddItem={addMenuItem}
        onUpdateItem={updateMenuItem}
        onRemoveItem={removeMenuItem}
        happyHourTimings={happyHourTimings}
        setHappyHourTimings={setHappyHourTimings}
      />
      
      {currentSection === 1 && (
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => setCurrentSection(2)}
        >
          <LinearGradient
            colors={[Colors.accentBlue, "#4A90E2"]}
            style={styles.continueGradient}
          >
            <Text style={styles.continueText}>Continue</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </>
  );

  const renderGallerySection = () => (
    <>
      <GalleryMediaSection
        galleryPhotos={galleryPhotos}
        setGalleryPhotos={setGalleryPhotos}
        promoVideos={promoVideos}
        setPromoVideos={setPromoVideos}
      />
      
      {currentSection === 2 && (
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => setCurrentSection(3)}
        >
          <LinearGradient
            colors={[Colors.accentBlue, "#4A90E2"]}
            style={styles.continueGradient}
          >
            <Text style={styles.continueText}>Continue</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </>
  );

  const renderGuestExperienceSection = () => (
    <GuestExperienceSection
      dressCode={dressCode}
      setDressCode={setDressCode}
      entryRules={entryRules}
      setEntryRules={setEntryRules}
      tableLayoutMap={tableLayoutMap}
      setTableLayoutMap={setTableLayoutMap}
      parkingInfo={parkingInfo}
      setParkingInfo={setParkingInfo}
      accessibilityInfo={accessibilityInfo}
      setAccessibilityInfo={setAccessibilityInfo}

    />
  );

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 0:
        return renderTicketingSection();
      case 1:
        return renderMenuSection();
      case 2:
        return renderGallerySection();
      case 3:
        return renderGuestExperienceSection();
      default:
        return renderTicketingSection();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Section Navigation */}
        <View style={styles.sectionNav}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.navScroll} // Ensure proper scrolling behavior
          >
            {sections.map((section, index) => (
              <TouchableOpacity
                key={section}
                style={[
                  styles.navItem,
                  currentSection === index && styles.navItemActive,
                ]}
                onPress={() => {
                  console.log(`Navigating to section: ${section}`); // Debug log
                  setCurrentSection(index); // Update currentSection state
                }}
              >
                <Text
                  style={[
                    styles.navText,
                    currentSection === index && styles.navTextActive,
                  ]}
                >
                  {section}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Render Current Section */}
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentContainer}>
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
                {renderCurrentSection()}

                {/* Submit Button */}
                <View style={styles.actionSection}>
                  {currentSection === sections.length - 1 && (
                    <TouchableOpacity
                      disabled={submitting}
                      style={styles.buttonWrapper}
                      onPress={handleSubmit}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={[Colors.accentYellow, "#F7C84A"]}
                        style={styles.button}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Text style={styles.buttonText}>
                          {submitting ? "Creating..." : "Create Event"}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}

                  <View style={styles.statusNote}>
                    <View style={styles.statusNoteDot} />
                    <Text style={styles.statusNoteText}>
                      Your club details will be reviewed before going live
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0, // Adjust for Android status bar
  },
  keyboardContainer: {
    flex: 1,
    paddingBottom: 20, // Ensure content doesn't overlap with the bottom area
  },
  sectionNav: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderBlue,
    zIndex: 1, // Ensure navigation is above other elements
  },
  navScroll: {
    flexGrow: 0, // Prevent stretching
  },
  navItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderBlue,
    elevation: 2, // Add elevation to make it clickable
  },
  navItemActive: {
    backgroundColor: Colors.accentBlue,
    borderColor: Colors.accentBlue,
  },
  navText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  navTextActive: {
    color: Colors.textPrimary,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 20, // Add padding to ensure navigation is not overlapped
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
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
    position: "relative",
    overflow: "hidden",
  },
  glowOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    opacity: 0.3,
  },
  cardContent: {
    padding: 24,
    paddingTop: 32,
  },
  actionSection: {
    marginTop: 32,
    gap: 20,
  },
  buttonWrapper: {
    borderRadius: 16,
    shadowColor: Colors.accentYellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  button: {
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
  buttonText: {
    color: Colors.button.text,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  statusNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  statusNoteDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.accentBlue,
  },
  statusNoteText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  continueBtn: {
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  continueGradient: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  continueText: {
    color: Colors.button.text,
    fontWeight: "800",
    fontSize: 16,
  },
});

export default ClubManagementForm;

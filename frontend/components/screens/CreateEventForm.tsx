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
import { Colors } from "@/constants/Colors";

// Import existing components
import { SafeAreaView } from "react-native-safe-area-context";
import EventsTicketingSection from "./ClubManager/EventsTicketingSection";
import MenuSection from "./ClubManager/MenuSection";
import GalleryMediaSection from "./ClubManager/GalleryMediaSection";
import GuestExperienceSection from "./ClubManager/GuestExperienceSection";
import Header from "@/components/ui/ClubDetailsHeader";
import { ClubEvent, TicketType, MenuItemFull, MenuCategoryId } from "./ClubManager/types";
import apiClient from "@/app/api/client";
import { uploadImage, uploadVideo } from "@/utils/fileUpload";

// Basics removed per request; using shared types

const CreateEventForm = () => {
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
      itemImage: "",
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

  const validateForm = (): string[] => {
    const errors: string[] = [];
    const event = events[0];

    if (!event.name?.trim()) {
      errors.push("Event name is required");
    }
    if (!event.date?.trim()) {
      errors.push("Event date is required");
    }
    if (!event.time?.trim()) {
      errors.push("Event time is required");
    }
    if (!event.description?.trim()) {
      errors.push("Event description is required");
    }

    // Validate tickets
    if (event.ticketTypes && event.ticketTypes.length > 0) {
      event.ticketTypes.forEach((ticket, index) => {
        if (!ticket.name?.trim()) {
          errors.push(`Ticket ${index + 1} name is required`);
        }
        if (!ticket.price?.trim()) {
          errors.push(`Ticket ${index + 1} price is required`);
        }
        if (!ticket.quantity?.trim()) {
          errors.push(`Ticket ${index + 1} quantity is required`);
        }
      });
    }

    // Validate menu items
    if (menuItems && menuItems.length > 0) {
      menuItems.forEach((item, index) => {
        if (!item.name?.trim()) {
          errors.push(`Menu item ${index + 1} name is required`);
        }
        if (!item.price?.trim()) {
          errors.push(`Menu item ${index + 1} price is required`);
        }
        if (!item.category?.trim()) {
          errors.push(`Menu item ${index + 1} category is required`);
        }
      });
    }

    return errors;
  };

  const handleSubmit = async () => {
    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      Alert.alert("Validation Error", validationErrors.join("\n"));
      return;
    }

    setSubmitting(true);

    try {
      // Upload cover image if exists
      let coverImageUrl = "";
      if (events[0].coverImage && typeof events[0].coverImage === 'object') {
        try {
          const fileName = `event-cover-${Date.now()}.jpg`;
          coverImageUrl = await uploadImage(events[0].coverImage as File, fileName);
        } catch (error) {
          console.error("Failed to upload cover image:", error);
          Alert.alert("Warning", "Failed to upload cover image, but continuing...");
        }
      } else if (typeof events[0].coverImage === 'string') {
        coverImageUrl = events[0].coverImage;
      }

      // Upload gallery photos (only if they're File objects, not URLs)
      const uploadedGalleryPhotos: string[] = [];
      for (const photo of galleryPhotos) {
        if (typeof photo === 'object' && photo !== null) {
          try {
            const fileName = `gallery-${Date.now()}-${Math.random()}.jpg`;
            const photoUrl = await uploadImage(photo as File, fileName);
            uploadedGalleryPhotos.push(photoUrl);
          } catch (error) {
            console.error("Failed to upload gallery photo:", error);
          }
        } else if (typeof photo === 'string') {
          // Already a URL, keep as is
          uploadedGalleryPhotos.push(photo);
        }
      }

      // Upload promo videos (only if they're File objects, not URLs)
      const uploadedPromoVideos: string[] = [];
      for (const video of promoVideos) {
        if (typeof video === 'object' && video !== null) {
          try {
            const fileName = `promo-${Date.now()}-${Math.random()}.mp4`;
            const videoUrl = await uploadVideo(video as File, fileName);
            uploadedPromoVideos.push(videoUrl);
          } catch (error) {
            console.error("Failed to upload promo video:", error);
          }
        } else if (typeof video === 'string') {
          // Already a URL, keep as is
          uploadedPromoVideos.push(video);
        }
      }

      // Upload menu item images
      const processedMenuItems = await Promise.all(
        menuItems.map(async (item) => {
          let itemImageUrl = item.itemImage;
          if (item.itemImage && typeof item.itemImage === 'object') {
            try {
              const fileName = `menu-${Date.now()}-${Math.random()}.jpg`;
              itemImageUrl = await uploadImage(item.itemImage as File, fileName);
            } catch (error) {
              console.error("Failed to upload menu item image:", error);
            }
          }
          return {
            ...item,
            price: item.price.toString(),
            itemImage: itemImageUrl,
          };
        })
      );

      // Since we only have one event, structure all data under it
      const eventData = {
        ...events[0],
        coverImage: coverImageUrl || events[0].coverImage,
        tickets: events[0].ticketTypes.map((ticket) => ({
          ...ticket,
          price: ticket.price.toString(),
          quantity: ticket.quantity.toString(),
        })),
        menuItems: processedMenuItems,
        happyHourTimings,
        galleryPhotos: uploadedGalleryPhotos,
        promoVideos: uploadedPromoVideos,
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

      const response = await apiClient.post("/api/club/event", payload);
      
      if (response.data.success) {
        Alert.alert("Success", "Event created successfully!");
        // Reset form or navigate away
      } else {
        Alert.alert("Error", response.data.message || "Failed to create event");
      }
    } catch (error: any) {
      console.error("Error creating event:", error);
      const errorMessage = error.response?.data?.message || "Failed to create event";
      Alert.alert("Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const sections = ["Events & Ticketing", "Menu", "Gallery & Media", "Guest Info"];

  // Basics section removed

  const renderTicketingSection = () => (
    <View>
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
          activeOpacity={0.8}
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderMenuSection = () => (
    <View>
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
          activeOpacity={0.8}
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderGallerySection = () => (
    <View>
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
          activeOpacity={0.8}
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      )}
    </View>
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
      <Header title="Add Event" />
      
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Section Navigation */}
        <View style={styles.sectionNav}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.navScroll}
          >
            {sections.map((section, index) => (
              <TouchableOpacity
                key={section}
                style={[
                  styles.navItem,
                  currentSection === index && styles.navItemActive,
                ]}
                onPress={() => setCurrentSection(index)}
                activeOpacity={0.7}
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
            {renderCurrentSection()}

            {/* Submit Button */}
            {currentSection === sections.length - 1 && (
              <View style={styles.submitSection}>
                <TouchableOpacity
                  disabled={submitting}
                  style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  activeOpacity={0.8}
                >
                  <Text style={styles.submitButtonText}>
                    {submitting ? "Creating..." : "Create Event"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
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
  },
  keyboardContainer: {
    flex: 1,
  },
  sectionNav: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
  },
  navScroll: {
    flexGrow: 0,
  },
  navItem: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
  },
  navItemActive: {
    backgroundColor: Colors.primary,
  },
  navText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  navTextActive: {
    color: Colors.button.text,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 8,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  continueBtn: {
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    alignSelf: "center",
    paddingHorizontal: 32,
  },
  continueText: {
    color: Colors.button.text,
    fontWeight: "700",
    fontSize: 16,
  },
  submitSection: {
    marginTop: 32,
  },
  submitButton: {
    height: 56,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 28,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.textMuted,
  },
  submitButtonText: {
    color: Colors.button.text,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});

export default CreateEventForm;
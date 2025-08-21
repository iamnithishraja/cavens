import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import TextField from "../../ui/TextField";
import TextArea from "../../ui/TextArea";
import ImageUploader from "../../ui/ImageUploader";
import * as ImagePicker from "expo-image-picker";
import { ClubEvent, TicketType } from "@/components/screens/ClubManager/types";
import DateTimePicker from "@react-native-community/datetimepicker";

type Props = {
  events: ClubEvent[];
  onAddEvent: () => void;
  onRemoveEvent: (eventId: string) => void;
  onUpdateEvent: (eventId: string, field: keyof ClubEvent, value: any) => void;
  onAddTicket: (eventId: string) => void;
  onUpdateTicket: (
    eventId: string,
    ticketId: string,
    field: keyof TicketType,
    value: string
  ) => void;
  onRemoveTicket: (eventId: string, ticketId: string) => void;
};

const EventsTicketingSection: React.FC<Props> = ({
  events,
  onAddEvent,
  onRemoveEvent,
  onUpdateEvent,
  onAddTicket,
  onUpdateTicket,
  onRemoveTicket,
}) => {
  const [datePickerFor, setDatePickerFor] = useState<string | null>(null);
  const [timePickerFor, setTimePickerFor] = useState<{ id: string; kind: "time" } | null>(null);

  const formatDate = (d: Date) => d.toISOString().split("T")[0];
  const formatTime = (d: Date) => {
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Events & Ticketing</Text>

      <View style={styles.sectionSpacing}>
        <View style={styles.ticketHeader}>
          <Text style={styles.label}>Upcoming Events</Text>
        </View>

        {events.map((event, index) => (
          <View key={event.id} style={styles.eventCard}>
            <LinearGradient
              colors={Colors.gradients.card as [string, string]}
              style={styles.eventCardGradient}
            >
              <View style={styles.ticketCardHeader}>
                <Text style={styles.ticketCardTitle}>Event</Text>
              </View>

              <View style={styles.eventBasicInfo}>
                <TextField
                  label="Event Name"
                  value={event.name}
                  onChangeText={(value) => onUpdateEvent(event.id, "name", value)}
                  placeholder="e.g. Saturday Night Vibes, DJ Nucleya Live"
                />

                <View style={styles.ticketRow}>
                  <TouchableOpacity
                    style={[styles.ticketInput, styles.pickerField]}
                    onPress={() => setDatePickerFor(event.id)}
                  >
                    <Text style={styles.pickerLabel}>Date</Text>
                    <Text style={styles.pickerValue}>{event.date || "Pick a date"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.ticketInput, styles.pickerField]}
                    onPress={() => setTimePickerFor({ id: event.id, kind: "time" })}
                  >
                    <Text style={styles.pickerLabel}>Time</Text>
                    <Text style={styles.pickerValue}>{event.time || "Pick time"}</Text>
                  </TouchableOpacity>
                </View>

                <TextField
                  label="Performing DJs / Artists"
                  value={event.djArtists}
                  onChangeText={(value) => onUpdateEvent(event.id, "djArtists", value)}
                  placeholder="DJ Nucleya, DJ Chetas, Local Artists"
                />

                <TextArea
                  label="Event Description"
                  value={event.description}
                  onChangeText={(value) => onUpdateEvent(event.id, "description", value)}
                  placeholder="Join us for an electrifying night of house and techno beats..."
                />

                <View style={styles.eventImageUpload}>
                  <ImageUploader
                    label="Event Cover Image"
                    multiple={false}
                    onUploaded={(urls) => onUpdateEvent(event.id, "coverImage", urls[0] || null)}
                    existingUrls={event.coverImage ? [event.coverImage] : []}
                    fullWidth
                    aspectRatio={16 / 9}
                    mediaTypes={ImagePicker.MediaTypeOptions.All}
                  />
                </View>
              </View>

              <View style={styles.eventTicketsSection}>
                <View style={styles.eventTicketsHeader}>
                  <Text style={styles.eventTicketsTitle}>Ticket Types for this Event</Text>
                  <TouchableOpacity
                    style={styles.addEventTicketBtn}
                    onPress={() => onAddTicket(event.id)}
                  >
                    <Text style={styles.addEventTicketText}>+ Ticket</Text>
                  </TouchableOpacity>
                </View>

                {event.ticketTypes.map((ticket) => (
                  <View key={ticket.id} style={styles.eventTicketItem}>
                    <View style={styles.eventTicketRow}>
                      <View style={styles.eventTicketInput}>
                        <TextField
                          label="Type"
                          value={ticket.name}
                          onChangeText={(value) =>
                            onUpdateTicket(event.id, ticket.id, "name", value)
                          }
                          placeholder="General/VIP/Early Bird"
                        />
                      </View>
                      <View style={styles.eventTicketInput}>
                        <TextField
                          label="Price"
                          value={ticket.price}
                          onChangeText={(value) =>
                            onUpdateTicket(event.id, ticket.id, "price", value)
                          }
                          placeholder="₹1500"
                          keyboardType="numeric"
                        />
                      </View>
                      <TouchableOpacity
                        style={styles.removeEventTicketBtn}
                        onPress={() => onRemoveTicket(event.id, ticket.id)}
                      >
                        <Text style={styles.removeEventTicketBtnText}>×</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.eventTicketRow}>
                      <View style={styles.eventTicketInput}>
                        <TextField
                          label="Quantity"
                          value={ticket.quantity}
                          onChangeText={(value) =>
                            onUpdateTicket(event.id, ticket.id, "quantity", value)
                          }
                          placeholder="100"
                          keyboardType="numeric"
                        />
                      </View>
                    </View>
                    <View style={styles.eventTicketDescription}>
                      <TextArea
                        label="Description"
                        value={ticket.description}
                        onChangeText={(value) =>
                          onUpdateTicket(event.id, ticket.id, "description", value)
                        }
                        placeholder="Includes drinks, table access"
                      />
                    </View>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </View>
        ))}
      </View>

      {datePickerFor && (
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerTitle}>Select Date</Text>
            <DateTimePicker
              value={new Date()}
              mode="date"
              display="spinner"
              onChange={(event: any, date?: Date) => {
                if (date) onUpdateEvent(datePickerFor, "date", formatDate(date));
                setDatePickerFor(null);
              }}
            />
            <TouchableOpacity onPress={() => setDatePickerFor(null)} style={styles.pickerCloseBtn}>
              <Text style={styles.pickerCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {timePickerFor && (
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerTitle}>Select Time</Text>
            <DateTimePicker
              value={new Date()}
              mode="time"
              is24Hour={false}
              display="spinner"
              onChange={(event: any, date?: Date) => {
                if (date) onUpdateEvent(timePickerFor.id, "time", formatTime(date));
                setTimePickerFor(null);
              }}
            />
            <TouchableOpacity onPress={() => setTimePickerFor(null)} style={styles.pickerCloseBtn}>
              <Text style={styles.pickerCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  sectionSpacing: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "600",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  addTicketBtn: {
    borderRadius: 12,
  },
  addTicketGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  addTicketText: {
    color: Colors.button.text,
    fontSize: 14,
    fontWeight: "700",
  },
  eventCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
  },
  eventCardGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.borderBlue,
    borderRadius: 16,
  },
  ticketCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  ticketCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  removeTicketBtn: {
    backgroundColor: "rgba(255, 107, 107, 0.2)",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  removeTicketText: {
    color: "#FF6B6B",
    fontSize: 16,
    fontWeight: "800",
  },
  eventBasicInfo: {
    gap: 16,
    marginBottom: 20,
  },
  ticketRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  ticketInput: {
    flex: 1,
  },
  eventImageUpload: {
    marginTop: 8,
  },
  eventTicketsSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderBlue,
    paddingTop: 16,
  },
  eventTicketsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  eventTicketsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  addEventTicketBtn: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.borderBlue,
  },
  addEventTicketText: {
    color: Colors.accentBlue,
    fontSize: 12,
    fontWeight: "600",
  },
  eventTicketItem: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.borderBlue,
  },
  eventTicketRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
    alignItems: "flex-start",
  },
  eventTicketInput: {
    flex: 1,
  },
  removeEventTicketBtn: {
    backgroundColor: "rgba(255, 107, 107, 0.2)",
    borderRadius: 8,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  removeEventTicketBtnText: {
    color: "#FF6B6B",
    fontSize: 14,
    fontWeight: "800",
  },
  pickerField: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderBlue,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pickerLabel: { color: Colors.textSecondary, fontSize: 12, marginBottom: 4 },
  pickerValue: { color: Colors.textPrimary, fontWeight: "700" },
  eventTicketDescription: {
    marginTop: 8,
  },
  pickerOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  pickerContainer: {
    width: "100%",
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderBlue,
    padding: 16,
  },
  pickerTitle: {
    color: Colors.textPrimary,
    fontWeight: "800",
    fontSize: 16,
    marginBottom: 8,
  },
  pickerCloseBtn: {
    alignSelf: "flex-end",
    marginTop: 8,
    backgroundColor: Colors.accentBlue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pickerCloseText: {
    color: Colors.button.text,
    fontWeight: "700",
  },
});

export default EventsTicketingSection;


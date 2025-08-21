import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Colors } from "@/constants/Colors";
import TextField from "../../ui/TextField";
import TextArea from "../../ui/TextArea";
import ImageUploader from "../../ui/ImageUploader";
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
  const [timePickerFor, setTimePickerFor] = useState<{
    id: string;
    kind: "time";
  } | null>(null);
  const [tempDate, setTempDate] = useState<Date | null>(null);
  const [tempTime, setTempTime] = useState<Date | null>(null);

  const formatDate = (d: Date) => d.toISOString().split("T")[0];
  const formatTime = (d: Date) => {
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  const parseDateString = (value?: string): Date => {
    if (!value) return new Date();
    const parsed = new Date(`${value}T00:00:00`);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  const parseTimeString = (value?: string): Date => {
    if (!value) return new Date();
    // expected e.g. "11:16 PM"
    try {
      const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (!match) return new Date();
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const ampm = match[3].toUpperCase();
      if (ampm === "PM" && hours < 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;
      const d = new Date();
      d.setHours(hours, minutes, 0, 0);
      return d;
    } catch {
      return new Date();
    }
  };

  return (
    <View style={styles.section}>
      {events.map((event) => (
        <View key={event.id} style={styles.eventContainer}>
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
                onPress={() => {
                  setTempDate(parseDateString(event.date));
                  setDatePickerFor(event.id);
                }}
              >
                <Text style={styles.pickerLabel}>Date</Text>
                <Text style={styles.pickerValue}>
                  {event.date || "Pick a date"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.ticketInput, styles.pickerField]}
                onPress={() => {
                  setTempTime(parseTimeString(event.time));
                  setTimePickerFor({ id: event.id, kind: "time" });
                }}
              >
                <Text style={styles.pickerLabel}>Time</Text>
                <Text style={styles.pickerValue}>
                  {event.time || "Pick time"}
                </Text>
              </TouchableOpacity>
            </View>

            <TextField
              label="Performing DJs / Artists"
              value={event.djArtists}
              onChangeText={(value) =>
                onUpdateEvent(event.id, "djArtists", value)
              }
              placeholder="DJ Nucleya, DJ Chetas, Local Artists"
            />

            <TextArea
              label="Event Description"
              value={event.description}
              onChangeText={(value) =>
                onUpdateEvent(event.id, "description", value)
              }
              placeholder="Join us for an electrifying night of house and techno beats..."
            />

            <View style={styles.eventImageUpload}>
              <ImageUploader
                label="Event Cover Image"
                multiple={false}
                onUploaded={(urls) =>
                  onUpdateEvent(event.id, "coverImage", urls[0] || null)
                }
                existingUrls={event.coverImage ? [event.coverImage] : []}
                fullWidth
                aspectRatio={16 / 9}
              />
            </View>
          </View>

          <View style={styles.eventTicketsSection}>
            <View style={styles.eventTicketsHeader}>
              <Text style={styles.eventTicketsTitle}>
                Ticket Types for this Event
              </Text>
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
                      placeholder="General"
                    />
                  </View>
                  <View style={styles.eventTicketInput}>
                    <TextField
                      label="Price"
                      value={ticket.price}
                      onChangeText={(value) =>
                        onUpdateTicket(event.id, ticket.id, "price", value)
                      }
                      placeholder="1500"
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
        </View>
      ))}

      {datePickerFor && (
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerTitle}>Select Date</Text>
            <View style={styles.pickerWheelContainer}>
              <DateTimePicker
                value={
                  tempDate ||
                  parseDateString(
                    events.find((e) => e.id === datePickerFor)?.date
                  )
                }
                mode="date"
                display="spinner"
                themeVariant={Platform.OS === "ios" ? "dark" : undefined}
                textColor={
                  Platform.OS === "ios" ? Colors.textPrimary : undefined
                }
                onChange={(event: any, date?: Date) => {
                  if (date) setTempDate(date);
                }}
              />
            </View>
            <View style={styles.pickerButtonsRow}>
              <TouchableOpacity
                onPress={() => {
                  const commit = tempDate || new Date();
                  onUpdateEvent(datePickerFor, "date", formatDate(commit));
                  setDatePickerFor(null);
                  setTempDate(null);
                }}
                style={styles.pickerSaveBtn}
              >
                <Text style={styles.pickerSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      {timePickerFor && (
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerTitle}>Select Time</Text>
            <View style={styles.pickerWheelContainer}>
              <DateTimePicker
                value={
                  tempTime ||
                  parseTimeString(
                    events.find((e) => e.id === timePickerFor.id)?.time
                  )
                }
                mode="time"
                is24Hour={false}
                display="spinner"
                themeVariant={Platform.OS === "ios" ? "dark" : undefined}
                textColor={
                  Platform.OS === "ios" ? Colors.textPrimary : undefined
                }
                onChange={(event: any, date?: Date) => {
                  if (date) setTempTime(date);
                }}
              />
            </View>
            <View style={styles.pickerButtonsRow}>
              <TouchableOpacity
                onPress={() => {
                  const commit = tempTime || new Date();
                  onUpdateEvent(timePickerFor.id, "time", formatTime(commit));
                  setTimePickerFor(null);
                  setTempTime(null);
                }}
                style={styles.pickerSaveBtn}
              >
                <Text style={styles.pickerSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
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
  eventContainer: {
    marginBottom: 20,
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
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 56,
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
  },
  pickerWheelContainer: {
    width: "100%",
    alignSelf: "center",
  },
  pickerWheel: {
    width: "100%",
    padding: 20,
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
  pickerButtonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  pickerSaveBtn: {
    backgroundColor: Colors.accentBlue,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  pickerSaveText: {
    color: Colors.button.text,
    fontWeight: "800",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    margin: 20,
    width: '85%',
    maxHeight: '70%',
    borderWidth: 1,
    borderColor: Colors.borderBlue,
  },
  
  pickerHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },
  
  pickerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderBlue,
    padding: 12,
  },
  
  saveButtonContainer: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  
  saveButton: {
    backgroundColor: Colors.accentBlue,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
});

export default EventsTicketingSection;

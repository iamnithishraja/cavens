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
      <Text style={styles.sectionTitle}>Event Details</Text>
      
      {events.map((event) => (
        <View key={event.id} style={styles.eventContainer}>
          
          <View style={styles.inputSpacing}>
            <TextField
              label="Event Name"
              value={event.name}
              onChangeText={(value) => onUpdateEvent(event.id, "name", value)}
              placeholder="e.g. Saturday Night Vibes, DJ Nucleya Live"
            />
          </View>

          <View style={styles.dateTimeRow}>
            <TouchableOpacity
              style={[styles.dateTimeInput, styles.pickerField]}
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
              style={[styles.dateTimeInput, styles.pickerField]}
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

          <View style={styles.inputSpacing}>
            <TextField
              label="Performing DJs / Artists"
              value={event.djArtists}
              onChangeText={(value) =>
                onUpdateEvent(event.id, "djArtists", value)
              }
              placeholder="DJ Nucleya, DJ Chetas, Local Artists"
            />
          </View>

          <View style={styles.inputSpacing}>
            <TextArea
              label="Event Description"
              value={event.description}
              onChangeText={(value) =>
                onUpdateEvent(event.id, "description", value)
              }
              placeholder="Join us for an electrifying night of house and techno beats..."
            />
          </View>

          <View style={styles.inputSpacing}>
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

          {/* Tickets Section */}
          <View style={styles.ticketsSection}>
            <View style={styles.ticketsHeader}>
              <Text style={styles.ticketsTitle}>Ticket Types</Text>
              <TouchableOpacity
                style={styles.addTicketBtn}
                onPress={() => onAddTicket(event.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.addTicketText}>+ Add Ticket</Text>
              </TouchableOpacity>
            </View>

            {event.ticketTypes.map((ticket) => (
              <View key={ticket.id} style={styles.ticketItem}>
                <View style={styles.ticketRow}>
                  <View style={styles.ticketInputFlex}>
                    <TextField
                      label="Type"
                      value={ticket.name}
                      onChangeText={(value) =>
                        onUpdateTicket(event.id, ticket.id, "name", value)
                      }
                      placeholder="General"
                    />
                  </View>
                  <View style={styles.ticketInputFlex}>
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
                    style={styles.removeTicketBtn}
                    onPress={() => onRemoveTicket(event.id, ticket.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.removeTicketText}>×</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.ticketQuantityRow}>
                  <View style={styles.ticketInputHalf}>
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
                
                <View style={styles.inputSpacing}>
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

      {/* Date Picker Modal */}
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
                  if (Platform.OS !== "ios") {
                    // On Android, commit immediately and close on set/dismiss
                    if (event?.type === "set" && date) {
                      onUpdateEvent(datePickerFor as string, "date", formatDate(date));
                    }
                    setDatePickerFor(null);
                    setTempDate(null);
                  } else {
                    if (date) setTempDate(date);
                  }
                }}
              />
            </View>
            {Platform.OS === "ios" ? (
              <TouchableOpacity
                onPress={() => {
                  const commit = tempDate || new Date();
                  onUpdateEvent(datePickerFor as string, "date", formatDate(commit));
                  setDatePickerFor(null);
                  setTempDate(null);
                }}
                style={styles.pickerSaveBtn}
              >
                <Text style={styles.pickerSaveText}>Save</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  setDatePickerFor(null);
                  setTempDate(null);
                }}
                style={styles.pickerSaveBtn}
              >
                <Text style={styles.pickerSaveText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Time Picker Modal */}
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
                  if (Platform.OS !== "ios") {
                    if (event?.type === "set" && date) {
                      onUpdateEvent(timePickerFor.id, "time", formatTime(date));
                    }
                    setTimePickerFor(null);
                    setTempTime(null);
                  } else {
                    if (date) setTempTime(date);
                  }
                }}
              />
            </View>
            {Platform.OS === "ios" ? (
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
            ) : (
              <TouchableOpacity
                onPress={() => {
                  setTimePickerFor(null);
                  setTempTime(null);
                }}
                style={styles.pickerSaveBtn}
              >
                <Text style={styles.pickerSaveText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: Colors.textPrimary,
    fontWeight: "600",
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  eventContainer: {
    marginBottom: 16,
  },
  inputSpacing: {
    marginBottom: 16,
  },
  dateTimeRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  dateTimeInput: {
    flex: 1,
  },
  pickerField: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 56,
  },
  pickerLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
    fontWeight: "500",
  },
  pickerValue: {
    color: Colors.textPrimary,
    fontWeight: "600",
    fontSize: 16,
  },
  
  // Tickets Section
  ticketsSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.separator,
  },
  ticketsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  ticketsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  addTicketBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  addTicketText: {
    color: Colors.button.text,
    fontSize: 14,
    fontWeight: "600",
  },
  ticketItem: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  ticketRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    marginBottom: 12,
  },
  ticketInputFlex: {
    flex: 1,
  },
  ticketQuantityRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  ticketInputHalf: {
    flex: 0.5,
  },
  removeTicketBtn: {
    backgroundColor: Colors.error + "20",
    borderRadius: 8,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  removeTicketText: {
    color: Colors.error,
    fontSize: 18,
    fontWeight: "700",
  },
  
  // Picker Modal
  pickerOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  pickerContainer: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: 20,
    margin: 20,
    minWidth: 280,
    alignItems: "center",
  },
  pickerTitle: {
    color: Colors.textPrimary,
    fontWeight: "600",
    fontSize: 18,
    marginBottom: 16,
  },
  pickerWheelContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
  pickerSaveBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  pickerSaveText: {
    color: Colors.button.text,
    fontWeight: "600",
    fontSize: 16,
  },
});

export default EventsTicketingSection;
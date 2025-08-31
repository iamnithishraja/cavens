import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/Colors";

type Props = {
  onBookTickets?: () => void;
};

const BookingActions: React.FC<Props> = ({ onBookTickets }) => {
  return (
    <TouchableOpacity 
      style={styles.btn} 
      onPress={onBookTickets}
      activeOpacity={0.8}
    >
      <Text style={styles.btnText}>🎫 BOOK TICKETS</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: { 
    backgroundColor: Colors.primary,
    borderRadius: 12, 
    paddingVertical: 18, 
    paddingHorizontal: 24,
    alignItems: "center", 
    justifyContent: "center",
    marginVertical: 16,
    minHeight: 56,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  btnText: { 
    color: Colors.background, 
    fontWeight: "800",
    fontSize: 18,
    textAlign: 'center',
  },
});

export default BookingActions;



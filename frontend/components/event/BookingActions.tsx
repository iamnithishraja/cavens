import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/Colors";

type Props = {
  onBookTickets?: () => void;
  onBookTable?: () => void;
};

const BookingActions: React.FC<Props> = ({ onBookTickets, onBookTable }) => {
  return (
    <View style={styles.row}>
      <TouchableOpacity style={[styles.btn, styles.primary]} onPress={onBookTickets}>
        <Text style={styles.btnTextPrimary}>Book Tickets</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, styles.secondary]} onPress={onBookTable}>
        <Text style={styles.btnTextSecondary}>Reserve Table</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 12 },
  btn: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: "center", justifyContent: "center" },
  primary: { backgroundColor: Colors.accentYellow },
  secondary: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.borderBlue },
  btnTextPrimary: { color: Colors.button.text, fontWeight: "800" },
  btnTextSecondary: { color: Colors.textPrimary, fontWeight: "800" },
});

export default BookingActions;



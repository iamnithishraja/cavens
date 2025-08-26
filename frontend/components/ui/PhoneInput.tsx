import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";
import { Country, DEFAULT_COUNTRY } from "@/constants/country";
import CountryPickerModal from "@/components/ui/CountryPickerModal";

type Props = {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  onCountryChange?: (country: Country) => void;
};

// kept for potential external usage pattern parity with Auth.tsx (not used here)

const PhoneInput = ({ label = "Mobile Number", value, onChangeText, onCountryChange }: Props) => {
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [showCountryModal, setShowCountryModal] = useState(false);

  const onOpenPicker = () => {
    setShowCountryModal(true);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.row}>
        <Pressable 
          style={styles.countryBox} 
          onPress={onOpenPicker} 
          accessibilityRole="button"
        >
          <Text style={styles.countryFlag}>{country.flag}</Text>
          <Text style={styles.countryCode}>{country.dialCode}</Text>
        </Pressable>

        <TextInput
          style={styles.phoneInput}
          placeholder="Mobile number"
          placeholderTextColor={Colors.textMuted}
          selectionColor={Colors.primary}
          keyboardType="phone-pad"
          value={value}
          onChangeText={(text) => onChangeText(text.replace(/[^0-9]/g, ""))}
          autoComplete="tel"
          textContentType="telephoneNumber"
          maxLength={12}
        />
      </View>
      <CountryPickerModal
        visible={showCountryModal}
        onClose={() => setShowCountryModal(false)}
        onSelect={(c) => {
          setCountry(c);
          setShowCountryModal(false);
          onCountryChange?.(c);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { 
    marginBottom: 24 
  },
  inputLabel: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "600",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  countryBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 16,
    height: 56,
    minWidth: 100,
    justifyContent: "center",
  },
  countryFlag: { 
    fontSize: 20, 
    marginRight: 8 
  },
  countryCode: { 
    color: Colors.textPrimary, 
    fontSize: 16, 
    fontWeight: "700" 
  },
  phoneInput: {
    flex: 1,
    height: 56,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 20,
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: "500",
    borderWidth: 1,
    borderColor: Colors.border,
  },
});

export default PhoneInput;
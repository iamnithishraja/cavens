import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, TextInputProps } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Colors } from "@/constants/Colors";
import { Country, DEFAULT_COUNTRY, COUNTRIES } from "@/constants/country";

type Props = {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
};

const findCountry = (dialCode?: string, code?: string): Country => {
  if (dialCode) {
    const match = COUNTRIES.find((c) => c.dialCode === dialCode);
    if (match) return match;
  }
  if (code) {
    const match = COUNTRIES.find((c) => c.code === code);
    if (match) return match;
  }
  return DEFAULT_COUNTRY;
};

const PhoneInput = ({ label = "Mobile Number", value, onChangeText }: Props) => {
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string; dialCode?: string; flag?: string }>();
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);

  useEffect(() => {
    const next = findCountry(params.dialCode as string | undefined, params.code as string | undefined);
    setCountry(next);
  }, [params.code, params.dialCode]);

  const onOpenPicker = () => {
    router.push({ pathname: "/auth/country", params: { q: "" } });
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.row}>
        <Pressable style={styles.countryBox} onPress={onOpenPicker} accessibilityRole="button">
          <LinearGradient colors={[Colors.surfaceElevated, Colors.surface]} style={styles.countryBoxGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={styles.countryFlag}>{country.flag}</Text>
            <Text style={styles.countryCode}>{country.dialCode}</Text>
          </LinearGradient>
        </Pressable>

        <View style={styles.phoneInputContainer}>
          <TextInput
            style={styles.phoneInput}
            placeholder="Mobile number"
            placeholderTextColor={Colors.textMuted}
            keyboardType="phone-pad"
            value={value}
            onChangeText={(text) => onChangeText(text.replace(/[^0-9]/g, ""))}
            autoComplete="tel"
            textContentType="telephoneNumber"
            maxLength={12}
          />
          <LinearGradient colors={[Colors.borderBlue, "transparent"]} style={styles.inputUnderline} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  inputLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  countryBox: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.borderBlue,
  },
  countryBoxGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    minWidth: 96,
    justifyContent: "center",
  },
  countryFlag: { fontSize: 20, marginRight: 8 },
  countryCode: { color: Colors.textPrimary, fontSize: 16, fontWeight: "700" },
  phoneInputContainer: { flex: 1, position: "relative" },
  phoneInput: {
    fontSize: 16,
    color: Colors.textPrimary,
    paddingVertical: 16,
    paddingHorizontal: 4,
    fontWeight: "500",
    backgroundColor: "transparent",
  },
  inputUnderline: { height: 2, borderRadius: 1, marginTop: 4 },
});

export default PhoneInput;



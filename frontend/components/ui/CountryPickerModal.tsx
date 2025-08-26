import React, { useMemo, useState } from "react";
import { View, Text, TextInput, StyleSheet, FlatList, Pressable, Modal } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import { COUNTRIES, Country } from "@/constants/country";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (country: Country) => void;
  initialQuery?: string;
};

const CountryPickerModal = ({ visible, onClose, onSelect, initialQuery = "" }: Props) => {
  const [query, setQuery] = useState(initialQuery);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.scrim} onPress={onClose} />

        <LinearGradient
          colors={[Colors.backgroundSecondary, Colors.backgroundTertiary]}
          style={styles.sheet}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.grabber} />
          <Text style={styles.title}>Choose your country</Text>
          <View style={styles.searchWrapper}>
            <TextInput
              placeholder="Search country"
              placeholderTextColor={Colors.textMuted}
              style={styles.search}
              value={query}
              onChangeText={setQuery}
              autoFocus
            />
            <LinearGradient
              colors={Colors.gradients.button as [string, string]}
              style={styles.searchUnderline}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <Pressable style={styles.row} onPress={() => onSelect(item)}>
                <Text style={styles.flag}>{item.flag}</Text>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.code}>{item.dialCode}</Text>
              </Pressable>
            )}
            ItemSeparatorComponent={() => <View style={styles.sep} />}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 12 }}
          />
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "flex-end",
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.withOpacity.black80,
  },
  sheet: {
    backgroundColor: Colors.backgroundSecondary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopColor: Colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    maxHeight: "75%",
  },
  grabber: {
    alignSelf: "center",
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.border,
    marginBottom: 10,
    opacity: 0.9,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 12,
  },
  searchWrapper: { marginBottom: 8 },
  search: {
    height: 46,
    borderRadius: 12,
    backgroundColor: Colors.backgroundTertiary,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    color: Colors.textPrimary,
  },
  searchUnderline: {
    height: 2,
    borderRadius: 1,
    marginTop: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.border },
  flag: { fontSize: 20, width: 28 },
  name: { flex: 1, color: Colors.textPrimary, fontSize: 15, fontWeight: "600" },
  code: { color: Colors.textSecondary, fontSize: 15, fontWeight: "600" },
});

export default CountryPickerModal;



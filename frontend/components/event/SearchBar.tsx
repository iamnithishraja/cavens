import React from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/Colors";
import { Search, X, Filter } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFocusNavigate?: () => void;
  onFilterPress?: () => void;
};

const SearchBar: React.FC<Props> = ({
  value,
  onChangeText,
  placeholder,
  onFocusNavigate,
  onFilterPress,
}) => {
  return (
    <View>
      <LinearGradient
        colors={[Colors.withOpacity.white10, Colors.withOpacity.white10]}
        style={styles.gradientPill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.searchContainer}>
          <BlurView style={styles.blurOverlay} intensity={18} tint="dark" />
          <LinearGradient
            colors={[
              Colors.primary + '18',
              Colors.primary + '10',
              Colors.primary + '08',
              'transparent'
            ]}
            locations={[0, 0.3, 0.7, 1]}
            style={styles.innerShine}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
          <Search color={Colors.primary} size={18} style={styles.leadingIcon} />
          <TextInput
            style={styles.textInput}
            placeholder={placeholder || "Search events, artists..."}
            placeholderTextColor={Colors.textMuted}
            value={value}
            onChangeText={onChangeText}
            autoCapitalize="none"
            autoCorrect={false}
            selectionColor={Colors.primary}
            onFocus={() => {
              if (onFocusNavigate) {
                onFocusNavigate();
              }
            }}
          />
          {value.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => onChangeText("")}
            >
              <X color={Colors.textMuted} size={16} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.filterButton}
            onPress={onFilterPress}
          >
            <Filter color={Colors.accentYellow} size={16} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  gradientPill: {
    borderRadius: 14,
    padding: 1,
  },
  searchContainer: {
    backgroundColor: Colors.withOpacity.black60,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(1,28,81,0.35)",
    position: "relative",
  },
  innerShine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
  },
  blurOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
  },
  leadingIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "400",
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    padding: 8,
    marginLeft: 4,
    borderRadius: 4,
    backgroundColor: Colors.accentYellow + '20',
    borderWidth: 1,
    borderColor: Colors.accentYellow + '50',
  },
});

export default SearchBar;

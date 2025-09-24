import React from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/Colors";
import { Search, X } from "lucide-react-native";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFocusNavigate?: () => void;
};

const SearchBar: React.FC<Props> = ({
  value,
  onChangeText,
  placeholder,
  onFocusNavigate,
}) => {
  return (
    <View>
      <View style={styles.searchContainer}>
        <Search color={Colors.textMuted} size={18} style={styles.leadingIcon} />
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    backgroundColor: Colors.withOpacity.black60,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
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
});

export default SearchBar;

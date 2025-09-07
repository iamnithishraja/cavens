import React from "react";
import { View, TextInput, StyleSheet, Image } from "react-native";
import { Colors } from "@/constants/Colors";

type Props = {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  onFocusNavigate?: () => void;
};

const SearchBar: React.FC<Props> = ({ value, onChangeText, placeholder, onFocusNavigate }) => {
  return (
    <View>
      <View style={styles.searchContainer}>
        <Image 
          source={{ uri: "https://img.icons8.com/ios-filled/50/FFFFFF/search.png" }} 
          style={styles.searchIcon} 
        />
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
          <View style={styles.clearButton}>
            <Image 
              source={{ uri: "https://img.icons8.com/ios-filled/50/FFFFFF/multiply.png" }} 
              style={styles.clearIcon} 
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.separator,
  },
  searchIcon: { 
    width: 16, 
    height: 16, 
    tintColor: Colors.textMuted, 
    marginRight: 12,
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
  clearIcon: {
    width: 14,
    height: 14,
    tintColor: Colors.textMuted,
  },
});

export default SearchBar;
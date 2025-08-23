import React from "react";
import { View, TextInput, StyleSheet, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";

type Props = {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
};

const SearchBar: React.FC<Props> = ({ value, onChangeText, placeholder }) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.surfaceElevated, Colors.surface]}
        style={styles.searchContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Image source={{ uri: "https://img.icons8.com/ios-filled/50/FFFFFF/search.png" }} style={styles.searchIcon} />
        <TextInput
          style={styles.textInput}
          placeholder={placeholder || "Search events, artists, descriptions..."}
          placeholderTextColor={Colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 2,
  },
  searchContainer: {
    borderColor: Colors.borderBlue,
    borderWidth: 1,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: Colors.accentBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  searchIcon: { 
    width: 18, 
    height: 18, 
    tintColor: Colors.accentBlue, 
    marginRight: 12 
  },
  textInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "500",
    paddingVertical: 0,
  },
});

export default SearchBar;

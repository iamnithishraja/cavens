import React from "react";
import { View, StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";

const Background = ({ children }: { children: React.ReactNode }) => {
  return (
    <View style={styles.container}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});

export default Background;
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ClubDetailsHeaderProps {
  onBack?: () => void;
  onMenu?: () => void;
  title?: string;
}

const ClubDetailsHeader: React.FC<ClubDetailsHeaderProps> = ({
  onBack,
  onMenu,
  title = "Club Details",
}) => {
  const insets = useSafeAreaInsets();

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={Colors.gradients.dark as [string, string]}
        style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'ios' ? 10 : 20) }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Subtle glow overlay */}
        <LinearGradient
          colors={Colors.gradients.blueGlow as [string, string]}
          style={styles.glowOverlay}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0.4 }}
        />
        
        <View style={styles.headerContent}>
          {/* Left side - Back button */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[Colors.surfaceElevated, Colors.surface]}
              style={styles.iconButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Center - Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
          </View>

          {/* Right side - Menu button */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onMenu}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[Colors.surfaceElevated, Colors.surface]}
              style={styles.iconButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="ellipsis-horizontal" size={22} color={Colors.textPrimary} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Bottom border accent */}
        <LinearGradient
          colors={[Colors.accentBlue + "40", "transparent"]}
          style={styles.bottomAccent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    position: "relative",
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderBlue,
    shadowColor: Colors.accentBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  glowOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.25,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    height: 60,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.borderBlue,
  },
  iconButtonGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 20,
  },
  title: {
    fontSize: 18,
    color: Colors.textPrimary,
    fontWeight: "800",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  bottomAccent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
  },
});

export default ClubDetailsHeader;
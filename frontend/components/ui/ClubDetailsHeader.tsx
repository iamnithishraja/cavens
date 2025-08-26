import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from "react-native";
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
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <View 
        style={[
          styles.header, 
          { paddingTop: insets.top + (Platform.OS === 'ios' ? 10 : 20) }
        ]}
      >
        <View style={styles.headerContent}>
          {/* Left side - Back button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.6}
          >
            <View style={styles.backButtonCircle}>
              <Ionicons 
                name="chevron-back" 
                size={24} 
                color={Colors.textPrimary} 
              />
            </View>
          </TouchableOpacity>

          {/* Center - Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
          </View>

          {/* Right side - Menu button (optional, for symmetry) */}
          <TouchableOpacity
            style={styles.menuButton}
            onPress={onMenu}
            activeOpacity={0.6}
          >
            <Ionicons 
              name="ellipsis-horizontal" 
              size={24} 
              color={Colors.textMuted} 
            />
          </TouchableOpacity>
        </View>

        {/* Accent line under header */}
        <View style={styles.accentLine} />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.background,
    borderBottomWidth: 0,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    height: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 20,
  },
  title: {
    fontSize: 20,
    color: Colors.textPrimary,
    fontWeight: "600",
    letterSpacing: 0.3,
    textAlign: "center",
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  accentLine: {
    height: 2,
    backgroundColor: Colors.primary,
    width: 50,
    alignSelf: "flex-start",
    marginLeft: 20,
    marginBottom: 8,
  },
});

export default ClubDetailsHeader;
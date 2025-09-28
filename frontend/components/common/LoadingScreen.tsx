import { Colors } from "@/constants/Colors";
import {
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  View,
  StyleSheet,
  Text,
} from "react-native";

const LoadingScreen = () => {
  const getLoadingMessage = () => {
    const messages = [
      "Your night starts here...",
      "Preparing the ultimate night out...",
      "Curating tonight's hottest spots...",
      "Loading the party lineup...",
      "Getting the night ready for you...",
      "Setting up your nightlife adventure...",
      "Preparing tonight's highlights...",
      "Your night is about to begin...",
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <View style={styles.fullBackground}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>{getLoadingMessage()}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  fullBackground: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
});

export default LoadingScreen;

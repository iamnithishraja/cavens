import { Colors } from "@/constants/Colors";
import { ActivityIndicator, SafeAreaView, StatusBar, View, StyleSheet, Text } from "react-native";

const LoadingScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea} >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.fullBackground}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading events...</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
});

export default LoadingScreen;
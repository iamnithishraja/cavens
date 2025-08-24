import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';

export default function ScanScreen() {
  return (
    
      <LinearGradient
        colors={Colors.gradients.background as [string, string]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <LinearGradient
            colors={Colors.gradients.card as [string, string]}
            style={styles.card}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <LinearGradient
              colors={Colors.gradients.blueGlow as [string, string]}
              style={styles.glowOverlay}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0.3 }}
            />
            
            <View style={styles.cardContent}>
              <Text style={styles.title}>Mape Page</Text>
              <Text style={styles.subtitle}>Map thing</Text>
              <Text style={styles.description}>
                Hi this is maps page
              </Text>
            </View>
          </LinearGradient>
        </View>
      </LinearGradient>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.borderBlue,
    shadowColor: Colors.accentBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    opacity: 0.3,
  },
  cardContent: {
    padding: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.accentBlue,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';

type GuestExperience = {
  dressCode?: string;
  entryRules?: string;
  tableLayoutMap?: string;
  parkingInfo?: string;
  accessibilityInfo?: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  guestExperience?: GuestExperience;
};

const GuestRulesModal: React.FC<Props> = ({ visible, onClose, guestExperience }) => {
  const insets = useSafeAreaInsets();

  const sections: { title: string; value?: string }[] = [
    { title: 'Dress Code', value: guestExperience?.dressCode },
    { title: 'Entry Rules', value: guestExperience?.entryRules },
    { title: 'Parking', value: guestExperience?.parkingInfo },
    { title: 'Accessibility', value: guestExperience?.accessibilityInfo },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom }]}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Guest Rules</Text>
            <TouchableOpacity style={styles.nextButton} onPress={onClose} activeOpacity={0.9}>
              <Text style={styles.nextText}>Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {sections.map((s) => (
              <View key={s.title} style={styles.card}>
                <Text style={styles.cardTitle}>{s.title}</Text>
                <Text style={styles.cardText}>
                  {s.value?.trim() || 'Information not provided.'}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    height: '70%',
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 0.5,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.2,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  nextButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: Colors.primary,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  nextText: {
    color: Colors.button?.text || '#000',
    fontSize: 12,
    fontWeight: '800',
  },
  content: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: Colors.withOpacity.black30,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  cardTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  cardText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
});

export default GuestRulesModal;



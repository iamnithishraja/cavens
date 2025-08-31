import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ClubTypeSelector from '@/components/Map/ClubTypeSelector';
import { Colors } from '@/constants/Colors';

type UserClubListHeaderProps = {
  headerSpacing: number;
  selectedTypes: string[];
  onTypeSelect: (typeId: string) => void;
};

const UserClubListHeader: React.FC<UserClubListHeaderProps> = ({
  headerSpacing,
  selectedTypes,
  onTypeSelect,
}) => {
  return (
    <View>
      <View style={{ height: headerSpacing }} />
      <Text style={styles.sectionTitle}>Location Maps coming soon</Text>
      <View style={styles.categoryContainer}>
        <ClubTypeSelector selectedTypes={selectedTypes} onTypeSelect={onTypeSelect} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
    paddingHorizontal: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  categoryContainer: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
});

export default UserClubListHeader;


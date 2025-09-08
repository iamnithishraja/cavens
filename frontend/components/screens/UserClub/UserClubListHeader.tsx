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
      <View style={{ height: Math.max(4, headerSpacing - 320) }} />
      <View style={styles.categoryContainer}>
        <ClubTypeSelector selectedTypes={selectedTypes} onTypeSelect={onTypeSelect} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  categoryContainer: {
    marginBottom: 8,
    paddingHorizontal: 16,
  },
});

export default UserClubListHeader;


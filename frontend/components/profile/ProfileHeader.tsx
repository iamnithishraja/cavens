import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { profileStyles } from './styles';
import type { ProfileHeaderProps } from './types';

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  return (
    <View style={profileStyles.profileHeader}>
      <View style={profileStyles.profilePictureContainer}>
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={profileStyles.profilePictureGradient}
        >
          <View style={profileStyles.profilePicture}>
            <Text style={profileStyles.profileInitial}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
        </LinearGradient>
      </View>
      
      <Text style={profileStyles.userName}>{user?.name || 'User'}</Text>
      <Text style={profileStyles.userEmail}>{user?.email || 'No email'}</Text>
      
      <View style={profileStyles.roleBadgeContainer}>
        <View style={profileStyles.roleDot} />
        <Text style={profileStyles.roleBadgeText}>
          {user?.role === 'club' ? 'Club Manager' : 'User'}
        </Text>
      </View>
    </View>
  );
};

export default ProfileHeader;

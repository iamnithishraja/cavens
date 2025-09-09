import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { profileStyles } from './styles';
import type { ClubStatusCardProps } from './types';

const ClubStatusCard: React.FC<ClubStatusCardProps> = ({ club, clubStatus }) => {
  return (
    <View style={profileStyles.clubStatusCard}>
      <View style={profileStyles.clubStatusContent}>
        <View style={profileStyles.clubStatusHeader}>
          <Ionicons name="business" size={20} color={Colors.primary} />
          <Text style={profileStyles.clubStatusTitle}>
            {clubStatus === 'approved' ? 'Your Club' : 'Club Management'}
          </Text>
        </View>
        
        {clubStatus === 'approved' ? (
          <>
            <Text style={profileStyles.clubName}>{club.name}</Text>
            <View style={[
              profileStyles.statusBadgeContainer,
              profileStyles.approvedBadgeContainer
            ]}>
              <View style={[
                profileStyles.statusDot,
                profileStyles.approvedDot
              ]} />
              <Text style={profileStyles.statusText}>Approved</Text>
            </View>
          </>
        ) : (
          <>
            <Text style={profileStyles.subtitle}>You are currently in club mode</Text>
            {club && (
              <View style={profileStyles.clubDetails}>
                <Text style={profileStyles.clubName}>{club.name}</Text>
                <View style={profileStyles.approvedBadgeContainer}>
                  <View style={profileStyles.approvedDot} />
                  <Text style={profileStyles.statusText}>Active & Approved</Text>
                </View>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
};

export default ClubStatusCard;

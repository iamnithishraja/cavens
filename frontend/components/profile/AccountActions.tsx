import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { profileStyles } from './styles';
import type { AccountActionsProps } from './types';

const AccountActions: React.FC<AccountActionsProps> = ({
  onPrivacyPolicy,
  onDeleteAccount,
  onLogout
}) => {
  return (
    <View style={profileStyles.accountActions}>
      <TouchableOpacity style={profileStyles.actionButton} onPress={onPrivacyPolicy}>
        <View style={profileStyles.actionButtonContent}>
          <Ionicons name="shield-checkmark-outline" size={20} color={Colors.textPrimary} />
          <Text style={profileStyles.actionButtonText}>Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity style={profileStyles.actionButton} onPress={onDeleteAccount}>
        <View style={profileStyles.actionButtonContent}>
          <Ionicons name="trash-outline" size={20} color={Colors.error} />
          <Text style={[profileStyles.actionButtonText, { color: Colors.error }]}>Delete Account</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.error} />
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity style={profileStyles.actionButton} onPress={onLogout}>
        <View style={profileStyles.actionButtonContent}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={[profileStyles.actionButtonText, { color: Colors.error }]}>Logout</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.error} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default AccountActions;

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Dimensions, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import apiClient from '@/app/api/client';
import { store } from '@/utils';
import { Ionicons } from '@expo/vector-icons';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isPhoneVerified: boolean;
}

interface Club {
  id: string;
  name: string;
  status: 'approved' | 'pending';
}

interface ProfileData {
  user: User;
  club: Club | null;
  clubStatus: 'approved' | 'pending' | null;
}

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);
  const router = useRouter();

  // Fetch user profile on component mount
  useEffect(() => {
    fetchUserProfile();
    loadStoredUserData();
  }, []);

  // Load stored user data (role, club info) from secure storage
  const loadStoredUserData = async () => {
    try {
      const storedRole = await store.get('userRole');
      const storedClubData = await store.get('clubData');
      
      if (storedRole) {
        console.log('Found stored user role:', storedRole);

      }
      if (storedClubData) {
        console.log('Found stored club data:', storedClubData);
      }
    } catch (error) {
      console.log(' Error loading stored user data:', error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/user/profile');
      console.log('URL:', response.data.data);
      if (response.data.success) {
        setProfileData(response.data.data);
        
        // Store user data in the same format as your layout expects
        const userData = {
          role: response.data.data.user.role,
          name: response.data.data.user.name,
          email: response.data.data.user.email,
          id: response.data.data.user.id
        };
        await store.set('user', JSON.stringify(userData));
        
        if (response.data.data.club) {
          await store.set('clubData', JSON.stringify(response.data.data.club));
        } else {
          // Clear club data if no club is associated
          await store.delete('clubData');
        }
      } else {
        Alert.alert('Error', 'Failed to fetch profile data');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToClub = async () => {
    console.log('switch to club');
    setIsSwitching(true);
    
    try {
      const response = await apiClient.post('/api/user/switch-to-club');
      console.log('res is ', response);
      
      if (response.data.success) {
        const { user, club } = response.data.data;
        
        // Store user data in the same format as your layout expects
        const userData = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role, // This will be "club" now
        };
        
        await store.set('user', JSON.stringify(userData));
        
        // Store club data for future use
        if (club) {
          await store.set('clubData', JSON.stringify(club));
        }
        
        // Update local state if you have setProfileData
        // setProfileData({ user, club });
        
        // Success message
        Alert.alert('Success', 'Successfully switched to club mode!', [
          {
            text: 'OK',
            onPress: () => {
              // Force navigation to club tabs
              router.replace('/(tabs)/adminTabs');
            }
          }
        ]);
        
      } else {
        Alert.alert('Error', response.data.message || 'Failed to switch to club mode.');
      }
      
    } catch (error: any) {
      console.log('error is ', error);
      
      // Handle different HTTP status codes
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || '';
        
        switch (status) {
          case 400:
            if (message === 'User is already using club role') {
              Alert.alert('Info', 'You are already using club role.', [
                {
                  text: 'OK',
                  onPress: () => router.replace('/(tabs)/adminTabs')
                }
              ]);
            } else if (message === 'No club associated with user') {
              Alert.alert(
                'Club Registration Required', 
                'You need to register a club first.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Register Club', 
                    onPress: () => router.push('/club-registration') 
                  }
                ]
              );
            } else {
              Alert.alert('Error', message || 'Invalid request.');
            }
            break;
            
          case 401:
            // Clear user data and redirect to auth
            await store.delete('user');
            await store.delete('token');
            Alert.alert(
              'Authentication Required', 
              'You need to login first.',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Login', 
                  onPress: () => router.replace('/auth/Auth') 
                }
              ]
            );
            break;
            
          case 403:
            // Handle club not approved case
            const clubStatus = error.response.data?.clubStatus;
            if (clubStatus === 'pending') {
              Alert.alert(
                'Club Pending Approval', 
                'Your club registration is still pending admin approval. Please wait for approval before switching to club mode.',
                [{ 
                  text: 'View Details',
                  onPress: () => router.push('/club/details')
                }]
              );
            } else {
              Alert.alert('Access Denied', message || 'You do not have permission to perform this action.');
            }
            break;
            
          case 404:
            // Clear user data and redirect to auth
            await store.delete('user');
            await store.delete('token');
            Alert.alert('Error', 'User not found. Please login again.', [
              {
                text: 'OK',
                onPress: () => router.replace('/auth/Auth')
              }
            ]);
            break;
            
          case 500:
            Alert.alert('Server Error', 'Something went wrong on our end. Please try again later.');
            break;
            
          default:
            Alert.alert('Error', message || 'Something went wrong. Please try again.');
        }
      } else if (error.request) {
        // Network error
        Alert.alert('Network Error', 'Please check your internet connection and try again.');
      } else {
        // Other errors
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
    } finally {
      setIsSwitching(false);
    }
  };
  

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => {
          console.log('User logged out');
        }},
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          console.log('Account deletion requested');
        }},
      ]
    );
  };

  const handlePrivacyPolicy = () => {
    console.log('Privacy policy opened');
    // Add navigation to privacy policy screen or open web link
  };

  if (loading) {
    return (
      <LinearGradient
        colors={Colors.gradients.background as [string, string]}
        style={styles.container}
      >
        <View style={[styles.content, styles.centered]}>
          <LinearGradient
            colors={Colors.gradients.blueGlow as [string, string]}
            style={styles.loadingContainer}
          >
            <ActivityIndicator size="large" color={Colors.accentYellow} />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </LinearGradient>
        </View>
      </LinearGradient>
    );
  }

  if (!profileData) {
    return (
      <LinearGradient
        colors={Colors.gradients.background as [string, string]}
        style={styles.container}
      >
        <View style={[styles.content, styles.centered]}>
          <LinearGradient
            colors={Colors.gradients.card as [string, string]}
            style={styles.errorContainer}
          >
            <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
            <Text style={styles.errorText}>Failed to load profile data</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchUserProfile}>
              <LinearGradient
                colors={[Colors.accentYellow, "#F7C84A"]}
                style={styles.retryGradient}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </LinearGradient>
    );
  }

  const { user, club, clubStatus } = profileData;

  // If user is a club user, show club management interface
  if (user?.role === 'club') {
    return (
      <LinearGradient
        colors={Colors.gradients.background as [string, string]}
        style={styles.container}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Profile Header Section */}
            <View style={styles.profileHeader}>
              <LinearGradient
                colors={Colors.gradients.blueGlow as [string, string]}
                style={styles.profilePictureContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.profilePicture}>
                  <Text style={styles.profileInitial}>
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                </View>
              </LinearGradient>
              
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'No email'}</Text>
              <View style={styles.roleBadge}>
                <LinearGradient
                  colors={[Colors.accentYellow, "#F7C84A"]}
                  style={styles.roleBadgeGradient}
                >
                  <Ionicons name="business" size={14} color={Colors.button.text} />
                  <Text style={styles.roleBadgeText}>Club Manager</Text>
                </LinearGradient>
              </View>
            </View>

            {/* Club Status Card */}
            <LinearGradient
              colors={Colors.gradients.card as [string, string]}
              style={styles.clubStatusCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <LinearGradient
                colors={Colors.gradients.blueGlow as [string, string]}
                style={styles.glowOverlay}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0.3 }}
              />
              
              <View style={styles.clubStatusContent}>
                <View style={styles.clubStatusHeader}>
                  <Ionicons name="business" size={20} color={Colors.accentBlue} />
                  <Text style={styles.clubStatusTitle}>Club Management</Text>
                </View>
                <Text style={styles.subtitle}>You are currently in club mode</Text>
                
                {club && (
                  <View style={styles.clubDetails}>
                    <Text style={styles.clubName}>{club.name}</Text>
                    <View style={styles.approvedBadge}>
                      <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
                      <Text style={styles.statusText}>Active & Approved</Text>
                    </View>
                  </View>
                )}
              </View>
            </LinearGradient>

            {/* Account Actions */}
            <View style={styles.accountActions}>
              <TouchableOpacity style={styles.actionButton} onPress={handlePrivacyPolicy}>
                <LinearGradient
                  colors={Colors.gradients.card as [string, string]}
                  style={styles.actionButtonGradient}
                >
                  <Ionicons name="shield-checkmark-outline" size={20} color={Colors.textPrimary} />
                  <Text style={styles.actionButtonText}>Privacy Policy</Text>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton} onPress={handleDeleteAccount}>
                <LinearGradient
                  colors={['rgba(255, 107, 107, 0.1)', 'rgba(255, 107, 107, 0.05)']}
                  style={styles.actionButtonGradient}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                  <Text style={[styles.actionButtonText, { color: '#FF6B6B' }]}>Delete Account</Text>
                  <Ionicons name="chevron-forward" size={16} color="#FF6B6B" />
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
                <LinearGradient
                  colors={['rgba(255, 107, 107, 0.1)', 'rgba(255, 107, 107, 0.05)']}
                  style={styles.actionButtonGradient}
                >
                  <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
                  <Text style={[styles.actionButtonText, { color: '#FF6B6B' }]}>Logout</Text>
                  <Ionicons name="chevron-forward" size={16} color="#FF6B6B" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  // Normal user profile
  return (
    <LinearGradient
      colors={Colors.gradients.background as [string, string]}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Profile Header Section */}
          <View style={styles.profileHeader}>
            <LinearGradient
              colors={Colors.gradients.blueGlow as [string, string]}
              style={styles.profilePictureContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.profilePicture}>
                <Text style={styles.profileInitial}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
            </LinearGradient>
            
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'No email'}</Text>
            <View style={styles.roleBadge}>
              <LinearGradient
                colors={['rgba(78, 162, 255, 0.3)', 'rgba(78, 162, 255, 0.1)']}
                style={styles.roleBadgeGradient}
              >
                <Ionicons name="person" size={14} color={Colors.accentBlue} />
                <Text style={styles.userRoleBadgeText}>User</Text>
              </LinearGradient>
            </View>
          </View>

          {/* Club Status Section */}
          {club && (
            <LinearGradient
              colors={Colors.gradients.card as [string, string]}
              style={styles.clubStatusCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <LinearGradient
                colors={Colors.gradients.blueGlow as [string, string]}
                style={styles.glowOverlay}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0.3 }}
              />
              
              <View style={styles.clubStatusContent}>
                <View style={styles.clubStatusHeader}>
                  <Ionicons name="business" size={20} color={Colors.accentBlue} />
                  <Text style={styles.clubStatusTitle}>Your Club</Text>
                </View>
                <Text style={styles.clubName}>{club.name}</Text>
                <View style={[
                  styles.statusBadge,
                  clubStatus === 'approved' ? styles.approvedBadge : styles.pendingBadge
                ]}>
                  <Ionicons 
                    name={clubStatus === 'approved' ? 'checkmark-circle' : 'time'} 
                    size={16} 
                    color={clubStatus === 'approved' ? '#22C55E' : '#FBBF24'} 
                  />
                  <Text style={styles.statusText}>
                    {clubStatus === 'approved' ? 'Approved' : 'Pending Approval'}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          )}

          {/* Switch to Club Button */}
          <TouchableOpacity
            style={styles.switchButton}
            onPress={handleSwitchToClub}
            disabled={isSwitching}
          >
            <LinearGradient
              colors={[Colors.accentYellow, "#F7C84A", "#F4B93A"]}
              style={styles.switchGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {isSwitching ? (
                <ActivityIndicator color={Colors.button.text} />
              ) : (
                <>
                  <Ionicons name="business" size={24} color={Colors.button.text} />
                  <Text style={styles.switchButtonText}>Switch to Club Mode</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Account Actions */}
          <View style={styles.accountActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handlePrivacyPolicy}>
              <LinearGradient
                colors={Colors.gradients.card as [string, string]}
                style={styles.actionButtonGradient}
              >
                <Ionicons name="shield-checkmark-outline" size={20} color={Colors.textPrimary} />
                <Text style={styles.actionButtonText}>Privacy Policy</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleDeleteAccount}>
              <LinearGradient
                colors={['rgba(255, 107, 107, 0.1)', 'rgba(255, 107, 107, 0.05)']}
                style={styles.actionButtonGradient}
              >
                <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                <Text style={[styles.actionButtonText, { color: '#FF6B6B' }]}>Delete Account</Text>
                <Ionicons name="chevron-forward" size={16} color="#FF6B6B" />
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
              <LinearGradient
                colors={['rgba(255, 107, 107, 0.1)', 'rgba(255, 107, 107, 0.05)']}
                style={styles.actionButtonGradient}
              >
                <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
                <Text style={[styles.actionButtonText, { color: '#FF6B6B' }]}>Logout</Text>
                <Ionicons name="chevron-forward" size={16} color="#FF6B6B" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100, // Extra padding for tab bar
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Profile Header Section
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 50,
  },
  profilePictureContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    padding: 3,
    shadowColor: Colors.accentBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  profilePicture: {
    width: 114,
    height: 114,
    borderRadius: 57,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.accentBlue,
  },
  profileInitial: {
    fontSize: 42,
    fontWeight: '800',
    color: Colors.accentBlue,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  roleBadge: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  roleBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.button.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userRoleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.accentBlue,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Club Status Section
  clubStatusCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.borderBlue,
    marginBottom: 24,
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
  clubStatusContent: {
    padding: 32,
    paddingTop: 40,
  },
  clubStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  clubStatusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginLeft: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  clubDetails: {
    alignItems: 'center',
  },
  clubName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.accentBlue,
    marginBottom: 12,
    textAlign: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  approvedBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  pendingBadge: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },

  // Switch Button
  switchButton: {
    width: '100%',
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: Colors.accentYellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  switchGradient: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    gap: 12,
  },
  switchButtonText: {
    color: Colors.button.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Account Actions
  accountActions: {
    gap: 12,
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderBlue,
    gap: 12,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
  },

  // Loading and Error States
  loadingContainer: {
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderBlue,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
  },
  errorContainer: {
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderBlue,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
    fontWeight: '500',
  },
  retryButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  retryGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: Colors.button.text,
    fontSize: 16,
    fontWeight: '700',
  },
});
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Dimensions, ScrollView, StatusBar, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import apiClient from '@/app/api/client';
import { store } from '@/utils';
import { Ionicons } from '@expo/vector-icons';
import { triggerUserRoleCheck } from '@/app/_layout';
import BookingHistory from '@/components/common/BookingHistory';

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

const { width, height } = Dimensions.get('window');

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
               // Navigate directly to admin tabs since role is now "club"
               console.log('🔄 Navigating to admin tabs...');
               router.navigate('/(tabs)/adminTabs');
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
                  onPress: () => {
                  // Trigger the root layout to re-check user role
                  triggerUserRoleCheck();
                  // Navigate to admin tabs
                  router.replace('/(tabs)/adminTabs');
                }
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
    store.delete('user');
    store.delete('token');
    router.replace('/auth/Auth');
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
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        {/* Subtle Pattern Overlay */}
        <View style={styles.patternOverlay}>
          <LinearGradient
            colors={['rgba(43, 44, 20, 0.5)', 'transparent', 'transparent']}
            locations={[0.1, 0.3, 1]}
            style={styles.topGlow}
          />
        </View>

        <View style={[styles.content, styles.centered]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        </View>
      </View>
    );
  }

  if (!profileData) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        {/* Subtle Pattern Overlay */}
        <View style={styles.patternOverlay}>
          <LinearGradient
            colors={['rgba(43, 44, 20, 0.5)', 'transparent', 'transparent']}
            locations={[0.1, 0.3, 1]}
            style={styles.topGlow}
          />
        </View>

        <View style={[styles.content, styles.centered]}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
            <Text style={styles.errorText}>Failed to load profile data</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchUserProfile}>
              <LinearGradient
                colors={Colors.gradients.button as [string, string]}
                style={styles.retryGradient}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const { user, club, clubStatus } = profileData;

  // If user is a club user, show club management interface
  if (user?.role === 'club') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        {/* Subtle Pattern Overlay */}
        <View style={styles.patternOverlay}>
          <LinearGradient
            colors={['rgba(43, 44, 20, 0.5)', 'transparent', 'transparent']}
            locations={[0.1, 0.3, 1]}
            style={styles.topGlow}
          />
        </View>

        <View style={styles.content}>
          <View style={styles.content}>
            {/* Profile Header Section */}
            <View style={styles.profileHeader}>
              <View style={styles.profilePictureContainer}>
                <LinearGradient
                  colors={[Colors.primary, Colors.primaryDark]}
                  style={styles.profilePictureGradient}
                >
                  <View style={styles.profilePicture}>
                    <Text style={styles.profileInitial}>
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </Text>
                  </View>
                </LinearGradient>
              </View>
              
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'No email'}</Text>
              
              <View style={styles.roleBadgeContainer}>
                <View style={styles.roleDot} />
                <Text style={styles.roleBadgeText}>Club Manager</Text>
              </View>
            </View>

            {/* Club Status Card */}
            <View style={styles.clubStatusCard}>
              <View style={styles.clubStatusContent}>
                <View style={styles.clubStatusHeader}>
                  <Ionicons name="business" size={20} color={Colors.primary} />
                  <Text style={styles.clubStatusTitle}>Club Management</Text>
                </View>
                <Text style={styles.subtitle}>You are currently in club mode</Text>
                
                {club && (
                  <View style={styles.clubDetails}>
                    <Text style={styles.clubName}>{club.name}</Text>
                    <View style={styles.approvedBadgeContainer}>
                      <View style={styles.approvedDot} />
                      <Text style={styles.statusText}>Active & Approved</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Account Actions */}
            <View style={styles.accountActions}>
              <TouchableOpacity style={styles.actionButton} onPress={handlePrivacyPolicy}>
                <View style={styles.actionButtonContent}>
                  <Ionicons name="shield-checkmark-outline" size={20} color={Colors.textPrimary} />
                  <Text style={styles.actionButtonText}>Privacy Policy</Text>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton} onPress={handleDeleteAccount}>
                <View style={styles.actionButtonContent}>
                  <Ionicons name="trash-outline" size={20} color={Colors.error} />
                  <Text style={[styles.actionButtonText, { color: Colors.error }]}>Delete Account</Text>
                  <Ionicons name="chevron-forward" size={16} color={Colors.error} />
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
                <View style={styles.actionButtonContent}>
                  <Ionicons name="log-out-outline" size={20} color={Colors.error} />
                  <Text style={[styles.actionButtonText, { color: Colors.error }]}>Logout</Text>
                  <Ionicons name="chevron-forward" size={16} color={Colors.error} />
                </View>
              </TouchableOpacity>
            </View>

            {/* Booking History Section */}
            <View style={styles.bookingHistorySection}>
              <Text style={styles.sectionTitle}>Event History</Text>
              <Text style={styles.sectionSubtitle}>Your attended events and scanned tickets</Text>
              <BookingHistory showHeader={false} />
            </View>
          </View>
        </View>

        {/* Booking History Section - Separate from ScrollView */}
        <View style={styles.bookingHistoryContainer}>
          <View style={styles.bookingHistorySection}>
            <Text style={styles.sectionTitle}>Event History</Text>
            <Text style={styles.sectionSubtitle}>Your attended events and scanned tickets</Text>
          </View>
          <BookingHistory showHeader={false} />
        </View>
      </View>
    );
  }

  // Normal user profile
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Subtle Pattern Overlay */}
      <View style={styles.patternOverlay}>
        <LinearGradient
          colors={['rgba(43, 44, 20, 0.5)', 'transparent', 'transparent']}
          locations={[0.1, 0.3, 1]}
          style={styles.topGlow}
        />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Profile Header Section */}
          <View style={styles.profileHeader}>
            <View style={styles.profilePictureContainer}>
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                style={styles.profilePictureGradient}
              >
                <View style={styles.profilePicture}>
                  <Text style={styles.profileInitial}>
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                </View>
              </LinearGradient>
            </View>
            
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'No email'}</Text>
            
            <View style={styles.roleBadgeContainer}>
              <View style={styles.roleDot} />
              <Text style={styles.roleBadgeText}>User</Text>
            </View>
          </View>

          {/* Club Status Section */}
          {club && (
            <View style={styles.clubStatusCard}>
              <View style={styles.clubStatusContent}>
                <View style={styles.clubStatusHeader}>
                  <Ionicons name="business" size={20} color={Colors.primary} />
                  <Text style={styles.clubStatusTitle}>Your Club</Text>
                </View>
                <Text style={styles.clubName}>{club.name}</Text>
                <View style={[
                  styles.statusBadgeContainer,
                  clubStatus === 'approved' ? styles.approvedBadgeContainer : styles.pendingBadgeContainer
                ]}>
                  <View style={[
                    styles.statusDot,
                    clubStatus === 'approved' ? styles.approvedDot : styles.pendingDot
                  ]} />
                  <Text style={styles.statusText}>
                    {clubStatus === 'approved' ? 'Approved' : 'Pending Approval'}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Switch to Club Button */}
          <TouchableOpacity
            style={styles.switchButton}
            onPress={handleSwitchToClub}
            disabled={isSwitching}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={Colors.gradients.button as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.switchGradient}
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
              <View style={styles.actionButtonContent}>
                <Ionicons name="shield-checkmark-outline" size={20} color={Colors.textPrimary} />
                <Text style={styles.actionButtonText}>Privacy Policy</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleDeleteAccount}>
              <View style={styles.actionButtonContent}>
                <Ionicons name="trash-outline" size={20} color={Colors.error} />
                <Text style={[styles.actionButtonText, { color: Colors.error }]}>Delete Account</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.error} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
              <View style={styles.actionButtonContent}>
                <Ionicons name="log-out-outline" size={20} color={Colors.error} />
                <Text style={[styles.actionButtonText, { color: Colors.error }]}>Logout</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.error} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Booking History Section */}
          <View style={styles.bookingHistorySection}>
            <Text style={styles.sectionTitle}>Event History</Text>
            <Text style={styles.sectionSubtitle}>Your attended events and scanned tickets</Text>
            <BookingHistory showHeader={false} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  patternOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  topGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.5,
    borderRadius: 0,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: 100, // Extra padding for tab bar
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Profile Header Section
  profileHeader: {
    alignItems: 'center',
    marginBottom: 60,
  },
  profilePictureContainer: {
    marginBottom: 24,
  },
  profilePictureGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  profilePicture: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 42,
    fontWeight: '800',
    color: Colors.primary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  userName: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  userEmail: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '400',
  },
  roleBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },

  // Club Status Section
  clubStatusCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 40,
    overflow: 'hidden',
  },
  clubStatusContent: {
    padding: 32,
  },
  clubStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  clubStatusTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    fontWeight: '400',
  },
  clubDetails: {
    alignItems: 'center',
  },
  clubName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  statusBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  approvedBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pendingBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  approvedDot: {
    backgroundColor: Colors.success,
  },
  pendingDot: {
    backgroundColor: Colors.warning,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Switch Button
  switchButton: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    marginBottom: 50,
    overflow: 'hidden',
  },
  switchGradient: {
    height: 64,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    gap: 12,
  },
  switchButtonText: {
    color: Colors.button.text,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Account Actions
  accountActions: {
    gap: 16,
  },
  actionButton: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },

  // Loading and Error States
  loadingContainer: {
    backgroundColor: Colors.backgroundSecondary,
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: Colors.backgroundSecondary,
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  errorText: {
    color: Colors.error,
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
    fontWeight: '500',
  },
  retryButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  retryGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  retryButtonText: {
    color: Colors.button.text,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Booking History Section
  bookingHistoryContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  bookingHistorySection: {
    marginTop: 40,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
    fontWeight: '400',
  },
});
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import apiClient from '@/app/api/client';
import { store } from '@/utils';

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
        console.log('📱 Found stored user role:', storedRole);
      }
      if (storedClubData) {
        console.log('🏢 Found stored club data:', storedClubData);
      }
    } catch (error) {
      console.error('❌ Error loading stored user data:', error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/user/profile');
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
        
        console.log('Profile data fetched and stored:', {
          role: userData.role,
          hasClub: !!response.data.data.club
        });
      } else {
        Alert.alert('Error', 'Failed to fetch profile data');
      }
    } catch (error: any) {
      console.log('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToClub = async () => {
    setIsSwitching(true);
    try {
      const response = await apiClient.post('/api/user/switch-to-club');
      if (response.data.success) {
        console.log('Successfully switched to club role');
        
        // Store user data in the same format as your layout expects
        const userData = {
          role: 'club',
          name: response.data.data.user.name,
          email: response.data.data.user.email,
          id: response.data.data.user.id
        };
        await store.set('user', JSON.stringify(userData));
        
        // Store club data for future use
        if (response.data.data.club) {
          await store.set('clubData', JSON.stringify(response.data.data.club));
        }
        
        // Update local state with the response data
        setProfileData(response.data.data);
        
        Alert.alert('Success', 'Successfully switched to club mode!');
      } else {
        Alert.alert('Error', 'Failed to switch to club mode. Please try again.');
      }
    } catch (error: any) {
      console.log('Error switching to club:', error.response?.status, error.response?.data);
      if (error.response?.status === 400) {
        if (error.response?.data?.message?.includes('No club associated')) {
          console.log('No club associated with user - redirecting to club registration');
          router.push('/club-registration');
        } else if (error.response?.data?.message?.includes('not yet approved')) {
          console.log('Club pending approval');
          router.push('/club/details');
        } else {
          Alert.alert('Error', error.response?.data?.message || 'Something went wrong.');
        }
      } else {
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
    } finally {
      setIsSwitching(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={Colors.gradients.background as [string, string]}
          style={styles.gradient}
        >
          <View style={[styles.content, styles.centered]}>
            <ActivityIndicator size="large" color={Colors.accentBlue} />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!profileData) {
    return (
      
        <LinearGradient
          colors={Colors.gradients.background as [string, string]}
          style={styles.gradient}
        >
          <View style={[styles.content, styles.centered]}>
            <Text style={styles.errorText}>Failed to load profile data</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchUserProfile}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
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
                <Text style={styles.title}>Club Management</Text>
                <Text style={styles.subtitle}>You are currently in club mode</Text>
                
                {club && (
                  <View style={styles.clubInfo}>
                    <Text style={styles.clubName}>{club.name}</Text>
                    <View style={styles.approvedBadge}>
                      <Text style={styles.statusText}>Active</Text>
                    </View>
                  </View>
                )}
              </View>
            </LinearGradient>
          </View>
        </LinearGradient>
      
    );
  }

  // Normal user profile - always show Switch to Club button
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
              {/* Profile Picture */}
              <View style={styles.profilePicture}>
                <Text style={styles.profileInitial}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>

              {/* User Info */}
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'No email'}</Text>

              {/* Club Status */}
              {club && (
                <View style={styles.clubInfo}>
                  <Text style={styles.clubName}>{club.name}</Text>
                  <View style={[
                    styles.statusBadge,
                    clubStatus === 'approved' ? styles.approvedBadge : styles.pendingBadge
                  ]}>
                    <Text style={styles.statusText}>
                      {clubStatus === 'approved' ? 'Approved' : 'Pending'}
                    </Text>
                  </View>
                </View>
              )}

              {/* Switch to Club Button - ALWAYS SHOW for normal users */}
              <TouchableOpacity
                style={styles.switchButton}
                onPress={handleSwitchToClub}
                disabled={isSwitching}
              >
                <LinearGradient
                  colors={[Colors.accentYellow, "#F7C84A"]}
                  style={styles.switchGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {isSwitching ? (
                    <ActivityIndicator color={Colors.button.text} />
                  ) : (
                    <Text style={styles.switchButtonText}>Switch to Club</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  profilePicture: {
    width: 120, // Increased size
    height: 120, // Increased size
    borderRadius: 60, // Circle shape
    backgroundColor: Colors.accentBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.borderBlue,
  },
  profileInitial: {
    fontSize: 48, // Larger font size for initials
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  userName: {
    fontSize: 26, // Larger font for name
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  clubInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  clubName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.accentBlue,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  approvedBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.5)',
  },
  pendingBadge: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.5)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  switchButton: {
    width: '100%',
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: Colors.accentYellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  switchGradient: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  switchButtonText: {
    color: Colors.button.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  logoutButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  logoutButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginTop: 16,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.accentBlue,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});

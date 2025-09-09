import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StatusBar, Alert, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import apiClient from '@/app/api/client';
import { store } from '@/utils';
import { triggerUserRoleCheck } from '@/app/_layout';

// Import modular components
import {
  ProfileHeader,
  ClubStatusCard,
  AccountActions,
  SwitchToClubButton,
  LoadingState,
  ErrorState,
  BookingHistoryList,
  profileStyles,
  type ProfileData
} from '@/components/profile';

// Types are now imported from the modular components

export default function ProfileScreen() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
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

  const fetchUserProfile = async (isInitialLoad = true) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      }
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
      if (isInitialLoad) {
        setLoading(false);
      }
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

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserProfile(false); // Don't show loading state during refresh
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={profileStyles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        {/* Subtle Pattern Overlay */}
        <View style={profileStyles.patternOverlay}>
          <LinearGradient
            colors={['rgba(43, 44, 20, 0.5)', 'transparent', 'transparent']}
            locations={[0.1, 0.3, 1]}
            style={profileStyles.topGlow}
          />
        </View>

        <View style={profileStyles.content}>
          <LoadingState message="Loading profile..." />
        </View>
      </View>
    );
  }

  if (!profileData) {
    return (
      <View style={profileStyles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        {/* Subtle Pattern Overlay */}
        <View style={profileStyles.patternOverlay}>
          <LinearGradient
            colors={['rgba(43, 44, 20, 0.5)', 'transparent', 'transparent']}
            locations={[0.1, 0.3, 1]}
            style={profileStyles.topGlow}
          />
        </View>

        <View style={profileStyles.content}>
          <ErrorState 
            message="Failed to load profile data" 
            onRetry={fetchUserProfile} 
          />
        </View>
      </View>
    );
  }

  const { user, club, clubStatus } = profileData;

  // If user is a club user, show club management interface
  if (user?.role === 'club') {
    return (
      <View style={profileStyles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        {/* Subtle Pattern Overlay */}
        <View style={profileStyles.patternOverlay}>
          <LinearGradient
            colors={['rgba(43, 44, 20, 0.5)', 'transparent', 'transparent']}
            locations={[0.1, 0.3, 1]}
            style={profileStyles.topGlow}
          />
        </View>

        <ScrollView 
          style={profileStyles.scrollView} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
              progressBackgroundColor={Colors.backgroundSecondary}
            />
          }
        >
          <View style={profileStyles.content}>
            <ProfileHeader user={user} />
            
            {club && (
              <ClubStatusCard club={club} clubStatus={clubStatus} />
            )}

            <AccountActions
              onPrivacyPolicy={handlePrivacyPolicy}
              onDeleteAccount={handleDeleteAccount}
              onLogout={handleLogout}
            />

            {/* Booking History Section */}
            <View style={profileStyles.bookingHistorySection}>
              <Text style={profileStyles.sectionTitle}>Event History</Text>
              <Text style={profileStyles.sectionSubtitle}>Your attended events and scanned tickets</Text>
              <BookingHistoryList />
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Normal user profile
  return (
    <View style={profileStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Subtle Pattern Overlay */}
      <View style={profileStyles.patternOverlay}>
        <LinearGradient
          colors={['rgba(43, 44, 20, 0.5)', 'transparent', 'transparent']}
          locations={[0.1, 0.3, 1]}
          style={profileStyles.topGlow}
        />
      </View>

      <ScrollView 
        style={profileStyles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
            progressBackgroundColor={Colors.backgroundSecondary}
          />
        }
      >
        <View style={profileStyles.content}>
          <ProfileHeader user={user} />

          {/* Club Status Section */}
          {club && (
            <ClubStatusCard club={club} clubStatus={clubStatus} />
          )}

          {/* Switch to Club Button */}
          <SwitchToClubButton
            onSwitchToClub={handleSwitchToClub}
            isSwitching={isSwitching}
          />

          <AccountActions
            onPrivacyPolicy={handlePrivacyPolicy}
            onDeleteAccount={handleDeleteAccount}
            onLogout={handleLogout}
          />

          {/* Booking History Section */}
          <View style={profileStyles.bookingHistorySection}>
            <Text style={profileStyles.sectionTitle}>Event History</Text>
            <Text style={profileStyles.sectionSubtitle}>Your attended events and scanned tickets</Text>
            <BookingHistoryList />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

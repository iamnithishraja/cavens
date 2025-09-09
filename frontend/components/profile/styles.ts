import { StyleSheet, Dimensions, Platform } from 'react-native';
import { Colors } from '@/constants/Colors';

const { width, height } = Dimensions.get('window');

export const profileStyles = StyleSheet.create({
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

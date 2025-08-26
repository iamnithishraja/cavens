export const Colors = {
  // Primary Colors
  primary: '#FFD700', // Gold/Yellow for buttons and accents
  primaryDark: '#FFA500', // Darker gold for pressed states
  primaryLight: '#FFED4E', // Lighter gold for highlights
  
  // Background Colors
  background: '#000000', // Pure black main background
  backgroundSecondary: '#1A1A1A', // Dark grey for cards/sections
  backgroundTertiary: '#2A2A2A', // Lighter grey for elevated elements
  
  // Text Colors
  textPrimary: '#FFFFFF', // White for main text
  textSecondary: '#B0B0B0', // Grey for secondary text
  textMuted: '#808080', // Muted grey for less important text
  
  // Blue Accent Colors (from hero section)
  blueAccent: '#0066CC', // Deep blue from main image
  blueDark: '#004499', // Darker blue
  blueLight: '#3399FF', // Lighter blue accent
  
  // Status Colors
  success: '#00FF88', // Green for success states
  warning: '#FFB800', // Orange for warnings
  error: '#FF3B30', // Red for errors
  info: '#007AFF', // Blue for info
  
  // Rating Stars
  starActive: '#FFD700', // Gold for filled stars
  starInactive: '#404040', // Dark grey for empty stars
  
  // Gradients
  gradients: {
    primary: ['#FFD700', '#FFA500'], // Gold gradient
    background: ['#000000', '#1A1A1A'], // Black to dark grey
    hero: ['#0066CC', '#003366'], // Blue gradient for hero sections
    card: ['#1A1A1A', '#2A2A2A'], // Card gradient
    button: ['#FFD700', '#FFB800'], // Button gradient
    overlay: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)'], // Overlay gradient
    blue: ['#0066CC', '#003399', '#001a66'], // Multi-stop blue gradient
  },
  
  // Semantic Colors
  border: '#333333', // Border color
  separator: '#2A2A2A', // Separator lines
  shadow: 'rgba(0,0,0,0.5)', // Shadow color
  overlay: 'rgba(0,0,0,0.6)', // Overlay background
  
  // Interactive States
  buttonPrimary: '#FFD700',
  buttonPrimaryPressed: '#FFA500',
  buttonSecondary: '#333333',
  buttonSecondaryPressed: '#404040',
  
  // Button Object (for nested button properties)
  button: {
    text: '#000000', // Dark text for gold buttons
    textSecondary: '#FFFFFF', // White text for secondary buttons
    background: '#FFD700', // Gold background
    backgroundSecondary: '#333333', // Dark background for secondary
    backgroundPressed: '#FFA500', // Pressed state
  },
  
  // Navigation Colors
  tabActive: '#FFD700', // Active tab color
  tabInactive: '#808080', // Inactive tab color
  navigationBackground: '#000000', // Bottom navigation background
  
  // Special Elements
  distance: '#B0B0B0', // Distance text color
  rating: '#FFD700', // Rating color
  venue: '#FFFFFF', // Venue name color
  genre: '#B0B0B0', // Music genre color
  
  // Opacity Variants
  opacity: {
    low: 0.1,
    medium: 0.3,
    high: 0.6,
    overlay: 0.8,
  },
  
  // With Opacity Helper Colors
  withOpacity: {
    primary10: 'rgba(255, 215, 0, 0.1)',
    primary30: 'rgba(255, 215, 0, 0.3)',
    primary60: 'rgba(255, 215, 0, 0.6)',
    white10: 'rgba(255, 255, 255, 0.1)',
    white30: 'rgba(255, 255, 255, 0.3)',
    white60: 'rgba(255, 255, 255, 0.6)',
    black30: 'rgba(0, 0, 0, 0.3)',
    black60: 'rgba(0, 0, 0, 0.6)',
    black80: 'rgba(0, 0, 0, 0.8)',
  },

};
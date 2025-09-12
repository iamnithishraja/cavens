// Enhanced dark, minimal Google Maps style for react-native-maps
// Perfectly aligned with app theme: gold accents, improved contrast, premium feel
// Focuses on roads and navigation while maintaining the dark aesthetic

export const darkMapStyle = [
  // Base: deep black background
  {
    elementType: 'geometry',
    stylers: [{ color: '#000000' }],
  },
  {
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },

  // Roads: Enhanced hierarchy with better contrast
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1A1A1A' }], // Matches backgroundSecondary
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#333333' }], // Matches border color
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#FFFFFF' }, { visibility: 'on' }], // White text for better readability
  },
  {
    featureType: 'road',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#000000' }, { visibility: 'on' }, { width: 2 }],
  },
  {
    featureType: 'road',
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },

  // Road hierarchy: clearer distinction
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#2A2A2A' }], // Matches backgroundTertiary
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#333333' }], // More prominent for highways
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#404040' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#FFD700' }], // Gold for highway labels - premium feel
  },
  {
    featureType: 'road.local',
    elementType: 'geometry',
    stylers: [{ color: '#1A1A1A' }], // Subtler for local roads
  },
  {
    featureType: 'road.local',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#B0B0B0' }], // Secondary text color for local roads
  },

  // Water: Deep blue that complements the theme
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#001a66' }], // From your blue gradient
  },
  {
    featureType: 'water',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },

  // Parks and natural areas: Very subtle presence
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#0A0A0A' }], // Barely visible
  },
  {
    featureType: 'poi.park',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },

  // Landscape: match background colors
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [{ color: '#000000' }],
  },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry',
    stylers: [{ color: '#0A0A0A' }],
  },

  // Important roads get gold accents for premium feel
  {
    featureType: 'road.arterial',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#FFED4E' }], // Light gold for arterial roads
  },

  // Transit stations: if any slip through, make them gold
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#FFD700' }, { visibility: 'simplified' }],
  },

  // Country/state borders: subtle gold lines
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#FFD700' }, { visibility: 'simplified' }, { weight: 0.5 }],
  },
  {
    featureType: 'administrative.province',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#FFA500' }, { visibility: 'simplified' }, { weight: 0.3 }],
  },

  // Hide everything we don't want
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.medical', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.place_of_worship', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.school', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.sports_complex', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.locality', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.neighborhood', stylers: [{ visibility: 'off' }] },
  { featureType: 'landscape.man_made', stylers: [{ visibility: 'off' }] },
  
  // Buildings: completely hidden
  { featureType: 'poi.attraction', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.government', stylers: [{ visibility: 'off' }] },
];

export default darkMapStyle;
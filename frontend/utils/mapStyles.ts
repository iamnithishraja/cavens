// Google Maps style arrays for react-native-maps customMapStyle
// Updated to match requested palette and show place names and city names

const palette = {
  primary: '#FCC72C',
  secondary: '#4CB648',
  secondaryWithOpacity: 'rgba(76, 182, 72, 0.3)',
  darkBlue: '#0B0B0F',
  waterBlue: '#0E2740',
  waterLabel: '#4FA3E3',
  mediumBlue: '#1A1A1F',
  lightBlue: '#42A9E1',
  black: '#000000',
  transluscentWhite: 'rgba(255, 255, 255, 0.7)',
  lightGrey: '#f8f4f4',
  danger: '#ff5252',
  mediumGrey: '#6e6969',
  darkGrey: '#333333',
};

export const darkMapStyle = [
  // Base geometry and text
  { elementType: 'geometry', stylers: [{ color: palette.black }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'on' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: palette.black }] },
  { elementType: 'labels.text.fill', stylers: [{ color: palette.transluscentWhite }] },

  // Administrative boundaries and city names - show all
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'on' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: palette.primary, visibility: 'on' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.stroke', stylers: [{ color: palette.black }] },
  { featureType: 'administrative.neighborhood', elementType: 'labels', stylers: [{ visibility: 'on' }] },
  { featureType: 'administrative.neighborhood', elementType: 'labels.text.fill', stylers: [{ color: palette.transluscentWhite }] },
  { featureType: 'administrative.land_parcel', elementType: 'labels', stylers: [{ visibility: 'on' }] },
  { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: palette.transluscentWhite }] },

  // POIs: show all place names
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'on' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: palette.transluscentWhite }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: palette.black }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: palette.secondaryWithOpacity }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: palette.secondary, visibility: 'on' }] },
  { featureType: 'poi.attraction', elementType: 'labels.text.fill', stylers: [{ color: palette.primary, visibility: 'on' }] },
  { featureType: 'poi.business', elementType: 'labels.text.fill', stylers: [{ color: palette.transluscentWhite, visibility: 'on' }] },
  { featureType: 'poi.government', elementType: 'labels.text.fill', stylers: [{ color: palette.primary, visibility: 'on' }] },
  { featureType: 'poi.medical', elementType: 'labels.text.fill', stylers: [{ color: palette.primary, visibility: 'on' }] },
  { featureType: 'poi.place_of_worship', elementType: 'labels.text.fill', stylers: [{ color: palette.primary, visibility: 'on' }] },
  { featureType: 'poi.school', elementType: 'labels.text.fill', stylers: [{ color: palette.primary, visibility: 'on' }] },
  { featureType: 'poi.sports_complex', elementType: 'labels.text.fill', stylers: [{ color: palette.primary, visibility: 'on' }] },

  // Roads - show road names
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#151515' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: palette.black }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: palette.transluscentWhite, visibility: 'on' }] },
  { featureType: 'road', elementType: 'labels.text.stroke', stylers: [{ color: palette.black }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: palette.darkGrey }] },
  { featureType: 'road.arterial', elementType: 'geometry.stroke', stylers: [{ color: '#1f1f1f' }] },
  { featureType: 'road.arterial', elementType: 'labels.text.fill', stylers: [{ color: palette.transluscentWhite, visibility: 'on' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: palette.mediumGrey }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: palette.black }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: palette.transluscentWhite, visibility: 'on' }] },

  // Transit - show transit station names
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: palette.darkGrey }] },
  { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: palette.primary, visibility: 'on' }] },
  { featureType: 'transit.line', elementType: 'labels.text.fill', stylers: [{ color: palette.transluscentWhite, visibility: 'on' }] },

  // Water - show water body names with a subtle blue shade
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: palette.waterBlue }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: palette.waterLabel, visibility: 'on' }] },
  { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: palette.waterBlue }] },
];
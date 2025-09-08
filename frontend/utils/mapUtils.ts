export type Coordinates = { latitude: number; longitude: number };

export const extractCoordinatesFromMapLink = (mapLink: string): Coordinates | null => {
  try {
    if (!mapLink || typeof mapLink !== 'string') return null;

    const patterns = [
      /@(-?\d+\.\d+),(-?\d+\.\d+)/,        // @lat,lng
      /q=(-?\d+\.\d+),(-?\d+\.\d+)/,        // q=lat,lng
      /place\/(-?\d+\.\d+),(-?\d+\.\d+)/,   // place/lat,lng
      /ll=(-?\d+\.\d+),(-?\d+\.\d+)/,       // ll=lat,lng
    ];

    for (const pattern of patterns) {
      const match = mapLink.match(pattern);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          return { latitude: lat, longitude: lng };
        }
      }
    }
    return null;
  } catch (error) {
    console.warn('Coordinate extraction failed:', error);
    return null;
  }
};

export const calculateMapRegion = (coordinates: Coordinates[]) => {
  if (!coordinates.length) {
    return {
      latitude: 28.6139,
      longitude: 77.2090,
      latitudeDelta: 0.5,
      longitudeDelta: 0.5,
    };
  }

  const minLat = Math.min(...coordinates.map(c => c.latitude));
  const maxLat = Math.max(...coordinates.map(c => c.latitude));
  const minLng = Math.min(...coordinates.map(c => c.longitude));
  const maxLng = Math.max(...coordinates.map(c => c.longitude));

  const padding = 0.02; // padding around markers

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(maxLat - minLat + padding, 0.02),
    longitudeDelta: Math.max(maxLng - minLng + padding, 0.02),
  };
};



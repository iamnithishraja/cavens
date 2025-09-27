import axios from "axios";

// Types
interface Coordinates {
  lat: number;
  lng: number;
}

interface DistanceResult {
  distance: {
    text: string;
    value: number;
  };
  duration: {
    text: string;
    value: number;
  };
  mode: string;
}

interface HaversineResult {
  distance: {
    text: string;
    value: number;
  };
  method: string;
}

interface CalculationResult {
  origin: Coordinates;
  destination: Coordinates;
  distance: DistanceResult | HaversineResult;
}

interface GoogleMapsResponse {
  status: string;
  rows: Array<{
    elements: Array<{
      status: string;
      distance?: {
        text: string;
        value: number;
      };
      duration?: {
        text: string;
        value: number;
      };
    }>;
  }>;
}

// Extract coordinates from Google Maps link (supports short/long URLs)
export const extractCoordinatesFromLink = async (mapsLink: string): Promise<Coordinates> => {
  try {
    // axios will follow short URL redirects
    const response = await axios.get(mapsLink, { maxRedirects: 5 });
    const finalUrl = (response.request as any).res?.responseUrl || mapsLink;

    // Match standard @lat,long in URL
    const regex = /@([-.\d]+),([-.\d]+)/;
    const match = finalUrl.match(regex);

    if (match) {
      return {
        lat: parseFloat(match[1]),
        lng: parseFloat(match[2]),
      };
    }

    throw new Error("Could not extract coordinates from Maps link");
  } catch (error) {
    throw new Error(`Failed to resolve Google Maps link: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Call Google Maps Distance Matrix API
export const calculateDistance = async (
  origin: Coordinates, 
  destination: Coordinates, 
  mode: string = "driving",
  apiKey: string
): Promise<DistanceResult> => {
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&mode=${mode}&key=${apiKey}`;

  const response = await axios.get<GoogleMapsResponse>(url);

  if (response.data.status !== "OK") {
    throw new Error(`API error: ${response.data.status}`);
  }

  const element = response.data.rows[0]?.elements[0];
  if (!element || element.status !== "OK") {
    throw new Error(`Element error: ${element?.status || 'No element found'}`);
  }

  if (!element.distance || !element.duration) {
    throw new Error("Distance or duration data missing from API response");
  }

  return {
    distance: element.distance,
    duration: element.duration,
    mode,
  };
};

// Haversine fallback for straight-line distance
export const calculateHaversineDistance = (origin: Coordinates, destination: Coordinates): number => {
  const toRad = (value: number): number => (value * Math.PI) / 180;
  const R = 6371e3; // Earth radius in meters

  const φ1 = toRad(origin.lat);
  const φ2 = toRad(destination.lat);
  const Δφ = toRad(destination.lat - origin.lat);
  const Δλ = toRad(destination.lng - origin.lng);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
};

// Main function
export const calculateDistanceFromMapsLink = async (
  latitude: number,
  longitude: number,
  mapsLink: string,
  apiKey: string,
  mode: string = "driving",
  useFallback: boolean = true
): Promise<CalculationResult> => {
  try {
    const originCoords: Coordinates = { lat: latitude, lng: longitude };
    const destinationCoords: Coordinates = await extractCoordinatesFromLink(mapsLink);

    
    try {
      const distanceResult = await calculateDistance(originCoords, destinationCoords, mode, apiKey);

      return {
        origin: originCoords,
        destination: destinationCoords,
        distance: distanceResult,
      };
    } catch (apiError) {
      console.warn("Google Maps API failed:", apiError instanceof Error ? apiError.message : 'Unknown API error');

      if (useFallback) {
        const straightLineDistance = calculateHaversineDistance(originCoords, destinationCoords);

        return {
          origin: originCoords,
          destination: destinationCoords,
          distance: {
            distance: {
              text: `${(straightLineDistance / 1000).toFixed(2)} km`,
              value: Math.round(straightLineDistance),
            },
            method: "Haversine (straight-line distance)",
          },
        };
      } else {
        throw apiError;
      }
    }
  } catch (error) {
    throw new Error(`Failed to calculate distance: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Example usage function
export const exampleUsage = async (): Promise<void> => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || "YOUR_API_KEY_HERE";
  
  try {
    const result = await calculateDistanceFromMapsLink(
      13.62421636036417,  
      77.51300814026428,  
      "https://maps.app.goo.gl/gQAMWkrbs7zWdjZf6", 
      apiKey,
      "driving"
    );

    console.log("Distance calculation result:");
    console.log(result);
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : 'Unknown error');
  }
};

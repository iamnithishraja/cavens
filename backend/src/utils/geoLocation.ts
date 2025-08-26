import axios from "axios";

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // meters
    const toRad = (deg: number) => (deg * Math.PI) / 180;
  
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
  
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // meters
  }
  
  // extract lat/lon from a long map link
  export function extractLatLonFromLongUrl(url: string) {
    const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) {
      return {
        lat: parseFloat(match[1] || "0"),
        lon: parseFloat(match[2] || "0"),
      };
    }
    return null;
  }
  
  // resolve short url (maps.app.goo.gl, goo.gl/maps)
  export async function resolveShortUrl(shortUrl: string) {
    try {
      const res = await axios.get(shortUrl, { maxRedirects: 0, validateStatus: null });
      if (res.headers.location) {
        return res.headers.location;
      }
    } catch (err: any) {
      console.error("Error resolving short URL:", err.message);
    }
    return null;
  }
  
  
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import apiClient from '@/app/api/client';
import { extractCoordinatesFromMapLink } from '@/utils/mapUtils';

type HeatmapPoint = {
  latitude: number;
  longitude: number;
  weight: number; // total bookings for that location
  eventId?: string;
  clubId?: string;
};

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

type ClubWithEvents = {
  _id: string;
  mapLink?: string;
  events?: Array<{
    _id: string;
    tickets?: Array<{ _id: string; quantitySold?: number }>
  }>;
};

const withinRegion = (point: { latitude: number; longitude: number }, region?: Region) => {
  if (!region) return true;
  const latMin = region.latitude - region.latitudeDelta / 2;
  const latMax = region.latitude + region.latitudeDelta / 2;
  const lngMin = region.longitude - region.longitudeDelta / 2;
  const lngMax = region.longitude + region.longitudeDelta / 2;
  return (
    point.latitude >= latMin &&
    point.latitude <= latMax &&
    point.longitude >= lngMin &&
    point.longitude <= lngMax
  );
};

export function useBookingHeatmap(params?: { city?: string; region?: Region; enabled?: boolean }) {
  const { city, region, enabled = true } = params || {};
  const [loading, setLoading] = useState(false);
  const [points, setPoints] = useState<HeatmapPoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setPoints([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      // Fetch approved clubs including active events with tickets populated
      const res = await apiClient.get('/api/club/public/approved', {
        params: { includeEvents: 'true', ...(city ? { city } : {}) },
        signal: (abortRef.current as AbortController).signal as any,
      } as any);

      const clubs: ClubWithEvents[] = (res.data?.items || []) as any[];

      // Build points by club location, weight = sum of tickets.quantitySold across active events at that club
      const rawPoints: HeatmapPoint[] = [];
      for (const club of clubs) {
        const coords = extractCoordinatesFromMapLink(club.mapLink || '');
        if (!coords) continue;

        const events = club.events || [];
        let bookingCount = 0;
        for (const ev of events) {
          const sumSold = (ev.tickets || []).reduce((acc, t) => acc + (t.quantitySold || 0), 0);
          bookingCount += sumSold;
        }

        if (bookingCount > 0) {
          rawPoints.push({
            latitude: coords.latitude,
            longitude: coords.longitude,
            weight: bookingCount,
            clubId: club._id,
          });
        }
      }

      setPoints(rawPoints);
    } catch (e: any) {
      if (e?.name === 'CanceledError') return;
      setError(e?.message || 'Failed to load heatmap');
    } finally {
      setLoading(false);
    }
  }, [city, enabled]);

  useEffect(() => {
    fetchData();
    return () => abortRef.current?.abort();
  }, [fetchData]);

  // Filter to visible region and optionally cluster nearby points (simple grid-based)
  const visiblePoints = useMemo(() => {
    const filtered = points.filter((p) => withinRegion(p, region));
    // Cluster by grid, but place cluster at the centroid to avoid visual offset
    const bucketSize = 0.01; // ~1.1km at equator; tune for performance
    type Bucket = {
      sumLat: number;
      sumLng: number;
      totalWeight: number;
      count: number;
    };
    const buckets = new Map<string, Bucket>();
    for (const p of filtered) {
      const bucketLat = Math.round(p.latitude / bucketSize);
      const bucketLng = Math.round(p.longitude / bucketSize);
      const key = `${bucketLat}_${bucketLng}`;
      const b = buckets.get(key);
      if (b) {
        b.sumLat += p.latitude;
        b.sumLng += p.longitude;
        b.totalWeight += p.weight;
        b.count += 1;
      } else {
        buckets.set(key, {
          sumLat: p.latitude,
          sumLng: p.longitude,
          totalWeight: p.weight,
          count: 1,
        });
      }
    }
    const clustered: HeatmapPoint[] = [];
    buckets.forEach((b) => {
      const lat = b.sumLat / b.count;
      const lng = b.sumLng / b.count;
      clustered.push({ latitude: lat, longitude: lng, weight: b.totalWeight });
    });
    return clustered;
  }, [points, region]);

  return {
    loading,
    error,
    points: visiblePoints,
    refresh: fetchData,
  };
}

export type { HeatmapPoint, Region };



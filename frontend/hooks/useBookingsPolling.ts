import { useState, useEffect, useRef, useCallback } from 'react';
import apiClient from '@/app/api/client';
import type { Order, BookingResponse } from '@/types/order';

interface UseBookingsPollingProps {
  status?: string; // 'paid' for active bookings, 'scanned' for history
  enabled?: boolean; // Whether polling should be active
  interval?: number; // Polling interval in milliseconds
}

interface UseBookingsPollingReturn {
  bookings: Order[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  isPolling: boolean;
  refreshing: boolean;
}

export const useBookingsPolling = ({
  status = 'paid',
  enabled = true,
  interval = 3000, // 3 seconds
}: UseBookingsPollingProps = {}): UseBookingsPollingReturn => {
  const [bookings, setBookings] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setError(null);
      const response = await apiClient.get<BookingResponse>(`/api/user/bookings/${status}`);

      if (response.data.success) {
        setBookings(response.data.data.orders || []);
      } else {
        setError('Failed to fetch bookings');
      }
    } catch (err: any) {
      setError('Something went wrong');
    }
  }, [status]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  }, [fetchBookings]);

  // Always perform an initial fetch on mount and when status changes
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Polling only when explicitly enabled
  useEffect(() => {
    if (!enabled) return;

    intervalRef.current = setInterval(fetchBookings, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval, fetchBookings]);

  return {
    bookings,
    loading,
    error,
    refresh,
    isPolling: enabled,
    refreshing,
  };
};

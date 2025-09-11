import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import EventDetailsScreen from '@/components/screens/EventDetailsScreen';

export default function EventDetailsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const router = useRouter();

  return <EventDetailsScreen eventId={id} onGoBack={() => router.back()}  />;
}
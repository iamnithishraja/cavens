import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';

export default function TabLayout() {
  return (
   <Tabs>
    <Tabs.Screen name="index" options={{
      title: "Anylytics",
      headerShown: false,
    }} />
   </Tabs>
  );
}

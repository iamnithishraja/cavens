import { Tabs } from "expo-router";

export default function AdminTabs() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "analytics" }} />
      <Tabs.Screen name="qr" options={{ title: "Qr" }} />
      <Tabs.Screen name="events" options={{ title: "events" }} />
    </Tabs>
  );
}

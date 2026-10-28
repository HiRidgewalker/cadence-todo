import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";

import { colorsFor } from "@/constants/theme";
import { SelectedDateProvider } from "@/hooks/use-selected-date";

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const colors = colorsFor(colorScheme);

  return (
    <SelectedDateProvider>
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          tabBarStyle: { backgroundColor: colors.background },
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.muted,
        }}
      >
        <Tabs.Screen name="index" options={{ title: "月" }} />
        <Tabs.Screen name="week" options={{ title: "周" }} />
        <Tabs.Screen name="day" options={{ title: "日" }} />
      </Tabs>
    </SelectedDateProvider>
  );
}

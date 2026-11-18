import { Tabs } from "expo-router";
import { StyleSheet, useColorScheme, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "@/components/icon";
import { colorsFor, radius, spacing, type } from "@/constants/theme";
import { SelectedDateProvider } from "@/hooks/use-selected-date";
import type { TaskLevel } from "@/types/task";

const tabs = [
  { name: "index", title: "月", level: "month" },
  { name: "week", title: "周", level: "week" },
  { name: "day", title: "日", level: "day" },
] as const satisfies { name: string; title: string; level: TaskLevel }[];

export default function TabsLayout() {
  const colors = colorsFor(useColorScheme());
  const { bottom } = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();
  const bottomPadding = Math.max(bottom, spacing.xs);

  return (
    <SelectedDateProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.text,
          tabBarInactiveTintColor: colors.muted,
          tabBarLabelPosition: "below-icon",
          tabBarLabelStyle: type.label,
          tabBarItemStyle: styles.item,
          tabBarIconStyle: styles.icon,
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            height: 64 + bottomPadding + Math.max(0, Math.ceil((fontScale - 1) * type.label.lineHeight)),
            paddingTop: spacing.xs,
            paddingBottom: bottomPadding,
          },
        }}
      >
        {tabs.map(({ name, title, level }) => (
          <Tabs.Screen
            key={name}
            name={name}
            options={{
              title,
              tabBarAccessibilityLabel: `${title}计划`,
              tabBarIcon: ({ color, focused }) => (
                <View style={[styles.icon, { backgroundColor: focused ? colors.subtle : "transparent" }]}>
                  <Icon name={level} color={color} />
                </View>
              ),
            }}
          />
        ))}
      </Tabs>
    </SelectedDateProvider>
  );
}

const styles = StyleSheet.create({
  item: { minHeight: 48 },
  icon: { alignItems: "center", borderRadius: radius.control, height: 28, justifyContent: "center", width: 58 },
});

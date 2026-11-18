import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { Pressable, StyleSheet, type ColorValue } from "react-native";

import { radius, type ThemeColors } from "@/constants/theme";

const symbols = {
  add: { ios: "plus", android: "add", web: "add" },
  back: { ios: "arrow.left", android: "arrow_back", web: "arrow_back" },
  previous: { ios: "chevron.left", android: "chevron_left", web: "chevron_left" },
  next: { ios: "chevron.right", android: "chevron_right", web: "chevron_right" },
  check: { ios: "checkmark", android: "check", web: "check" },
  close: { ios: "xmark", android: "close", web: "close" },
  link: { ios: "link", android: "link", web: "link" },
  month: { ios: "calendar", android: "calendar_month", web: "calendar_month" },
  week: { ios: "calendar.day.timeline.left", android: "calendar_view_week", web: "calendar_view_week" },
  day: { ios: "calendar.badge.plus", android: "event_available", web: "event_available" },
} satisfies Record<string, SymbolViewProps["name"]>;

export type IconName = keyof typeof symbols;

export function Icon({ name, color, size = 20 }: { name: IconName; color: ColorValue; size?: number }) {
  return (
    <SymbolView
      accessible={false}
      importantForAccessibility="no"
      name={symbols[name]}
      size={size}
      style={{ height: size, width: size }}
      tintColor={color}
      weight="medium"
    />
  );
}

export function IconButton({
  name, label, onPress, colors, rounded = false,
}: {
  name: IconName;
  label: string;
  onPress: () => void;
  colors: ThemeColors;
  rounded?: boolean;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          borderRadius: rounded ? 22 : radius.control,
          backgroundColor: pressed ? colors.subtle : colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <Icon name={name} color={colors.text} size={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: "center", borderWidth: 1, height: 44, justifyContent: "center", width: 44 },
});

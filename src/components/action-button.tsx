import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from "react-native";

import { radius, spacing, type, type ThemeColors } from "@/constants/theme";

import { Icon, type IconName } from "./icon";

type ActionButtonProps = {
  label: string;
  colors: ThemeColors;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "ghost" | "danger" | "dangerGhost";
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
};

export function ActionButton({
  label, colors, onPress, disabled = false, variant = "primary", icon, style,
}: ActionButtonProps) {
  const stylesByVariant = {
    primary: { backgroundColor: colors.accent, borderColor: colors.accent, foreground: colors.accentText },
    ghost: { backgroundColor: colors.card, borderColor: colors.border, foreground: colors.text },
    danger: { backgroundColor: colors.danger, borderColor: colors.danger, foreground: colors.dangerText },
    dangerGhost: { backgroundColor: colors.card, borderColor: colors.border, foreground: colors.danger },
  };
  const { backgroundColor, borderColor, foreground } = disabled
    ? { backgroundColor: colors.subtle, borderColor: colors.subtle, foreground: colors.muted }
    : stylesByVariant[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button, { backgroundColor, borderColor }, style, pressed && styles.pressed,
      ]}
    >
      {icon ? <Icon name={icon} color={foreground} size={17} /> : null}
      <Text style={[type.label, { color: foreground }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: radius.control,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  pressed: { opacity: 0.75 },
});

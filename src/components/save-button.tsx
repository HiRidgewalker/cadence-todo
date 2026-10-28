import { Pressable, StyleSheet, Text } from "react-native";

import type { ThemeColors } from "@/constants/theme";

type SaveButtonProps = {
  label: string;
  disabled: boolean;
  colors: ThemeColors;
  onPress: () => void;
};

export function SaveButton({ label, disabled, colors, onPress }: SaveButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.save, { backgroundColor: disabled ? colors.border : colors.accent }]}
    >
      <Text style={[styles.saveText, { color: disabled ? colors.muted : colors.accentText }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  save: {
    alignItems: "center",
    borderRadius: 8,
    justifyContent: "center",
    marginTop: 20,
    minHeight: 48,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "700",
  },
});

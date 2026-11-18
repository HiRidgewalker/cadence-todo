import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { spacing, type, type ThemeColors } from "@/constants/theme";

import { IconButton } from "./icon";

export function AppHeader({
  title, colors, action, compact = false, onBack,
}: {
  title: string;
  colors: ThemeColors;
  action?: ReactNode;
  compact?: boolean;
  onBack?: () => void;
}) {
  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[styles.surface, { backgroundColor: colors.background, borderColor: colors.border }]}
    >
      <View style={styles.content}>
        {compact && (onBack ? (
          <IconButton name="back" label="返回" colors={colors} onPress={onBack} />
        ) : <View style={styles.slot} />)}
        <Text
          accessibilityRole="header"
          style={[
            compact ? type.heading : type.pageTitle,
            styles.title,
            compact && styles.center,
            { color: colors.text },
          ]}
        >
          {title}
        </Text>
        {compact ? <View style={styles.slot} /> : action}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  surface: { borderBottomWidth: 1 },
  content: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 64,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  title: { flex: 1 },
  center: { textAlign: "center" },
  slot: { width: 44 },
});

import { Image, StyleSheet, Text, View } from "react-native";

import { radius, spacing, type, type ThemeColors } from "@/constants/theme";
import { formatPeriodCard } from "@/lib/tasks/period";
import type { TaskLevel } from "@/types/task";

import { IconButton } from "./icon";

type PeriodSwitcherProps = {
  level: TaskLevel;
  date: Date;
  colors: ThemeColors;
  onPrevious: () => void;
  onNext: () => void;
};

const labels: Record<TaskLevel, [string, string]> = {
  month: ["上一月", "下一月"],
  week: ["上一周", "下一周"],
  day: ["上一天", "下一天"],
};

export function PeriodSwitcher({ level, date, colors, onPrevious, onNext }: PeriodSwitcherProps) {
  const { year, title, subtitle } = formatPeriodCard(level, date);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Image
        accessible={false}
        source={require("@/assets/images/period-mesh.png")}
        resizeMode="stretch"
        style={styles.mesh}
      />
      <View style={styles.copy} accessibilityLiveRegion="polite">
        <Text style={[type.mono, { color: colors.muted }]}>{year} 年</Text>
        <Text style={[type.dateTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[type.body, { color: colors.muted }]}>{subtitle}</Text>
      </View>
      <View style={styles.controls}>
        <IconButton rounded name="previous" label={labels[level][0]} colors={colors} onPress={onPrevious} />
        <IconButton rounded name="next" label={labels[level][1]} colors={colors} onPress={onNext} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    borderRadius: radius.panel,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    minHeight: 144,
    overflow: "hidden",
    paddingLeft: spacing.lg,
    paddingRight: spacing.xs,
    paddingVertical: spacing.md,
  },
  mesh: { ...StyleSheet.absoluteFill, height: "100%", width: "100%" },
  copy: { flex: 1, gap: spacing.xs },
  controls: { flexDirection: "row", gap: spacing.xs },
});

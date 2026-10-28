import { Pressable, StyleSheet, Text, View } from "react-native";

import type { ThemeColors } from "@/constants/theme";
import type { TaskLevel } from "@/types/task";

type PeriodSwitcherProps = {
  level: TaskLevel;
  label: string;
  colors: ThemeColors;
  onPrevious: () => void;
  onNext: () => void;
};

const previousLabel: Record<TaskLevel, string> = {
  month: "上一月",
  week: "上一周",
  day: "上一天",
};

const nextLabel: Record<TaskLevel, string> = {
  month: "下一月",
  week: "下一周",
  day: "下一天",
};

export function PeriodSwitcher({ level, label, colors, onPrevious, onNext }: PeriodSwitcherProps) {
  return (
    <View style={styles.row}>
      <Pressable accessibilityRole="button" onPress={onPrevious} style={styles.side}>
        <Text style={[styles.sideText, { color: colors.accent }]}>{previousLabel[level]}</Text>
      </Pressable>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <Pressable accessibilityRole="button" onPress={onNext} style={styles.side}>
        <Text style={[styles.sideText, { color: colors.accent }]}>{nextLabel[level]}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  side: {
    minHeight: 44,
    justifyContent: "center",
    minWidth: 64,
  },
  sideText: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  label: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
});

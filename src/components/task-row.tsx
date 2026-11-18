import { Pressable, StyleSheet, Text, View } from "react-native";

import { radius, spacing, type, type ThemeColors } from "@/constants/theme";
import type { TaskListItem } from "@/types/task";

import { Icon } from "./icon";

type TaskRowProps = {
  title: string;
  done: boolean;
  colors: ThemeColors;
  progress?: readonly string[];
  meta?: string;
  compact?: boolean;
  onPress: () => void;
  onToggle: () => void;
};

export function taskProgressLabels(task: Pick<TaskListItem, "weekProgress" | "dayProgress">) {
  const labels: string[] = [];
  if (task.weekProgress) labels.push(`周 ${task.weekProgress.done}/${task.weekProgress.total}`);
  if (task.dayProgress) labels.push(`日 ${task.dayProgress.done}/${task.dayProgress.total}`);
  return labels;
}

export function TaskCheckbox({ done, colors }: { done: boolean; colors: ThemeColors }) {
  return (
    <View
      style={[
        styles.checkbox,
        {
          backgroundColor: done ? colors.accent : colors.card,
          borderColor: done ? colors.accent : colors.controlBorder,
        },
      ]}
    >
      {done ? <Icon name="check" color={colors.accentText} size={14} /> : null}
    </View>
  );
}

export function TaskSectionHeading({
  title, count, colors,
}: {
  title: string;
  count: number;
  colors: ThemeColors;
}) {
  return (
    <View style={styles.heading}>
      <Text accessibilityRole="header" style={[type.heading, styles.fill, { color: colors.text }]}>{title}</Text>
      <Text style={[type.mono, { color: colors.muted }]}>{count} 项</Text>
    </View>
  );
}

export function TaskRow({
  title, done, colors, progress = [], meta, compact = false, onPress, onToggle,
}: TaskRowProps) {
  const hasProgress = progress.length > 0;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
        accessibilityLabel={`${title}，${done ? "标为未完成" : "标为已完成"}`}
        onPress={onToggle}
        style={({ pressed }) => [styles.checkboxHit, pressed && styles.pressed]}
      >
        <TaskCheckbox done={done} colors={colors} />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.body,
          compact ? styles.compact : hasProgress ? styles.withProgress : styles.standard,
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.fill}>
          <Text
            style={[
              compact ? type.label : type.taskTitle,
              { color: done ? colors.muted : colors.text },
              done && styles.doneTitle,
            ]}
          >
            {title}
          </Text>
          {meta ? <Text style={[type.caption, { color: colors.muted }]}>{meta}</Text> : null}
          {hasProgress ? (
            <View style={styles.pills}>
              {progress.map((item) => (
                <Text key={item} style={[type.mono, styles.pill, { color: colors.muted, backgroundColor: colors.subtle }]}>
                  {item}
                </Text>
              ))}
            </View>
          ) : null}
        </View>
        <Icon name="next" color={colors.muted} size={16} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "stretch",
    borderRadius: radius.card,
    borderWidth: 1,
    flexDirection: "row",
  },
  checkboxHit: {
    alignItems: "center",
    justifyContent: "center",
    width: 48,
  },
  checkbox: {
    alignItems: "center",
    borderRadius: radius.control,
    borderWidth: 1,
    height: 20,
    justifyContent: "center",
    width: 20,
  },
  body: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: spacing.xs,
    paddingLeft: spacing.xxs,
    paddingRight: spacing.md,
  },
  fill: { flex: 1 },
  compact: { minHeight: 46, paddingVertical: spacing.xxs },
  standard: { minHeight: 62, paddingVertical: spacing.sm },
  withProgress: { minHeight: 74, paddingVertical: spacing.xs },
  heading: { alignItems: "center", flexDirection: "row", gap: spacing.sm },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginTop: spacing.xxs },
  pill: { borderRadius: radius.control, overflow: "hidden", paddingHorizontal: spacing.sm, paddingVertical: 2 },
  doneTitle: { textDecorationLine: "line-through" },
  pressed: { opacity: 0.68 },
});

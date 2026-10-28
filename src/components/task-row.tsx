import { Pressable, StyleSheet, Text, View } from "react-native";

import type { ThemeColors } from "@/constants/theme";
import type { TaskListItem } from "@/types/task";

type TaskRowProps = {
  title: string;
  done: boolean;
  colors: ThemeColors;
  progress?: string | null;
  meta?: string | null;
  onPress: () => void;
  onToggle: () => void;
};

export function taskProgressLabel(
  task: Pick<TaskListItem, "level" | "weekProgress" | "dayProgress">,
): string | null {
  if (task.level === "month" && task.weekProgress && task.dayProgress) {
    return `周 ${task.weekProgress.done}/${task.weekProgress.total} · 日 ${task.dayProgress.done}/${task.dayProgress.total}`;
  }
  if (task.level === "week" && task.dayProgress) {
    return `日 ${task.dayProgress.done}/${task.dayProgress.total}`;
  }
  return null;
}

export function TaskRow({ title, done, colors, progress, meta, onPress, onToggle }: TaskRowProps) {
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
        accessibilityLabel={done ? "标为未完成" : "标为已完成"}
        onPress={onToggle}
        style={styles.checkboxHit}
      >
        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: done ? colors.accent : "transparent",
              borderColor: done ? colors.accent : colors.border,
            },
          ]}
        >
          {done ? <Text style={[styles.check, { color: colors.accentText }]}>✓</Text> : null}
        </View>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={onPress} style={styles.body}>
        <Text
          style={[
            styles.title,
            { color: done ? colors.muted : colors.text },
            done ? styles.doneTitle : null,
          ]}
        >
          {title}
        </Text>
        {meta ? <Text style={[styles.meta, { color: colors.muted }]}>{meta}</Text> : null}
        {progress ? <Text style={[styles.meta, { color: colors.muted }]}>{progress}</Text> : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 12,
  },
  checkboxHit: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    paddingLeft: 14,
    paddingRight: 4,
  },
  checkbox: {
    alignItems: "center",
    borderRadius: 4,
    borderWidth: 1.5,
    height: 22,
    justifyContent: "center",
    width: 22,
  },
  check: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 18,
  },
  body: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  doneTitle: {
    textDecorationLine: "line-through",
  },
  meta: {
    fontSize: 14,
    marginTop: 4,
  },
});

import { router, Stack } from "expo-router";
import { useState, type ReactNode } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";

import { ParentPicker } from "@/components/parent-picker";
import { SaveButton } from "@/components/save-button";
import { TaskRow, taskProgressLabel } from "@/components/task-row";
import { colorsFor, type ThemeColors } from "@/constants/theme";
import { formatDayKeyShort, formatPeriodKey } from "@/lib/tasks/period";
import {
  taskErrorMessage,
  useDeleteTask,
  useParentOptions,
  useSaveTask,
  useSetTaskDone,
  useTaskDetail,
} from "@/lib/tasks/queries";
import type { TaskDetail, TaskOption } from "@/types/task";

type TaskDetailScreenProps = {
  id: string;
};

const titles = {
  month: "月任务",
  week: "周任务",
  day: "日任务",
} as const;

export function TaskDetailScreen({ id }: TaskDetailScreenProps) {
  const colorScheme = useColorScheme();
  const colors = colorsFor(colorScheme);
  const query = useTaskDetail(id);

  if (query.isPending) {
    return <Message colors={colors} title="任务" text="加载中" />;
  }
  if (query.isError) {
    return <Message colors={colors} title="任务" text={taskErrorMessage(query.error)} />;
  }
  if (!query.data) {
    return <Message colors={colors} title="任务" text="任务不存在" />;
  }

  return <TaskEditor key={query.data.id} task={query.data} colors={colors} />;
}

function TaskEditor({ task, colors }: { task: TaskDetail; colors: ThemeColors }) {
  const colorScheme = useColorScheme();
  const [title, setTitle] = useState(task.title);
  const [parentId, setParentId] = useState<string | null>(task.parentId);
  const parentQuery = useParentOptions(task.level, task.periodKey);
  const save = useSaveTask();
  const toggle = useSetTaskDone();
  const remove = useDeleteTask();
  const progress = taskProgressLabel(task);
  const canSave = title.trim().length > 0 && !save.isPending;
  const deleteColor = colorScheme === "dark" ? "#f87171" : "#dc2626";
  const options = mergeParent(parentQuery.data ?? [], task.parent);

  function onDelete() {
    Alert.alert("删除任务", "删除后无法恢复。已引用它的下级任务会保留，并取消引用。", [
      { text: "取消", style: "cancel" },
      {
        text: "删除",
        style: "destructive",
        onPress: () => {
          remove.mutate(task.id, { onSuccess: () => router.back() });
        },
      },
    ]);
  }

  return (
    <ScrollView
      automaticallyAdjustKeyboardInsets
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      style={{ backgroundColor: colors.background }}
    >
      <Stack.Screen options={{ title: titles[task.level] }} />
      <Text style={[styles.period, { color: colors.muted }]}>
        {formatPeriodKey(task.level, task.periodKey)}
      </Text>
      <Text style={[styles.label, { color: colors.muted }]}>标题</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="任务标题"
        placeholderTextColor={colors.muted}
        style={[styles.input, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
      />
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: task.done }}
        accessibilityLabel={task.done ? "标为未完成" : "标为已完成"}
        onPress={() => toggle.mutate({ id: task.id, done: !task.done })}
        style={[styles.doneRow, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: task.done ? colors.accent : "transparent",
              borderColor: task.done ? colors.accent : colors.border,
            },
          ]}
        >
          {task.done ? <Text style={[styles.check, { color: colors.accentText }]}>✓</Text> : null}
        </View>
        <Text style={[styles.doneLabel, { color: colors.text }]}>已完成</Text>
      </Pressable>
      {task.level === "month" ? null : parentQuery.isPending ? (
        <Text style={[styles.status, { color: colors.muted }]}>加载中</Text>
      ) : parentQuery.isError ? (
        <Text style={[styles.status, { color: colors.muted }]}>{taskErrorMessage(parentQuery.error)}</Text>
      ) : (
        <ParentPicker
          childLevel={task.level}
          options={options}
          value={parentId}
          colors={colors}
          onChange={setParentId}
        />
      )}
      <SaveButton
        label={save.isPending ? "保存中" : "保存"}
        disabled={!canSave}
        colors={colors}
        onPress={() =>
          save.mutate(
            { id: task.id, title, parentId },
            { onSuccess: () => setTitle(title.trim()) },
          )
        }
      />
      {save.isError ? (
        <Text style={[styles.error, { color: colors.muted }]}>{taskErrorMessage(save.error)}</Text>
      ) : null}
      {progress ? <Text style={[styles.progress, { color: colors.text }]}>{progress}</Text> : null}
      {task.level === "month" ? (
        <Section title="周任务" colors={colors}>
          {task.weeks.length === 0 ? (
            <Text style={[styles.empty, { color: colors.muted }]}>还没有周任务</Text>
          ) : (
            task.weeks.map((week) => (
              <TaskRow
                key={week.id}
                title={week.title}
                done={week.done}
                colors={colors}
                meta={formatPeriodKey("week", week.periodKey)}
                progress={taskProgressLabel(week)}
                onPress={() => router.push({ pathname: "/tasks/[id]", params: { id: week.id } })}
                onToggle={() => toggle.mutate({ id: week.id, done: !week.done })}
              />
            ))
          )}
        </Section>
      ) : null}
      {task.level === "day" ? null : (
        <Section title="日任务" colors={colors}>
          {task.days.length === 0 ? (
            <Text style={[styles.empty, { color: colors.muted }]}>还没有日任务</Text>
          ) : (
            task.days.map((day) => (
              <TaskRow
                key={day.id}
                title={day.title}
                done={day.done}
                colors={colors}
                meta={
                  day.parentTitle
                    ? `${formatDayKeyShort(day.periodKey)} · ${day.parentTitle}`
                    : formatDayKeyShort(day.periodKey)
                }
                onPress={() => router.push({ pathname: "/tasks/[id]", params: { id: day.id } })}
                onToggle={() => toggle.mutate({ id: day.id, done: !day.done })}
              />
            ))
          )}
        </Section>
      )}
      <Pressable accessibilityRole="button" disabled={remove.isPending} onPress={onDelete} style={styles.delete}>
        <Text style={[styles.deleteText, { color: deleteColor }]}>{remove.isPending ? "删除中" : "删除"}</Text>
      </Pressable>
      {remove.isError ? (
        <Text style={[styles.error, { color: colors.muted }]}>{taskErrorMessage(remove.error)}</Text>
      ) : null}
      {toggle.isError ? (
        <Text style={[styles.error, { color: colors.muted }]}>{taskErrorMessage(toggle.error)}</Text>
      ) : null}
    </ScrollView>
  );
}

function mergeParent(options: TaskOption[], parent: TaskOption | null) {
  if (!parent || options.some((option) => option.id === parent.id)) return options;
  return [parent, ...options];
}

function Section({
  title,
  colors,
  children,
}: {
  title: string;
  colors: ThemeColors;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.muted }]}>{title}</Text>
      {children}
    </View>
  );
}

function Message({ colors, title, text }: { colors: ThemeColors; title: string; text: string }) {
  return (
    <View style={[styles.message, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title }} />
      <Text style={[styles.messageText, { color: colors.muted }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  period: {
    fontSize: 15,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  doneRow: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 16,
    minHeight: 48,
    paddingHorizontal: 12,
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
  doneLabel: {
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 10,
  },
  status: {
    fontSize: 15,
    marginTop: 16,
  },
  error: {
    fontSize: 14,
    marginTop: 12,
  },
  progress: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 24,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },
  empty: {
    fontSize: 15,
    marginBottom: 8,
  },
  delete: {
    alignItems: "center",
    marginTop: 28,
    minHeight: 44,
    justifyContent: "center",
  },
  deleteText: {
    fontSize: 16,
    fontWeight: "700",
  },
  message: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  messageText: {
    fontSize: 16,
    textAlign: "center",
  },
});

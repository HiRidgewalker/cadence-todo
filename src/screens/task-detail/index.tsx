import { router, Stack } from "expo-router";
import { useState, type ReactNode } from "react";
import { Keyboard, Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";

import { ActionButton } from "@/components/action-button";
import { ModalSurface } from "@/components/modal-surface";
import { ParentPicker } from "@/components/parent-picker";
import { TaskForm } from "@/components/task-form";
import { TaskCheckbox, TaskRow, TaskSectionHeading, taskProgressLabels } from "@/components/task-row";
import { colorsFor, radius, spacing, type, type ThemeColors } from "@/constants/theme";
import { formatDayKeyShort, formatPeriodKey } from "@/lib/tasks/period";
import {
  taskErrorMessage,
  useDeleteTask,
  useParentOptions,
  useSaveTask,
  useSetTaskDone,
  useTaskDetail,
} from "@/lib/tasks/queries";
import type { TaskDetail, TaskOption, TaskProgress } from "@/types/task";

const titles = { month: "月任务", week: "周任务", day: "日任务" };

export function TaskDetailScreen({ id }: { id: string }) {
  const colors = colorsFor(useColorScheme());
  const query = useTaskDetail(id);

  if (query.isPending || query.isError || !query.data) {
    const message = query.isPending ? "加载中" : query.isError ? taskErrorMessage(query.error) : "任务不存在";
    return (
      <View style={[styles.message, { backgroundColor: colors.background }]}>
        <Text accessibilityLiveRegion="polite" style={[type.body, { color: colors.muted }]}>{message}</Text>
      </View>
    );
  }

  return <TaskEditor key={query.data.id} task={query.data} colors={colors} />;
}

function TaskEditor({ task, colors }: { task: TaskDetail; colors: ThemeColors }) {
  const [title, setTitle] = useState(task.title);
  const [parentId, setParentId] = useState<string | null>(task.parentId);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const parentQuery = useParentOptions(task.level, task.periodKey);
  const save = useSaveTask();
  const toggle = useSetTaskDone();
  const remove = useDeleteTask();
  const canSave = title.trim().length > 0 && !save.isPending && !remove.isPending;
  const error = save.error ?? remove.error ?? toggle.error;

  function onSave() {
    if (!canSave) return;
    save.mutate(
      { id: task.id, title, parentId },
      { onSuccess: () => setTitle((current) => current === title ? title.trim() : current) },
    );
  }

  function onDelete() {
    setConfirmDelete(false);
    remove.mutate(task.id, {
      onSuccess: () => router.canGoBack() ? router.back() : router.replace("/"),
    });
  }

  function openTask(id: string) {
    router.push({ pathname: "/tasks/[id]", params: { id } });
  }

  return (
    <>
      <Stack.Screen options={{ title: titles[task.level] }} />
      <TaskForm
        level={task.level}
        periodKey={task.periodKey}
        title={title}
        onTitleChange={setTitle}
        onSubmit={onSave}
        colors={colors}
        error={error ? taskErrorMessage(error) : null}
        actions={
          <>
            <ActionButton
              variant="dangerGhost"
              label={remove.isPending ? "删除中" : "删除"}
              colors={colors}
              disabled={remove.isPending || save.isPending}
              style={styles.delete}
              onPress={() => {
                Keyboard.dismiss();
                setConfirmDelete(true);
              }}
            />
            <ActionButton
              label={save.isPending ? "保存中" : "保存"}
              disabled={!canSave}
              colors={colors}
              style={styles.fill}
              onPress={onSave}
            />
          </>
        }
      >
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: task.done }}
          onPress={() => toggle.mutate({ id: task.id, done: !task.done })}
          style={({ pressed }) => [
            styles.done,
            { backgroundColor: pressed ? colors.subtle : colors.card, borderColor: colors.border },
          ]}
        >
          <TaskCheckbox done={task.done} colors={colors} />
          <Text style={[type.label, { color: colors.text }]}>已完成</Text>
        </Pressable>
        {task.level === "month" ? null : parentQuery.isPending ? (
          <Text style={[type.body, styles.parent, { color: colors.muted }]}>加载上级任务中</Text>
        ) : parentQuery.isError ? (
          <Text style={[type.body, styles.parent, { color: colors.danger }]}>
            {taskErrorMessage(parentQuery.error)}
          </Text>
        ) : (
          <View style={styles.parent}>
            <ParentPicker
              childLevel={task.level}
              options={mergeParent(parentQuery.data, task.parent)}
              value={parentId}
              colors={colors}
              onChange={setParentId}
            />
          </View>
        )}
        {task.weekProgress || task.dayProgress ? (
          <View style={[styles.progress, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {task.weekProgress ? <Progress label="周任务" progress={task.weekProgress} colors={colors} /> : null}
            {task.dayProgress ? <Progress label="日任务" progress={task.dayProgress} colors={colors} /> : null}
          </View>
        ) : null}
        {task.level === "month" ? (
          <RelatedTasks unit="周" count={task.weeks.length} colors={colors}>
            {task.weeks.map((week) => (
              <TaskRow
                key={week.id}
                compact
                title={week.title}
                done={week.done}
                colors={colors}
                meta={[formatPeriodKey("week", week.periodKey), ...taskProgressLabels(week)].join(" · ")}
                onPress={() => openTask(week.id)}
                onToggle={() => toggle.mutate({ id: week.id, done: !week.done })}
              />
            ))}
          </RelatedTasks>
        ) : null}
        {task.level !== "day" ? (
          <RelatedTasks unit="日" count={task.days.length} colors={colors}>
            {task.days.map((day) => (
              <TaskRow
                key={day.id}
                compact
                title={day.title}
                done={day.done}
                colors={colors}
                meta={[formatDayKeyShort(day.periodKey), day.parentTitle].filter(Boolean).join(" · ")}
                onPress={() => openTask(day.id)}
                onToggle={() => toggle.mutate({ id: day.id, done: !day.done })}
              />
            ))}
          </RelatedTasks>
        ) : null}
      </TaskForm>
      <ModalSurface
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        colors={colors}
        placement="dialog"
      >
        <Text accessibilityRole="header" style={[type.heading, styles.center, { color: colors.text }]}>
          删除任务？
        </Text>
        <Text style={[type.body, styles.center, { color: colors.muted }]}>
          删除后无法恢复。已引用它的下级任务会保留，并取消引用。
        </Text>
        <View style={styles.confirmActions}>
          <ActionButton
            variant="ghost"
            label="取消"
            colors={colors}
            style={styles.fill}
            onPress={() => setConfirmDelete(false)}
          />
          <ActionButton variant="danger" label="删除" colors={colors} style={styles.fill} onPress={onDelete} />
        </View>
      </ModalSurface>
    </>
  );
}

function mergeParent(options: TaskOption[], parent: TaskOption | null) {
  if (!parent || options.some((option) => option.id === parent.id)) return options;
  return [parent, ...options];
}

function Progress({ label, progress, colors }: { label: string; progress: TaskProgress; colors: ThemeColors }) {
  const { done, total } = progress;
  const value = total ? done / total : 0;

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ text: `${done}/${total}` }}
      style={styles.progressItem}
    >
      <View style={styles.progressLabel}>
        <Text style={[type.label, styles.fill, { color: colors.muted }]}>{label}</Text>
        <Text style={[type.mono, { color: colors.text }]}>{done}/{total}</Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.subtle }]}>
        <View style={[styles.track, { backgroundColor: colors.accent, width: `${value * 100}%` }]} />
      </View>
    </View>
  );
}

function RelatedTasks({
  unit, count, colors, children,
}: {
  unit: "周" | "日";
  count: number;
  colors: ThemeColors;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <TaskSectionHeading title={`关联${unit}任务`} count={count} colors={colors} />
      {count === 0 ? (
        <Text style={[type.body, { color: colors.muted }]}>还没有关联{unit}任务</Text>
      ) : children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  done: {
    alignItems: "center",
    borderRadius: radius.control,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  parent: { marginTop: spacing.sm },
  progress: {
    borderRadius: radius.card,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xxs,
    minHeight: 72,
    padding: spacing.md,
  },
  progressItem: { flex: 1, justifyContent: "center", gap: spacing.xs },
  progressLabel: { alignItems: "center", flexDirection: "row", gap: spacing.xxs },
  track: { borderRadius: 3, height: 6 },
  section: { gap: spacing.xs },
  delete: { minWidth: 76 },
  confirmActions: { flexDirection: "row", gap: spacing.sm },
  center: { textAlign: "center" },
  message: { alignItems: "center", flex: 1, justifyContent: "center", padding: spacing.lg },
});

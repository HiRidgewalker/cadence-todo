import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { ActionButton } from "@/components/action-button";
import { ParentPicker } from "@/components/parent-picker";
import { TaskForm } from "@/components/task-form";
import { colorsFor, spacing, type } from "@/constants/theme";
import { taskErrorMessage, useCreateTask, useParentOptions } from "@/lib/tasks/queries";
import type { TaskLevel } from "@/types/task";

export function TaskCreateScreen({ level, periodKey }: { level: TaskLevel; periodKey: string }) {
  const colors = colorsFor(useColorScheme());
  const [title, setTitle] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  const parentQuery = useParentOptions(level, periodKey);
  const create = useCreateTask();
  const canSave = title.trim().length > 0 && !create.isPending;

  function onSave() {
    if (!canSave) return;
    create.mutate(
      { level, periodKey, title, parentId },
      { onSuccess: () => router.canGoBack() ? router.back() : router.replace("/") },
    );
  }

  return (
    <TaskForm
      colors={colors}
      level={level}
      periodKey={periodKey}
      title={title}
      onTitleChange={setTitle}
      onSubmit={onSave}
      error={create.isError ? taskErrorMessage(create.error) : null}
      actions={
        <ActionButton
          label={create.isPending ? "保存中" : "保存"}
          disabled={!canSave}
          colors={colors}
          onPress={onSave}
          style={styles.save}
        />
      }
    >
      {level === "month" ? null : parentQuery.isPending ? (
        <Text style={[type.body, styles.parent, { color: colors.muted }]}>加载上级任务中</Text>
      ) : parentQuery.isError ? (
        <Text style={[type.body, styles.parent, { color: colors.danger }]}>
          {taskErrorMessage(parentQuery.error)}
        </Text>
      ) : (
        <View style={styles.parent}>
          <ParentPicker
            childLevel={level}
            options={parentQuery.data}
            value={parentId}
            colors={colors}
            onChange={setParentId}
          />
        </View>
      )}
    </TaskForm>
  );
}

const styles = StyleSheet.create({
  parent: { marginTop: spacing.sm },
  save: { flex: 1 },
});

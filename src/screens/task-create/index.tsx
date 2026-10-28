import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, useColorScheme } from "react-native";

import { ParentPicker } from "@/components/parent-picker";
import { SaveButton } from "@/components/save-button";
import { colorsFor } from "@/constants/theme";
import { formatPeriodKey } from "@/lib/tasks/period";
import { taskErrorMessage, useCreateTask, useParentOptions } from "@/lib/tasks/queries";
import type { TaskLevel } from "@/types/task";

type TaskCreateScreenProps = {
  level: TaskLevel;
  periodKey: string;
};

export function TaskCreateScreen({ level, periodKey }: TaskCreateScreenProps) {
  const colorScheme = useColorScheme();
  const colors = colorsFor(colorScheme);
  const [title, setTitle] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  const parentQuery = useParentOptions(level, periodKey);
  const create = useCreateTask();
  const canSave = title.trim().length > 0 && !create.isPending;

  function onSave() {
    create.mutate(
      { level, periodKey, title, parentId },
      { onSuccess: () => router.back() },
    );
  }

  return (
    <ScrollView
      automaticallyAdjustKeyboardInsets
      contentContainerStyle={styles.content}
      style={{ backgroundColor: colors.background }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.period, { color: colors.muted }]}>{formatPeriodKey(level, periodKey)}</Text>
      <Text style={[styles.label, { color: colors.muted }]}>标题</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="任务标题"
        placeholderTextColor={colors.muted}
        style={[styles.input, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
        returnKeyType="done"
        onSubmitEditing={() => {
          if (canSave) onSave();
        }}
      />
      {level === "month" ? null : parentQuery.isPending ? (
        <Text style={[styles.status, { color: colors.muted }]}>加载中</Text>
      ) : parentQuery.isError ? (
        <Text style={[styles.status, { color: colors.muted }]}>{taskErrorMessage(parentQuery.error)}</Text>
      ) : (
        <ParentPicker
          childLevel={level}
          options={parentQuery.data ?? []}
          value={parentId}
          colors={colors}
          onChange={setParentId}
        />
      )}
      <SaveButton label={create.isPending ? "保存中" : "保存"} disabled={!canSave} colors={colors} onPress={onSave} />
      {create.isError ? (
        <Text style={[styles.error, { color: colors.muted }]}>{taskErrorMessage(create.error)}</Text>
      ) : null}
    </ScrollView>
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
  status: {
    fontSize: 15,
    marginTop: 16,
  },
  error: {
    fontSize: 14,
    marginTop: 12,
  },
});

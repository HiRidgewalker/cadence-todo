import { Stack, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { colorsFor } from "@/constants/theme";
import { isValidPeriodKey } from "@/lib/tasks/period";
import { TaskCreateScreen } from "@/screens/task-create";
import type { TaskLevel } from "@/types/task";

const levels: TaskLevel[] = ["month", "week", "day"];

const titles: Record<TaskLevel, string> = {
  month: "新建月任务",
  week: "新建周任务",
  day: "新建日任务",
};

export default function NewTaskRoute() {
  const params = useLocalSearchParams<{ level?: string; periodKey?: string }>();
  const levelValue = firstParam(params.level);
  const periodKey = firstParam(params.periodKey);
  const level = levels.find((item) => item === levelValue);
  const colorScheme = useColorScheme();
  const colors = colorsFor(colorScheme);

  if (!level || !periodKey || !isValidPeriodKey(level, periodKey)) {
    return (
      <View style={[styles.message, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: "新建任务" }} />
        <Text style={[styles.messageText, { color: colors.muted }]}>周期不正确</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: titles[level] }} />
      <TaskCreateScreen level={level} periodKey={periodKey} />
    </>
  );
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const styles = StyleSheet.create({
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

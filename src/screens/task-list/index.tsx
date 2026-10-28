import { router } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";

import { PeriodSwitcher } from "@/components/period-switcher";
import { TaskRow, taskProgressLabel } from "@/components/task-row";
import { colorsFor } from "@/constants/theme";
import { useSelectedDate } from "@/hooks/use-selected-date";
import { formatPeriodLabel, periodKeyFor, shiftDate } from "@/lib/tasks/period";
import { taskErrorMessage, useSetTaskDone, useTaskList } from "@/lib/tasks/queries";
import type { TaskLevel } from "@/types/task";

type TaskListScreenProps = {
  level: TaskLevel;
};

export function TaskListScreen({ level }: TaskListScreenProps) {
  const colorScheme = useColorScheme();
  const colors = colorsFor(colorScheme);
  const { date, setDate } = useSelectedDate();
  const periodKey = periodKeyFor(level, date);
  const query = useTaskList(level, periodKey);
  const toggle = useSetTaskDone();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PeriodSwitcher
        level={level}
        label={formatPeriodLabel(level, date)}
        colors={colors}
        onPrevious={() => setDate(shiftDate(date, level, -1))}
        onNext={() => setDate(shiftDate(date, level, 1))}
      />
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push({ pathname: "/tasks/new", params: { level, periodKey } })}
        style={styles.create}
      >
        <Text style={[styles.createText, { color: colors.accent }]}>新建</Text>
      </Pressable>
      {query.isPending ? (
        <Text style={[styles.status, { color: colors.muted }]}>加载中</Text>
      ) : query.isError ? (
        <Text style={[styles.status, { color: colors.muted }]}>{taskErrorMessage(query.error)}</Text>
      ) : (
        <FlatList
          style={styles.list}
          data={query.data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={[styles.status, { color: colors.muted }]}>还没有任务</Text>}
          renderItem={({ item }) => (
            <TaskRow
              title={item.title}
              done={item.done}
              colors={colors}
              progress={taskProgressLabel(item)}
              onPress={() => router.push({ pathname: "/tasks/[id]", params: { id: item.id } })}
              onToggle={() => toggle.mutate({ id: item.id, done: !item.done })}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  create: {
    alignSelf: "flex-end",
    marginBottom: 8,
    marginTop: 4,
    minHeight: 44,
    justifyContent: "center",
  },
  createText: {
    fontSize: 16,
    fontWeight: "700",
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  status: {
    fontSize: 16,
    paddingVertical: 28,
    textAlign: "center",
  },
});

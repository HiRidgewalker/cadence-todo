import { router } from "expo-router";
import { ActivityIndicator, SectionList, StyleSheet, Text, useColorScheme, View } from "react-native";

import { ActionButton } from "@/components/action-button";
import { AppHeader } from "@/components/app-header";
import { Icon } from "@/components/icon";
import { PeriodSwitcher } from "@/components/period-switcher";
import { TaskRow, TaskSectionHeading, taskProgressLabels } from "@/components/task-row";
import { colorsFor, radius, spacing, type } from "@/constants/theme";
import { useSelectedDate } from "@/hooks/use-selected-date";
import { periodKeyFor, shiftDate } from "@/lib/tasks/period";
import { taskErrorMessage, useSetTaskDone, useTaskList } from "@/lib/tasks/queries";
import type { TaskLevel } from "@/types/task";

const labels = {
  month: { title: "月计划", period: "这个月" },
  week: { title: "周计划", period: "这一周" },
  day: { title: "日计划", period: "这一天" },
};

export function TaskListScreen({ level }: { level: TaskLevel }) {
  const colors = colorsFor(useColorScheme());
  const { date, setDate } = useSelectedDate();
  const periodKey = periodKeyFor(level, date);
  const query = useTaskList(level, periodKey);
  const toggle = useSetTaskDone();
  const tasks = query.data ?? [];
  const sections = [
    { title: "待办", data: tasks.filter((task) => !task.done) },
    { title: "已完成", data: tasks.filter((task) => task.done) },
  ].filter((section) => section.data.length > 0);

  const error = query.isError ? taskErrorMessage(query.error) : null;
  const showEmpty = !query.isPending && !error && tasks.length === 0;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <AppHeader
        title={labels[level].title}
        colors={colors}
        action={
          <ActionButton
            label="新建"
            icon="add"
            colors={colors}
            style={styles.create}
            onPress={() => router.push({ pathname: "/tasks/new", params: { level, periodKey } })}
          />
        }
      />
      <SectionList
        sections={sections}
        stickySectionHeadersEnabled={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <PeriodSwitcher
              level={level}
              date={date}
              colors={colors}
              onPrevious={() => setDate(shiftDate(date, level, -1))}
              onNext={() => setDate(shiftDate(date, level, 1))}
            />
            {query.isPending ? (
              <View style={styles.status} accessibilityLiveRegion="polite">
                <ActivityIndicator color={colors.muted} />
                <Text style={[type.body, { color: colors.muted }]}>加载中</Text>
              </View>
            ) : null}
            {error || toggle.isError ? (
              <Text accessibilityLiveRegion="polite" style={[type.body, { color: colors.danger }]}>
                {error ?? taskErrorMessage(toggle.error)}
              </Text>
            ) : null}
            {showEmpty ? (
              <>
                <TaskSectionHeading title="待办" count={0} colors={colors} />
                <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={[styles.emptyIcon, { backgroundColor: colors.subtle }]}>
                    <Icon name={level} color={colors.text} size={24} />
                  </View>
                  <Text style={[type.heading, { color: colors.text }]}>还没有任务</Text>
                  <Text style={[type.body, styles.center, { color: colors.muted }]}>
                    新建一项任务来安排{labels[level].period}
                  </Text>
                </View>
              </>
            ) : null}
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeading}>
            <TaskSectionHeading title={section.title} count={section.data.length} colors={colors} />
          </View>
        )}
        renderSectionFooter={() => <View style={styles.sectionGap} />}
        ItemSeparatorComponent={() => <View style={styles.rowGap} />}
        renderItem={({ item }) => (
          <TaskRow
            title={item.title}
            done={item.done}
            colors={colors}
            progress={taskProgressLabels(item)}
            onPress={() => router.push({ pathname: "/tasks/[id]", params: { id: item.id } })}
            onToggle={() => toggle.mutate({ id: item.id, done: !item.done })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  create: { minHeight: 44, minWidth: 88 },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xl },
  listHeader: { gap: spacing.md, marginBottom: spacing.md },
  sectionHeading: { marginBottom: spacing.md },
  sectionGap: { height: spacing.lg },
  rowGap: { height: spacing.xs },
  status: { alignItems: "center", flexDirection: "row", gap: spacing.xs, justifyContent: "center", padding: spacing.lg },
  empty: {
    alignItems: "center",
    borderRadius: radius.card,
    borderWidth: 1,
    gap: spacing.xs,
    justifyContent: "center",
    minHeight: 208,
    padding: spacing.lg,
  },
  emptyIcon: { alignItems: "center", borderRadius: 24, height: 48, justifyContent: "center", width: 48 },
  center: { textAlign: "center" },
});

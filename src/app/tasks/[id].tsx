import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { colorsFor } from "@/constants/theme";
import { TaskDetailScreen } from "@/screens/task-detail";

export default function TaskDetailRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const taskId = Array.isArray(id) ? id[0] : id;
  const colorScheme = useColorScheme();
  const colors = colorsFor(colorScheme);

  if (!taskId) {
    return (
      <View style={[styles.message, { backgroundColor: colors.background }]}>
        <Text style={[styles.messageText, { color: colors.muted }]}>任务不存在</Text>
      </View>
    );
  }

  return <TaskDetailScreen id={taskId} />;
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

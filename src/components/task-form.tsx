import { useHeaderHeight } from "expo-router/react-navigation";
import { useState, type ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { radius, spacing, type, type ThemeColors } from "@/constants/theme";
import { formatPeriodKey } from "@/lib/tasks/period";
import type { TaskLevel } from "@/types/task";

import { Icon } from "./icon";

export function TaskForm({
  level, periodKey, title, onTitleChange, onSubmit, colors, children, actions, error,
}: {
  level: TaskLevel;
  periodKey: string;
  title: string;
  onTitleChange: (title: string) => void;
  onSubmit: () => void;
  colors: ThemeColors;
  children?: ReactNode;
  actions: ReactNode;
  error?: string | null;
}) {
  const headerHeight = useHeaderHeight();
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={headerHeight}
        style={styles.screen}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          style={styles.screen}
        >
          <View style={styles.period}>
            <Icon name="month" color={colors.text} />
            <Text style={[type.label, styles.flex, { color: colors.muted }]}>
              {formatPeriodKey(level, periodKey)}
            </Text>
          </View>
          <View style={styles.field}>
            <Text style={[type.label, { color: colors.muted }]}>标题</Text>
            <TextInput
              accessibilityLabel="任务标题"
              value={title}
              onChangeText={onTitleChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onSubmitEditing={onSubmit}
              placeholder="输入任务标题"
              placeholderTextColor={colors.muted}
              selectionColor={colors.focus}
              returnKeyType="done"
              style={[
                type.body,
                styles.input,
                {
                  backgroundColor: colors.card,
                  borderColor: focused ? colors.focus : colors.border,
                  color: colors.text,
                },
              ]}
            />
          </View>
          {children}
        </ScrollView>
        <SafeAreaView
          edges={["left", "right", "bottom"]}
          style={[styles.footer, { backgroundColor: colors.background, borderColor: colors.border }]}
        >
          <View style={styles.footerContent}>
            {error ? (
              <Text accessibilityLiveRegion="polite" style={[type.body, { color: colors.danger }]}>{error}</Text>
            ) : null}
            <View style={styles.actions}>{actions}</View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  period: { alignItems: "center", flexDirection: "row", gap: spacing.xs, minHeight: 24 },
  flex: { flex: 1 },
  field: { gap: spacing.xxs },
  input: {
    borderRadius: radius.control,
    borderWidth: 1,
    minHeight: 48,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  footer: { borderTopWidth: 1 },
  footerContent: { gap: spacing.xs, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  actions: { flexDirection: "row", gap: spacing.sm },
});

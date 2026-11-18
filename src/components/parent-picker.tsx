import { useState } from "react";
import { Keyboard, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { radius, spacing, type, type ThemeColors } from "@/constants/theme";
import { formatPeriodKey } from "@/lib/tasks/period";
import type { TaskLevel, TaskOption } from "@/types/task";

import { Icon, IconButton } from "./icon";
import { ModalSurface } from "./modal-surface";

type ParentPickerProps = {
  childLevel: TaskLevel;
  options: TaskOption[];
  value: string | null;
  colors: ThemeColors;
  onChange: (parentId: string | null) => void;
};

export function ParentPicker({ childLevel, options, value, colors, onChange }: ParentPickerProps) {
  const parentLevel = childLevel === "day" ? "week" : "month";
  const current = options.find((option) => option.id === value);
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  function choose(id: string | null) {
    onChange(id);
    close();
  }

  return (
    <View style={styles.field}>
      <Text style={[type.label, { color: colors.muted }]}>上级任务（可选）</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`选择上级任务，当前${current?.title ?? "不引用"}`}
        accessibilityState={{ expanded: open }}
        onPress={() => {
          Keyboard.dismiss();
          setOpen(true);
        }}
        style={({ pressed }) => [
          styles.trigger,
          { backgroundColor: pressed ? colors.subtle : colors.card, borderColor: colors.border },
        ]}
      >
        <View style={[styles.link, { backgroundColor: colors.subtle }]}>
          <Icon name="link" color={colors.text} size={18} />
        </View>
        <View style={styles.fill}>
          <Text style={[type.label, { color: colors.text }]}>{current?.title ?? "不引用"}</Text>
          {current ? (
            <Text style={[type.caption, { color: colors.muted }]}>
              {formatPeriodKey(parentLevel, current.periodKey)}
            </Text>
          ) : null}
        </View>
        <Icon name="next" color={colors.muted} size={16} />
      </Pressable>
      <ModalSurface open={open} onClose={close} colors={colors} placement="sheet">
        <View style={[styles.handle, { backgroundColor: colors.controlBorder }]} />
        <View style={styles.sheetHeading}>
          <Text accessibilityRole="header" style={[type.heading, styles.fill, { color: colors.text }]}>
            选择上级
          </Text>
          <IconButton rounded name="close" label="关闭" colors={colors} onPress={close} />
        </View>
        <Text style={[type.body, styles.hint, { color: colors.muted }]}>
          {childLevel === "day" ? "可选择当周的一项周任务" : "可选择本周覆盖月份的一项月任务"}
        </Text>
        <ScrollView contentContainerStyle={styles.choices} keyboardShouldPersistTaps="handled">
          <Choice label="不引用" selected={value === null} colors={colors} onPress={() => choose(null)} />
          {options.map((option) => (
            <Choice
              key={option.id}
              label={option.title}
              meta={formatPeriodKey(parentLevel, option.periodKey)}
              selected={value === option.id}
              colors={colors}
              onPress={() => choose(option.id)}
            />
          ))}
          {options.length === 0 ? (
            <Text style={[type.caption, { color: colors.muted }]}>当前周期还没有可引用的上级</Text>
          ) : null}
        </ScrollView>
      </ModalSurface>
    </View>
  );
}

function Choice({
  label, meta, selected, colors, onPress,
}: {
  label: string;
  meta?: string;
  selected: boolean;
  colors: ThemeColors;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.choice,
        {
          backgroundColor: pressed || selected ? colors.subtle : colors.card,
          borderColor: selected ? colors.text : colors.border,
        },
      ]}
    >
      <View style={[styles.radio, { borderColor: selected ? colors.text : colors.controlBorder }]}>
        {selected ? <View style={[styles.dot, { backgroundColor: colors.text }]} /> : null}
      </View>
      <View style={styles.fill}>
        <Text style={[type.label, { color: colors.text }]}>{label}</Text>
        {meta ? <Text style={[type.caption, { color: colors.muted }]}>{meta}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.xxs },
  trigger: {
    alignItems: "center",
    borderRadius: radius.control,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 56,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  fill: { flex: 1 },
  link: { alignItems: "center", borderRadius: radius.control, height: 32, justifyContent: "center", width: 32 },
  handle: { alignSelf: "center", borderRadius: 2, height: 4, marginBottom: spacing.xs, width: 36 },
  sheetHeading: { alignItems: "center", flexDirection: "row", gap: spacing.sm },
  hint: { marginBottom: spacing.sm },
  choices: { gap: spacing.xs },
  choice: {
    alignItems: "center",
    borderRadius: radius.control,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 56,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  radio: { alignItems: "center", borderRadius: 10, borderWidth: 1, height: 20, justifyContent: "center", width: 20 },
  dot: { borderRadius: 5, height: 10, width: 10 },
});

import { Pressable, StyleSheet, Text, View } from "react-native";

import type { ThemeColors } from "@/constants/theme";
import { formatPeriodKey } from "@/lib/tasks/period";
import type { TaskLevel, TaskOption } from "@/types/task";

type ParentPickerProps = {
  childLevel: TaskLevel;
  options: TaskOption[];
  value: string | null;
  colors: ThemeColors;
  onChange: (parentId: string | null) => void;
};

export function ParentPicker({ childLevel, options, value, colors, onChange }: ParentPickerProps) {
  const parentLevel: TaskLevel = childLevel === "day" ? "week" : "month";

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.muted }]}>上级任务</Text>
      <Choice
        label="不引用"
        selected={value === null}
        colors={colors}
        onPress={() => onChange(null)}
      />
      {options.length === 0 ? (
        <Text style={[styles.empty, { color: colors.muted }]}>当前周期还没有可引用的上级</Text>
      ) : (
        options.map((option) => (
          <Choice
            key={option.id}
            label={option.title}
            meta={formatPeriodKey(parentLevel, option.periodKey)}
            selected={value === option.id}
            colors={colors}
            onPress={() => onChange(option.id)}
          />
        ))
      )}
    </View>
  );
}

function Choice({
  label,
  meta,
  selected,
  colors,
  onPress,
}: {
  label: string;
  meta?: string;
  selected: boolean;
  colors: ThemeColors;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.choice,
        {
          backgroundColor: colors.card,
          borderColor: selected ? colors.accent : colors.border,
        },
      ]}
    >
      <Text style={[styles.choiceLabel, { color: selected ? colors.accent : colors.text }]}>{label}</Text>
      {meta ? <Text style={[styles.choiceMeta, { color: colors.muted }]}>{meta}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },
  empty: {
    fontSize: 14,
    marginTop: 4,
  },
  choice: {
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  choiceLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  choiceMeta: {
    fontSize: 13,
    marginTop: 2,
  },
});

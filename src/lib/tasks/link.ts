import { monthKeysForWeekKey, weekKeyForDayKey } from "@/lib/tasks/period";
import type { TaskLevel } from "@/types/task";

type ParentRef = {
  level: TaskLevel;
  periodKey: string;
};

export function parentLinkError(
  childLevel: TaskLevel,
  childPeriodKey: string,
  parent: ParentRef | null,
): string | null {
  if (childLevel === "month") {
    return parent ? "月任务不能引用上级" : null;
  }
  if (!parent) return null;

  if (childLevel === "week") {
    if (parent.level !== "month") return "周任务只能引用月任务";
    if (!monthKeysForWeekKey(childPeriodKey).includes(parent.periodKey)) {
      return "周任务只能引用该周所在月的月任务";
    }
    return null;
  }

  if (parent.level !== "week") return "日任务只能引用周任务";
  if (parent.periodKey !== weekKeyForDayKey(childPeriodKey)) {
    return "日任务只能引用该日所在周的周任务";
  }
  return null;
}

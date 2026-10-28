import { parentLinkError } from "@/lib/tasks/link";
import { isValidPeriodKey, monthKeysForWeekKey, weekKeyForDayKey } from "@/lib/tasks/period";
import { getDatabase } from "@/lib/storage/sqlite";
import type {
  TaskDayItem,
  TaskDetail,
  TaskLevel,
  TaskListItem,
  TaskOption,
  TaskProgress,
} from "@/types/task";

type TaskRow = {
  id: string;
  level: TaskLevel;
  period_key: string;
  title: string;
  done: number;
  parent_id: string | null;
  created_at: number;
};

type CountRow = {
  parent_id: string;
  total: number;
  done: number | null;
};

type DayRow = TaskRow & {
  parent_title: string | null;
};

export type CreateTaskInput = {
  level: TaskLevel;
  periodKey: string;
  title: string;
  parentId: string | null;
};

function assertPeriodKey(level: TaskLevel, periodKey: string) {
  if (!isValidPeriodKey(level, periodKey)) throw new Error("周期不正确");
}

async function assertLink(level: TaskLevel, periodKey: string, parentId: string | null) {
  if (!parentId) {
    const message = parentLinkError(level, periodKey, null);
    if (message) throw new Error(message);
    return;
  }

  const db = await getDatabase();
  const parent = await db.getFirstAsync<TaskRow>("SELECT * FROM tasks WHERE id = ?", parentId);
  if (!parent) throw new Error("上级任务不存在");

  const message = parentLinkError(level, periodKey, {
    level: parent.level,
    periodKey: parent.period_key,
  });
  if (message) throw new Error(message);
}

function trimmedTitle(title: string) {
  const value = title.trim();
  if (!value) throw new Error("标题不能为空");
  return value;
}

function mapBase(row: TaskRow) {
  return {
    id: row.id,
    level: row.level,
    periodKey: row.period_key,
    title: row.title,
    done: row.done === 1,
    parentId: row.parent_id,
    createdAt: row.created_at,
  };
}

function toOption(row: TaskRow): TaskOption {
  return { id: row.id, title: row.title, periodKey: row.period_key };
}

function progressMap(rows: CountRow[]) {
  const map = new Map<string, TaskProgress>();
  for (const row of rows) {
    map.set(row.parent_id, { total: Number(row.total), done: Number(row.done ?? 0) });
  }
  return map;
}

async function countByParent(parentIds: string[], level: TaskLevel) {
  if (parentIds.length === 0) return new Map<string, TaskProgress>();
  const placeholders = parentIds.map(() => "?").join(", ");
  const db = await getDatabase();
  const rows = await db.getAllAsync<CountRow>(
    `SELECT parent_id, COUNT(*) AS total, COALESCE(SUM(done), 0) AS done
     FROM tasks
     WHERE level = ? AND parent_id IN (${placeholders})
     GROUP BY parent_id`,
    level,
    ...parentIds,
  );
  return progressMap(rows);
}

async function countDaysByMonth(monthIds: string[]) {
  if (monthIds.length === 0) return new Map<string, TaskProgress>();
  const placeholders = monthIds.map(() => "?").join(", ");
  const db = await getDatabase();
  const rows = await db.getAllAsync<CountRow>(
    `SELECT w.parent_id AS parent_id, COUNT(*) AS total, COALESCE(SUM(d.done), 0) AS done
     FROM tasks AS d
     INNER JOIN tasks AS w ON d.parent_id = w.id
     WHERE d.level = 'day' AND w.level = 'week' AND w.parent_id IN (${placeholders})
     GROUP BY w.parent_id`,
    ...monthIds,
  );
  return progressMap(rows);
}

async function attachProgress(rows: TaskRow[]): Promise<TaskListItem[]> {
  const monthIds = rows.filter((row) => row.level === "month").map((row) => row.id);
  const weekIds = rows.filter((row) => row.level === "week").map((row) => row.id);
  const weekProgress = await countByParent(monthIds, "week");
  const monthDayProgress = await countDaysByMonth(monthIds);
  const weekDayProgress = await countByParent(weekIds, "day");
  const empty = { total: 0, done: 0 };

  return rows.map((row) => ({
    ...mapBase(row),
    weekProgress: row.level === "month" ? (weekProgress.get(row.id) ?? empty) : null,
    dayProgress:
      row.level === "month"
        ? (monthDayProgress.get(row.id) ?? empty)
        : row.level === "week"
          ? (weekDayProgress.get(row.id) ?? empty)
          : null,
  }));
}

function mapDay(row: DayRow): TaskDayItem {
  return {
    id: row.id,
    periodKey: row.period_key,
    title: row.title,
    done: row.done === 1,
    parentTitle: row.parent_title,
  };
}

export async function listTasks(level: TaskLevel, periodKey: string): Promise<TaskListItem[]> {
  assertPeriodKey(level, periodKey);
  const db = await getDatabase();
  const rows = await db.getAllAsync<TaskRow>(
    "SELECT * FROM tasks WHERE level = ? AND period_key = ? ORDER BY created_at ASC",
    level,
    periodKey,
  );
  return attachProgress(rows);
}

export async function listParentOptions(level: TaskLevel, periodKey: string): Promise<TaskOption[]> {
  assertPeriodKey(level, periodKey);
  if (level === "month") return [];

  const db = await getDatabase();
  if (level === "week") {
    const months = monthKeysForWeekKey(periodKey);
    const placeholders = months.map(() => "?").join(", ");
    const rows = await db.getAllAsync<TaskRow>(
      `SELECT * FROM tasks
       WHERE level = 'month' AND period_key IN (${placeholders})
       ORDER BY period_key ASC, created_at ASC`,
      ...months,
    );
    return rows.map(toOption);
  }

  const weekKey = weekKeyForDayKey(periodKey);
  const rows = await db.getAllAsync<TaskRow>(
    "SELECT * FROM tasks WHERE level = 'week' AND period_key = ? ORDER BY created_at ASC",
    weekKey,
  );
  return rows.map(toOption);
}

export async function getTask(id: string): Promise<TaskDetail | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<TaskRow>("SELECT * FROM tasks WHERE id = ?", id);
  if (!row) return null;

  const task = (await attachProgress([row]))[0];
  if (!task) return null;
  const parentRow = row.parent_id
    ? await db.getFirstAsync<TaskRow>("SELECT * FROM tasks WHERE id = ?", row.parent_id)
    : null;

  if (row.level === "month") {
    const weekRows = await db.getAllAsync<TaskRow>(
      "SELECT * FROM tasks WHERE level = 'week' AND parent_id = ? ORDER BY created_at ASC",
      id,
    );
    const dayRows = await db.getAllAsync<DayRow>(
      `SELECT d.id, d.level, d.period_key, d.title, d.done, d.parent_id, d.created_at, w.title AS parent_title
       FROM tasks AS d
       INNER JOIN tasks AS w ON d.parent_id = w.id
       WHERE d.level = 'day' AND w.level = 'week' AND w.parent_id = ?
       ORDER BY d.period_key ASC, d.created_at ASC`,
      id,
    );
    return { ...task, parent: null, weeks: await attachProgress(weekRows), days: dayRows.map(mapDay) };
  }

  if (row.level === "week") {
    const dayRows = await db.getAllAsync<DayRow>(
      `SELECT id, level, period_key, title, done, parent_id, created_at, NULL AS parent_title
       FROM tasks
       WHERE level = 'day' AND parent_id = ?
       ORDER BY period_key ASC, created_at ASC`,
      id,
    );
    return {
      ...task,
      parent: parentRow ? toOption(parentRow) : null,
      weeks: [],
      days: dayRows.map(mapDay),
    };
  }

  return {
    ...task,
    parent: parentRow ? toOption(parentRow) : null,
    weeks: [],
    days: [],
  };
}

export async function createTask(input: CreateTaskInput): Promise<string> {
  const title = trimmedTitle(input.title);
  assertPeriodKey(input.level, input.periodKey);
  await assertLink(input.level, input.periodKey, input.parentId);

  const id = globalThis.crypto.randomUUID();
  const db = await getDatabase();
  await db.runAsync(
    "INSERT INTO tasks (id, level, period_key, title, done, parent_id, created_at) VALUES (?, ?, ?, ?, 0, ?, ?)",
    id,
    input.level,
    input.periodKey,
    title,
    input.parentId,
    Date.now(),
  );
  return id;
}

export async function saveTask(id: string, input: { title: string; parentId: string | null }) {
  const title = trimmedTitle(input.title);
  const db = await getDatabase();
  const current = await db.getFirstAsync<TaskRow>("SELECT * FROM tasks WHERE id = ?", id);
  if (!current) throw new Error("任务不存在");
  await assertLink(current.level, current.period_key, input.parentId);
  await db.runAsync("UPDATE tasks SET title = ?, parent_id = ? WHERE id = ?", title, input.parentId, id);
}

export async function setTaskDone(id: string, done: boolean) {
  const db = await getDatabase();
  const result = await db.runAsync("UPDATE tasks SET done = ? WHERE id = ?", done ? 1 : 0, id);
  if (result.changes === 0) throw new Error("任务不存在");
}

export async function deleteTask(id: string) {
  const db = await getDatabase();
  const current = await db.getFirstAsync<{ id: string }>("SELECT id FROM tasks WHERE id = ?", id);
  if (!current) throw new Error("任务不存在");
  await db.withTransactionAsync(async () => {
    await db.runAsync("UPDATE tasks SET parent_id = NULL WHERE parent_id = ?", id);
    await db.runAsync("DELETE FROM tasks WHERE id = ?", id);
  });
}

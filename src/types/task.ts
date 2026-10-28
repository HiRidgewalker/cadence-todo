export type TaskLevel = "month" | "week" | "day";

export type TaskProgress = {
  total: number;
  done: number;
};

export type TaskListItem = {
  id: string;
  level: TaskLevel;
  periodKey: string;
  title: string;
  done: boolean;
  parentId: string | null;
  createdAt: number;
  weekProgress: TaskProgress | null;
  dayProgress: TaskProgress | null;
};

export type TaskOption = {
  id: string;
  title: string;
  periodKey: string;
};

export type TaskDayItem = {
  id: string;
  periodKey: string;
  title: string;
  done: boolean;
  parentTitle: string | null;
};

export type TaskDetail = TaskListItem & {
  parent: TaskOption | null;
  weeks: TaskListItem[];
  days: TaskDayItem[];
};

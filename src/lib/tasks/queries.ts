import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createTask,
  deleteTask,
  getTask,
  listParentOptions,
  listTasks,
  saveTask,
  setTaskDone,
  type CreateTaskInput,
} from "@/lib/tasks/db";
import type { TaskLevel } from "@/types/task";

export const taskKeys = {
  all: ["tasks"] as const,
  list: (level: TaskLevel, periodKey: string) => ["tasks", "list", level, periodKey] as const,
  detail: (id: string) => ["tasks", "detail", id] as const,
  parents: (level: TaskLevel, periodKey: string) => ["tasks", "parents", level, periodKey] as const,
};

export function taskErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "操作失败";
}

function useRefreshTasks() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: taskKeys.all });
  };
}

export function useTaskList(level: TaskLevel, periodKey: string) {
  return useQuery({
    queryKey: taskKeys.list(level, periodKey),
    queryFn: () => listTasks(level, periodKey),
    retry: false,
  });
}

export function useTaskDetail(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => getTask(id),
    retry: false,
  });
}

export function useParentOptions(level: TaskLevel, periodKey: string) {
  return useQuery({
    queryKey: taskKeys.parents(level, periodKey),
    queryFn: () => listParentOptions(level, periodKey),
    enabled: level !== "month",
    retry: false,
  });
}

export function useCreateTask() {
  const refresh = useRefreshTasks();
  return useMutation({
    mutationFn: async (input: CreateTaskInput) => createTask(input),
    onSuccess: refresh,
  });
}

export function useSaveTask() {
  const refresh = useRefreshTasks();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      parentId,
    }: {
      id: string;
      title: string;
      parentId: string | null;
    }) => saveTask(id, { title, parentId }),
    onSuccess: refresh,
  });
}

export function useSetTaskDone() {
  const refresh = useRefreshTasks();
  return useMutation({
    mutationFn: async ({ id, done }: { id: string; done: boolean }) => setTaskDone(id, done),
    onSuccess: refresh,
  });
}

export function useDeleteTask() {
  const refresh = useRefreshTasks();
  return useMutation({
    mutationFn: async (id: string) => deleteTask(id),
    onSuccess: refresh,
  });
}

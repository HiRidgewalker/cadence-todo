import { createContext, useContext, useState, type ReactNode } from "react";

import { startOfDay } from "@/lib/tasks/period";

type SelectedDateValue = {
  date: Date;
  setDate: (date: Date) => void;
};

const SelectedDateContext = createContext<SelectedDateValue | null>(null);

export function SelectedDateProvider({ children }: { children: ReactNode }) {
  const [date, setDate] = useState(() => startOfDay(new Date()));
  return <SelectedDateContext.Provider value={{ date, setDate }}>{children}</SelectedDateContext.Provider>;
}

export function useSelectedDate() {
  const value = useContext(SelectedDateContext);
  if (!value) throw new Error("useSelectedDate 必须在 SelectedDateProvider 内使用");
  return value;
}

import type { TaskLevel } from "@/types/task";

const dayMs = 86400000;

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function utcDayNumber(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / dayMs;
}

function weekday(date: Date): number {
  return date.getDay() || 7;
}

// ISO 周以周一为第一天，包含本周四的年份作为周年。
function mondayOfIsoWeek(year: number, week: number): Date {
  const january4 = new Date(year, 0, 4);
  const week1Monday = addDays(january4, 1 - weekday(january4));
  return addDays(week1Monday, (week - 1) * 7);
}

function isoWeekParts(date: Date): { year: number; week: number } {
  const current = startOfDay(date);
  const thursday = addDays(current, 4 - weekday(current));
  const year = thursday.getFullYear();
  const monday = addDays(current, 1 - weekday(current));
  const week1Monday = mondayOfIsoWeek(year, 1);
  const week = (utcDayNumber(monday) - utcDayNumber(week1Monday)) / 7 + 1;
  return { year, week };
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

function weekKey(date: Date): string {
  const { year, week } = isoWeekParts(date);
  return `${year}-W${pad(week)}`;
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function periodKeyFor(level: TaskLevel, date: Date): string {
  if (level === "month") return monthKey(date);
  if (level === "week") return weekKey(date);
  return dayKey(date);
}

export function shiftDate(date: Date, level: TaskLevel, delta: number): Date {
  const current = startOfDay(date);
  if (level === "day") return addDays(current, delta);
  if (level === "week") return addDays(current, delta * 7);

  const target = new Date(current.getFullYear(), current.getMonth() + delta, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(current.getDate(), lastDay));
  return target;
}

export function isValidMonthKey(value: string): boolean {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return false;
  const month = Number(match[2]);
  return month >= 1 && month <= 12;
}

export function isValidWeekKey(value: string): boolean {
  const match = /^(\d{4})-W(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const week = Number(match[2]);
  if (week < 1 || week > 53) return false;
  const monday = mondayOfIsoWeek(year, week);
  const parts = isoWeekParts(monday);
  return parts.year === year && parts.week === week;
}

export function isValidDayKey(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function isValidPeriodKey(level: TaskLevel, periodKey: string): boolean {
  if (level === "month") return isValidMonthKey(periodKey);
  if (level === "week") return isValidWeekKey(periodKey);
  return isValidDayKey(periodKey);
}

export function mondayFromWeekKey(weekKeyValue: string): Date {
  if (!isValidWeekKey(weekKeyValue)) throw new Error("周期不正确");
  const match = /^(\d{4})-W(\d{2})$/.exec(weekKeyValue);
  if (!match) throw new Error("周期不正确");
  return mondayOfIsoWeek(Number(match[1]), Number(match[2]));
}

function parseDayKey(dayKeyValue: string): Date {
  if (!isValidDayKey(dayKeyValue)) throw new Error("周期不正确");
  const [year, month, day] = dayKeyValue.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// 一周可能跨两个月，返回这七天覆盖的月份。
export function monthKeysForWeekKey(weekKeyValue: string): string[] {
  const monday = mondayFromWeekKey(weekKeyValue);
  const keys: string[] = [];
  for (let offset = 0; offset < 7; offset += 1) {
    const key = monthKey(addDays(monday, offset));
    if (!keys.includes(key)) keys.push(key);
  }
  return keys;
}

export function weekKeyForDayKey(dayKeyValue: string): string {
  return weekKey(parseDayKey(dayKeyValue));
}

export function formatPeriodLabel(level: TaskLevel, date: Date): string {
  const current = startOfDay(date);
  if (level === "month") return `${current.getFullYear()}年${current.getMonth() + 1}月`;
  if (level === "day") {
    return `${current.getFullYear()}年${current.getMonth() + 1}月${current.getDate()}日`;
  }

  const { year, week } = isoWeekParts(current);
  const monday = addDays(current, 1 - weekday(current));
  const sunday = addDays(monday, 6);
  const range = `${monday.getMonth() + 1}/${monday.getDate()}–${sunday.getMonth() + 1}/${sunday.getDate()}`;
  return `${year}年第${week}周 ${range}`;
}

export function formatPeriodKey(level: TaskLevel, periodKey: string): string {
  if (!isValidPeriodKey(level, periodKey)) throw new Error("周期不正确");
  if (level === "month") {
    const [year, month] = periodKey.split("-");
    return `${Number(year)}年${Number(month)}月`;
  }
  if (level === "week") return formatPeriodLabel("week", mondayFromWeekKey(periodKey));
  return formatPeriodLabel("day", parseDayKey(periodKey));
}

export function formatDayKeyShort(dayKeyValue: string): string {
  const date = parseDayKey(dayKeyValue);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

const weekdays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

function shortDate(date: Date) {
  return `${date.getMonth() + 1} 月 ${date.getDate()} 日`;
}

export function formatPeriodCard(level: TaskLevel, date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  if (level === "month") {
    const end = new Date(year, month, 0).getDate();
    return { year, title: `${month} 月`, subtitle: `${month} 月 1 日 – ${end} 日` };
  }

  const week = isoWeekParts(date);
  if (level === "day") {
    return {
      year,
      title: shortDate(date),
      subtitle: `${weekdays[date.getDay()]} · 第 ${week.week} 周`,
    };
  }

  const monday = mondayOfIsoWeek(week.year, week.week);
  const sunday = addDays(monday, 6);
  const end = sunday.getMonth() === monday.getMonth() ? `${sunday.getDate()} 日` : shortDate(sunday);
  return {
    year: week.year,
    title: `第 ${week.week} 周`,
    subtitle: `${shortDate(monday)} – ${end}`,
  };
}

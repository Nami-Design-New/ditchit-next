// utils/dayjs.ts
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(utc);
dayjs.extend(relativeTime);

const loadedLocales = new Set<string>();

/**
 * تحميل اللغة المطلوبة لـ dayjs
 */
export async function loadDayjsLocale(lang: string) {
  if (loadedLocales.has(lang)) return;

  try {
    await import(`dayjs/locale/en`);
    dayjs.locale("en");
    loadedLocales.add("en");
  } catch {
    console.warn(`Locale "${lang}" not found, fallback to "en"`);
    dayjs.locale("en");
  }
}

/**
 * استرجاع اللغة من المسار
 */
export function getLangFromPath(): string {
  if (typeof window === "undefined") return "en";
  return window.location.pathname.split("/")[1] || "en";
}

/**
 * تنسيق الوقت مثل "14:30"
 */
export async function formatTime(timestampMs: number): Promise<string> {
  await loadDayjsLocale(getLangFromPath());
  return dayjs(timestampMs).local().format("HH:mm");
}

/**
 * تنسيق التاريخ مثل "2025-04-09"
 */
export async function formatDate(timestampMs: number): Promise<string> {
  await loadDayjsLocale(getLangFromPath());
  return dayjs(timestampMs).local().format("YYYY-MM-DD");
}

/**
 * تنسيق الوقت بالنسبة للآن مثل "منذ 5 دقائق"
 */
export async function formatFromNow(timestampMs: number): Promise<string> {
  await loadDayjsLocale(getLangFromPath());
  return dayjs(timestampMs).local().fromNow();
}

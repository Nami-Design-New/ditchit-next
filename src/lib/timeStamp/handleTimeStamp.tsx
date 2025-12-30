// // import dayjs from "dayjs";
// // import utc from "dayjs/plugin/utc";
// // import relativeTime from "dayjs/plugin/relativeTime";
// // import "dayjs/locale/ar";

// // dayjs.extend(utc);
// // dayjs.extend(relativeTime);
// // dayjs.locale("ar");

// // export function formatPostTime(timestampMs: number): string {
// //   const date = dayjs(timestampMs).local();

// //   const formattedDate = date.format("YYYY-MM-DD HH:mm");
// //   const fromNow = date.fromNow(); // منذ 5 دقائق

// //   return `${formattedDate} • ${fromNow}`;
// // }

// import dayjs from "dayjs";
// import utc from "dayjs/plugin/utc";
// import relativeTime from "dayjs/plugin/relativeTime";
// import { loadDayjsLocale } from "./utils";

// dayjs.extend(utc);
// dayjs.extend(relativeTime);

// function getLangFromPath(): string {
//   if (typeof window === "undefined") return "en";
//   return window.location.pathname.split("/")[1] || "en";
// }

// // 14:30
// export async function formatTime(timestampMs: number): Promise<string> {
//   await loadDayjsLocale(getLangFromPath());
//   return dayjs(timestampMs).local().format("HH:mm");
// }

// // 2023-10-15
// export async function formatDate(timestampMs: number): Promise<string> {
//   await loadDayjsLocale(getLangFromPath());
//   return dayjs(timestampMs).local().format("YYYY-MM-DD");
// }

// // منذ 5 دقائق
// export async function formatFromNow(timestampMs: number): Promise<string> {
//   await loadDayjsLocale(getLangFromPath());
//   return dayjs(timestampMs).local().fromNow();
// }

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
    await import(`dayjs/locale/${lang}`);
    dayjs.locale(lang);
    loadedLocales.add(lang);
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

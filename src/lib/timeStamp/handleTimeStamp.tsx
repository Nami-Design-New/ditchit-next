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

/* =======================
   Static locale imports
   ======================= */
// ⚠️ استورد فقط اللغات اللي dayjs بيدعمها فعليًا
import "dayjs/locale/en";
import "dayjs/locale/ar";
import "dayjs/locale/fr";
import "dayjs/locale/de";
import "dayjs/locale/es";
import "dayjs/locale/it";
import "dayjs/locale/pt-br";
import "dayjs/locale/ru";
import "dayjs/locale/zh-cn";
import "dayjs/locale/ja";
import "dayjs/locale/ko";
import "dayjs/locale/tr";
import "dayjs/locale/nl";
import "dayjs/locale/pl";
import "dayjs/locale/sv";
import "dayjs/locale/fi";
import "dayjs/locale/da";
import "dayjs/locale/nb";
import "dayjs/locale/uk";
import "dayjs/locale/cs";
import "dayjs/locale/sk";
import "dayjs/locale/sl";
import "dayjs/locale/sr";
import "dayjs/locale/ro";
import "dayjs/locale/bg";
import "dayjs/locale/el";
import "dayjs/locale/hu";
import "dayjs/locale/id";
import "dayjs/locale/ms";
import "dayjs/locale/vi";
import "dayjs/locale/th";
import "dayjs/locale/hi";
import "dayjs/locale/bn";
import "dayjs/locale/ta";
import "dayjs/locale/te";
import "dayjs/locale/ml";
import "dayjs/locale/mr";
import "dayjs/locale/kn";
import "dayjs/locale/gu";
import "dayjs/locale/fa";
import "dayjs/locale/sw";
import "dayjs/locale/et";
import "dayjs/locale/lt";
import "dayjs/locale/lv";
import "dayjs/locale/mk";
import "dayjs/locale/kk";
import "dayjs/locale/uz";
import "dayjs/locale/az";
import "dayjs/locale/sq";
import "dayjs/locale/af";

/* =======================
   dayjs setup
   ======================= */
dayjs.extend(utc);
dayjs.extend(relativeTime);

/* =======================
   Language mapping
   ======================= */
const DAYJS_LOCALE_MAP: Record<string, string> = {
  af: "af",
  am: "en",     // fallback
  ar: "ar",
  az: "az",
  bg: "bg",
  bn: "bn",
  ca: "en",
  cs: "cs",
  da: "da",
  de: "de",
  el: "el",
  en: "en",
  es: "es",
  et: "et",
  fa: "fa",
  fi: "fi",
  fil: "en",
  fr: "fr",
  gu: "gu",
  hi: "hi",
  hr: "en",
  hu: "hu",
  id: "id",
  it: "it",
  ja: "ja",
  kk: "kk",
  kn: "kn",
  ko: "ko",
  lo: "en",
  lt: "lt",
  lv: "lv",
  mk: "mk",
  ml: "ml",
  mr: "mr",
  ms: "ms",
  nb: "nb",
  nl: "nl",
  pa: "en",
  pl: "pl",
  pt: "pt-br",
  ro: "ro",
  ru: "ru",
  sk: "sk",
  sl: "sl",
  sq: "sq",
  sr: "sr",
  sv: "sv",
  sw: "sw",
  ta: "ta",
  te: "te",
  th: "th",
  tr: "tr",
  uk: "uk",
  uz: "uz",
  vi: "vi",
  zh: "zh-cn",
};

let currentLocale = "en";

/**
 * تغيير لغة dayjs (sync)
 */
function setDayjsLocale(lang: string) {
  const locale = DAYJS_LOCALE_MAP[lang] ?? "en";

  if (currentLocale !== locale) {
    dayjs.locale(locale);
    currentLocale = locale;
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
// export function formatTime(timestampMs: number): string {
//   setDayjsLocale(getLangFromPath());
//   return dayjs(timestampMs).local().format("HH:mm");
// }
export function formatTime(timestampMs: number): string {
  setDayjsLocale(getLangFromPath());
  return dayjs(timestampMs).local().format("hh:mm A");
}

/**
 * تنسيق التاريخ مثل "2025-04-09"
 */
export function formatDate(timestampMs: number): string {
  setDayjsLocale(getLangFromPath());
  return dayjs(timestampMs).local().format("YYYY-MM-DD");
}

/**
 * تنسيق الوقت بالنسبة للآن مثل "منذ 5 دقائق"
 */
export function formatFromNow(timestampMs: number): string {
  setDayjsLocale(getLangFromPath());
  return dayjs(timestampMs).local().fromNow();
}

// import dayjs from "dayjs";

// const loadedLocales = new Set<string>();

// export async function loadDayjsLocale(lang: string) {
//   if (loadedLocales.has(lang)) return;

//   try {
//     await import(`dayjs/locale/${lang}`);
//     dayjs.locale(lang);
//     loadedLocales.add(lang);
//   } catch{
//     console.warn(`Locale ${lang} not found, fallback to en`);
//     dayjs.locale("en");
//   }
// }

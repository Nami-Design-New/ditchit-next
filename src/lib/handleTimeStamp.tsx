// utils/time.ts
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * تحويل وقت من أي TimeZone لوقت الجهاز
 * @param time - الوقت الأصلي (مثال: "2025-12-30 06:10:00")
 * @param fromTimeZone - تايم زون الأصلي (مثال: "America/New_York")
 * @returns الوقت حسب جهاز المستخدم
 */
export function convertToDeviceTime(time: string, fromTimeZone: string): string {
  const deviceTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return dayjs
    .tz(time, fromTimeZone)
    .tz(deviceTimeZone)
    .format("YYYY-MM-DD HH:mm:ss");
}

/**
 * تحويل UTC لوقت الجهاز
 * @param utcTime - الوقت بصيغة UTC
 * @returns الوقت حسب جهاز المستخدم
 */
export function utcToDeviceTime(utcTime: string): string {
  return dayjs(utcTime).local().format("YYYY-MM-DD HH:mm:ss");
}

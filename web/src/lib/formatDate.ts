import type { Timestamp } from "firebase/firestore";

export function formatDate(timestamp: Timestamp | null | undefined, locale = "de-DE"): string {
  if (!timestamp) return "";
  return timestamp.toDate().toLocaleDateString(locale);
}

export function formatMessageTime(
  timestamp: Timestamp | null | undefined,
  locale = "de-DE",
  todayLabel = "Heute",
  yesterdayLabel = "Gestern",
): string {
  if (!timestamp) return "";
  const date = timestamp.toDate();
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();
  const time = date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  if (isToday) return `${todayLabel} ${time}`;
  if (isYesterday) return `${yesterdayLabel} ${time}`;
  return `${date.toLocaleDateString(locale)} ${time}`;
}

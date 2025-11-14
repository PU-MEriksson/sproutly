import { DateFormatter } from "@internationalized/date";

export const df = new DateFormatter("sv-SE", { dateStyle: "long" })

export function formatDateValueToYmd(v: { year: number; month: number; day: number }) {
  const year = v.year.toString().padStart(4, "0")
  const month = v.month.toString().padStart(2, "0")
  const day = v.day.toString().padStart(2, "0")

  return `${year}-${month}-${day}`
}
import * as chrono from "chrono-node"

export const parseDateTime = (str: Date | string) => {
   if (str instanceof Date) return str
   return chrono.uk.parseDate(str)
}

export const format = (date: Date | string) =>
   new Intl.DateTimeFormat("uk-UA", {
      month: "short",
      day: "numeric",
      year: "numeric",
   }).format(new Date(date))

export const getDateTimeLocal = (timestamp?: Date): string => {
   const d = timestamp ? new Date(timestamp) : new Date()
   if (d.toString() === "Invalid Date") return ""
   return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .split(":")
      .slice(0, 2)
      .join(":")
}

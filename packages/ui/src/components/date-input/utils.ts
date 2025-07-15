import * as chrono from "chrono-node"

export const startOfDay = () => "00:00"
export const endOfDay = () => "23:59"

export const now = () => {
   const date = new Date()
   const hours = date.getHours().toString().padStart(2, "0")
   const minutes = date.getMinutes().toString().padStart(2, "0")
   return `${hours}:${minutes}`
}

export const nHoursFromNow = (n: number) => {
   const date = new Date()
   date.setHours(date.getHours() + n)
   const hours = date.getHours().toString().padStart(n, "0")
   const minutes = date.getMinutes().toString().padStart(n, "0")
   return `${hours}:${minutes}`
}

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

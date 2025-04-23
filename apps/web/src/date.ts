export const formatDateRelative = (
   date: Date | number | string,
   style?: Intl.RelativeTimeFormatStyle,
) => {
   // Allow dates or times to be passed
   const timeMs =
      typeof date === "number"
         ? date
         : typeof date === "string"
           ? new Date(date).getTime()
           : date.getTime()

   // Get the amount of seconds between the given date and now
   const deltaSeconds = Math.round((Date.now() - timeMs) / 1000) // Changed this line

   if (Math.abs(deltaSeconds) < 60) return "just now"

   // Array representing one minute, hour, day, week, month, etc in seconds
   const cutoffs = [
      60,
      3600,
      86400,
      86400 * 7,
      86400 * 30,
      86400 * 365,
      Infinity,
   ]

   // Array equivalent to the above but in the string representation of the units
   const units: Intl.RelativeTimeFormatUnit[] = [
      "second",
      "minute",
      "hour",
      "day",
      "week",
      "month",
      "year",
   ]

   // Grab the ideal cutoff unit
   const unitIndex = cutoffs.findIndex(
      (cutoff) => cutoff > Math.abs(deltaSeconds),
   )

   // Get the divisor to divide from the seconds. E.g. if our unit is "day" our divisor
   // is one day in seconds, so we can divide our seconds by this to get the # of days
   const divisor = unitIndex ? cutoffs[unitIndex - 1] : 1
   const unit = units[unitIndex]

   if (!divisor || !unit) return ""

   // Intl.RelativeTimeFormat do its magic
   const rtf = new Intl.RelativeTimeFormat("en-US", { numeric: "auto", style })
   return rtf.format(-Math.floor(deltaSeconds / divisor), unit) // Added negative sign here
}

export const formatDate = (
   date: Date | string | number,
   options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      weekday: "long",
   },
) =>
   new Intl.DateTimeFormat("en-US", {
      ...options,
   }).format(new Date(date))

export const formatMinutesToTime = (minutes: number) => {
   if (minutes === 0) return "0 min"

   const hours = Math.floor(minutes / 60)
   const mins = minutes % 60

   let result = ""

   if (hours > 0) {
      if (hours === 1) {
         result += "1 hour"
      } else if (hours === 1.5) {
         result += "1.5 hours"
      } else {
         result += `${hours} hours`
      }

      if (mins > 0) {
         result += ", "
      }
   }

   if (mins > 0) {
      result += `${mins} min`
   }

   return result
}

import { formatDate } from "@unfiddle/core/date"

export const formatEstimateDate = (date: string | Date) => {
   return formatDate(
      date,
      new Date(date).getDate() === new Date().getDate()
         ? { timeStyle: "short" }
         : { dateStyle: "short" },
   )
}

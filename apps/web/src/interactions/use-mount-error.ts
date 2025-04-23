import { useSearch } from "@tanstack/react-router"
import { useEffect } from "react"
import { toast } from "sonner"

let mounted = false

export function useMountError(errorMessage = "Error, please try again") {
   const search = useSearch({ strict: false })

   useEffect(() => {
      if (mounted || !("error" in search) || !search.error) return

      const message =
         "message" in search && typeof search.message === "string"
            ? decodeURIComponent(search.message.replace(/\+/g, " "))
            : errorMessage

      setTimeout(() => {
         toast.error(message)
      })

      mounted = true
   }, [])

   return null
}

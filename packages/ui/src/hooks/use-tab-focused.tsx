import * as React from "react"

export function useTabFocused() {
   const [tabFocused, setTabFocused] = React.useState(!document.hidden)

   React.useEffect(() => {
      const onChange = () => setTabFocused(document.hasFocus())

      document.addEventListener("visibilitychange", onChange)
      window.addEventListener("focus", onChange)
      window.addEventListener("blur", onChange)

      return () => {
         document.removeEventListener("visibilitychange", onChange)
         window.removeEventListener("focus", onChange)
         window.removeEventListener("blur", onChange)
      }
   }, [])

   return tabFocused
}

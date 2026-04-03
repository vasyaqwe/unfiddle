import * as React from "react"

export function useFocusOnTabFocus(ref: React.RefObject<HTMLElement | null>) {
   React.useEffect(() => {
      ref.current?.focus()
      const onVisibilityChange = () => {
         if (document.visibilityState === "visible") {
            ref.current?.focus()
         }
      }
      document.addEventListener("visibilitychange", onVisibilityChange)
      return () =>
         document.removeEventListener("visibilitychange", onVisibilityChange)
   }, [])
}

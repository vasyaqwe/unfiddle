import * as React from "react"

export function useDelayedValue<T>(value: T, delayTime: number): T {
   const [delayedValue, setDelayedValue] = React.useState<T>(value)

   React.useEffect(() => {
      let timeoutId: NodeJS.Timeout

      if (!value) {
         timeoutId = setTimeout(() => {
            setDelayedValue(value)
         }, delayTime) as unknown as never
      } else {
         setDelayedValue(value)
      }

      return () => clearTimeout(timeoutId)
   }, [value, delayTime])

   return delayedValue
}

import * as React from "react"

export function useForceUpdate() {
   const [, forceUpdate] = React.useState(0)
   React.useEffect(() => {
      forceUpdate((n) => n + 1)
   }, [])
   return null
}

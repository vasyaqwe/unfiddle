import * as React from "react"
import { useLocalStorage } from "@/interactions/use-local-storage"

export function useCssVariable(
   key: string,
   initialValue: string,
): [string, (value: string) => void] {
   const [value, setValue] = useLocalStorage<string>(key, initialValue)
   const cssVariableName = `--${key}`

   const updateValue = React.useCallback(
      (newValue: string): void => {
         setValue(newValue)
         document.documentElement.style.setProperty(cssVariableName, newValue)
      },
      [cssVariableName, setValue],
   )

   React.useEffect(() => {
      document.documentElement.style.setProperty(cssVariableName, value)
   }, [cssVariableName, value])

   return [value, updateValue]
}

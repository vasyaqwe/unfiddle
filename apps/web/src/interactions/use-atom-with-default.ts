import { type PrimitiveAtom, useAtom } from "jotai"
import * as React from "react"

export const useAtomWithDefault = <T>(
   atom: PrimitiveAtom<T>,
   defaultValue: T,
): [T, (update: T | ((prev: T) => T)) => void] => {
   const [value, setValue] = useAtom(atom)
   React.useEffect(() => {
      setValue(defaultValue)
   }, [])

   return [value ?? defaultValue, setValue]
}

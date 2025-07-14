import * as React from "react"

export const useLatest = <T>(value: T) => {
   const ref = React.useRef(value)

   React.useLayoutEffect(() => {
      ref.current = value
   })

   return ref
}

// basically Exclude<React.ClassAttributes<T>["ref"], string>
type UserRef<T> =
   | ((instance: T | null) => void)
   | React.RefObject<T>
   | null
   | undefined

export const useComposedRef = <T extends HTMLElement>(
   libRef: React.RefObject<T | null>,
   userRef: UserRef<T | null>,
) => {
   const prevUserRef = React.useRef<UserRef<T | null>>(null)
   return React.useCallback(
      (instance: T | null) => {
         libRef.current = instance

         if (prevUserRef.current) {
            // Handle directly instead of using updateRef
            if (typeof prevUserRef.current === "function") {
               prevUserRef.current(null)
            } else {
               prevUserRef.current.current = null
            }
         }

         prevUserRef.current = userRef
         if (!userRef) return

         if (typeof userRef === "function") {
            userRef(instance)
         } else {
            userRef.current = instance
         }
      },
      [userRef],
   )
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type UnknownFunction = (...args: any[]) => any

type InferEventType<TTarget> = TTarget extends {
   // we infer from 2 overloads which are super common for event targets in the DOM lib
   // we "prioritize" the first one as the first one is always more specific
   // biome-ignore lint/suspicious/noExplicitAny: <explanation>
   addEventListener(type: infer P, ...args: any): void
}
   ? P & string
   : never

type InferEvent<
   TTarget,
   TType extends string,
> = `on${TType}` extends keyof TTarget
   ? Parameters<Extract<TTarget[`on${TType}`], UnknownFunction>>[0]
   : Event

function useListener<
   TTarget extends EventTarget,
   TType extends InferEventType<TTarget>,
>(
   target: TTarget,
   type: TType,
   listener: (event: InferEvent<TTarget, TType>) => void,
) {
   const latestListener = useLatest(listener)
   React.useLayoutEffect(() => {
      const handler: typeof listener = (ev) => latestListener.current(ev)
      // might happen if document.fonts is not defined, for instance
      if (!target) return
      target.addEventListener(type, handler)
      return () => target.removeEventListener(type, handler)
   }, [])
}

export const useFormResetListener = (
   libRef: React.RefObject<HTMLTextAreaElement | null>,
   // biome-ignore lint/suspicious/noExplicitAny: <explanation>
   listener: (event: Event) => any,
) => {
   useListener(document.body, "reset", (ev) => {
      if (libRef.current?.form === ev.target) {
         listener(ev)
      }
   })
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const useWindowResizeListener = (listener: (event: UIEvent) => any) => {
   // @ts-ignore
   useListener(window, "resize", listener)
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const useFontsLoadedListener = (listener: (event: Event) => any) => {
   useListener(document.fonts, "loadingdone", listener)
}

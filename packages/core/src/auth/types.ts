import type { authClient } from "@unfiddle/core/auth"

export type Session = ReturnType<
   typeof authClient
>["$Infer"]["Session"]["session"]
export type User = ReturnType<typeof authClient>["$Infer"]["Session"]["user"]

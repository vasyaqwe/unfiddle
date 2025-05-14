import { env } from "@/env"
import type { ApiErrorCode } from "@ledgerblocks/core/api/error"
import type { ApiRoutes } from "@ledgerblocks/core/api/types"
import { type ClientResponse, hc } from "hono/client"
import type { StatusCode } from "hono/utils/http-status"

export const api = hc<ApiRoutes>(env.API_URL, {
   fetch: ((input, init) => {
      return fetch(input, {
         ...init,
         credentials: "include",
      })
   }) satisfies typeof fetch,
})

type HonoResponse<T> = Promise<ClientResponse<T, StatusCode, "json">>

export const query = <T>(fn: () => HonoResponse<T>) => {
   return async () => {
      const res = await fn()
      if (res.ok) return res.json()
      return Promise.reject(await res.json())
   }
}

export type ApiClientError = {
   code: ApiErrorCode
   message: string
}

export const CACHE_NONE = 0
export const CACHE_SHORT = 30 * 1000 // 30 sec
export const CACHE_AWHILE = 300 * 1000 // 5 min
export const CACHE_FOREVER = Infinity

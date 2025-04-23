import type { CookieOptions } from "hono/utils/cookie"

export const COOKIE_OPTIONS = {
   path: "/",
   httpOnly: true,
   secure: true,
   maxAge: 600,
   sameSite: "lax",
} satisfies CookieOptions

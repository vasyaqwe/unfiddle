import type { HonoEnv } from "@unfiddle/core/api/types"
import { logger } from "@unfiddle/core/logger"
import type { Context } from "hono"
import { HTTPException } from "hono/http-exception"
import { ZodError, type ZodIssue, z } from "zod"

const codeSchema = z.enum([
   "BAD_REQUEST",
   "FORBIDDEN",
   "INTERNAL_SERVER_ERROR",
   "USAGE_EXCEEDED",
   "DISABLED",
   "CONFLICT",
   "NOT_FOUND",
   "NOT_UNIQUE",
   "UNAUTHORIZED",
   "METHOD_NOT_ALLOWED",
   "PARSE_ERROR",
   "NOT_IMPLEMENTED",
   "TOO_MANY_REQUESTS",
])

export type ApiErrorCode = z.infer<typeof codeSchema>

export const statusToCode = (status: number): ApiErrorCode => {
   if (status === 400) return "BAD_REQUEST"
   if (status === 401) return "UNAUTHORIZED"
   if (status === 403) return "FORBIDDEN"
   if (status === 404) return "NOT_FOUND"
   if (status === 405) return "METHOD_NOT_ALLOWED"
   if (status === 409) return "CONFLICT"
   if (status === 422) return "PARSE_ERROR"
   if (status === 429) return "TOO_MANY_REQUESTS"
   if (status === 501) return "NOT_IMPLEMENTED"
   if (status === 500) return "INTERNAL_SERVER_ERROR"

   return "INTERNAL_SERVER_ERROR"
}

export const parseZodErrorIssues = (issues: ZodIssue[]): string => {
   return issues
      .map((i) =>
         i.code === "invalid_union"
            ? i.unionErrors
                 .map((ue) => parseZodErrorIssues(ue.issues))
                 .join("; ")
            : i.code === "unrecognized_keys"
              ? i.message
              : `${i.path.length ? `${i.code} in '${i.path}': ` : ""}${i.message}`,
      )
      .join("; ")
}

export const handleApiError = (error: Error, c: Context<HonoEnv>) => {
   if (error instanceof ZodError) {
      const message = parseZodErrorIssues(error.issues)
      logger.error(400, message)
      return c.json(
         {
            code: statusToCode(400),
            message,
         },
         400,
      )
   }

   if (error instanceof HTTPException) {
      logger.error(error.status, error.message)
      return c.json(
         {
            code: statusToCode(error.status),
            message: error.message,
         },
         error.status,
      )
   }

   const message = error.message ?? "Unknown error"
   logger.error(500, message)
   return c.json(
      {
         code: statusToCode(500),
         message,
      },
      500,
   )
}

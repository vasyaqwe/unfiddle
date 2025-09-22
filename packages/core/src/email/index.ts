import type { ApiEnv } from "@unfiddle/core/env"
import { Resend } from "resend"

export const EMAIL_FROM = "unfiddle <unfiddle@vasyaqwe.com>"

export const emailClient = (c: { var: { env: ApiEnv } }) =>
   new Resend(c.var.env.RESEND_API_KEY)

export type EmailClient = ReturnType<typeof emailClient>

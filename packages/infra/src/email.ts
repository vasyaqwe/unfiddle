import { Resend } from "resend"
import type { ApiEnv } from "./env"

export const EMAIL_FROM = "unfiddle <unfiddle@vasyaqwe.com>"

export const emailClient = (c: { var: { env: ApiEnv } }) =>
   new Resend(c.var.env.RESEND_API_KEY)

export type EmailClient = ReturnType<typeof emailClient>

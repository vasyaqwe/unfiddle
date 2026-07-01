import { d } from "@unfiddle/core/database"
import { emailClient } from "@unfiddle/core/email"
import type { ApiEnv } from "@unfiddle/core/env"
import { clientEnv } from "@unfiddle/core/env"
import { logger } from "@unfiddle/core/logger"
import { sendUnreadOrderMessageEmails } from "@unfiddle/core/order/message/notification/send"

export const scheduled = async (
   _controller: ScheduledController,
   rawEnv: ApiEnv,
   ctx: ExecutionContext,
): Promise<void> => {
   const env = { ...rawEnv, ...clientEnv[rawEnv.ENVIRONMENT] }
   const c = { var: { env } }
   const db = d.client(c)
   const email = emailClient(c)

   ctx.waitUntil(
      sendUnreadOrderMessageEmails({ db, email, env, now: new Date() })
         .then((res) => logger.info(`Sent ${res.sent} unread-message emails`))
         .catch((error) => logger.error(error)),
   )
}

import { user } from "@ledgerblocks/core/auth/schema"
import { createUpdateSchema } from "drizzle-zod"

export const updateUserSchema = createUpdateSchema(user).pick({
   name: true,
   image: true,
})

import { apiValidator, createRouter } from "@ledgerblocks/core/api/utils"
import { authMiddleware } from "@ledgerblocks/core/auth/middleware"
import { createId } from "@ledgerblocks/core/id"
import { tryCatch } from "@ledgerblocks/core/try-catch"
import { HTTPException } from "hono/http-exception"
import { z } from "zod"

const base64ToArrayBuffer = (base64: string): Uint8Array => {
   return new Uint8Array(
      atob(base64)
         .split("")
         .map((c) => c.charCodeAt(0)),
   )
}

export const storageRouter = createRouter()
   .use(authMiddleware)
   .post(
      "/",
      apiValidator(
         "json",
         z.object({
            files: z.array(
               z.object({
                  name: z.string(),
                  size: z.number(),
                  type: z.string(),
                  base64: z.string(),
                  width: z.number().nullable(),
                  height: z.number().nullable(),
               }),
            ),
         }),
      ),
      async (c) => {
         const { files } = c.req.valid("json")
         if (files.length === 0)
            throw new HTTPException(400, {
               message: "No files provided",
            })

         const uploaded = await Promise.all(
            files.map(async (file) => {
               const id = createId("file")
               const PATH = "files/"

               const fileBuffer = base64ToArrayBuffer(file.base64)
               const resultPath = `${PATH}${id}`

               const uploaded = await tryCatch(
                  c.var.env.BUCKET.put(resultPath, fileBuffer, {
                     customMetadata: {
                        name: file.name,
                        size: file.size.toString(),
                        type: file.type,
                        width: file.width?.toString() ?? "0",
                        height: file.height?.toString() ?? "0",
                     },
                  }),
               )

               if (uploaded.error)
                  return {
                     id,
                     name: file.name,
                     size: file.size,
                     type: file.type,
                     width: file.width,
                     height: file.height,
                     error: uploaded.error.message,
                     url: "",
                  }

               return {
                  id,
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  width: file.width,
                  height: file.height,
                  url: `${c.var.env.STORAGE_URL}/${PATH}${id}`,
               }
            }),
         )

         if (uploaded.every((r) => r.error))
            throw new HTTPException(400, {
               message: `All files failed to upload: ${uploaded[0]?.error}`,
            })

         return c.json({ status: "ok", uploaded })
      },
   )

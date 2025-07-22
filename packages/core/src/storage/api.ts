import { apiValidator, createRouter } from "@unfiddle/core/api/utils"
import { authMiddleware } from "@unfiddle/core/auth/middleware"
import { createId } from "@unfiddle/core/id"
import { tryCatch } from "@unfiddle/core/try-catch"
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
      "/list-by-ids",
      apiValidator(
         "json",
         z.object({
            ids: z.array(z.string()),
         }),
      ),
      async (c) => {
         const { ids } = c.req.valid("json")
         if (!ids.length) return c.json({ attachments: [] })

         const PATH = "files/"
         const attachments = []

         for (const id of ids) {
            try {
               const resultPath = `${PATH}${id}`
               const fileObject = await c.var.env.BUCKET.head(resultPath)

               if (!fileObject) continue

               const metadata = fileObject.customMetadata || {}

               attachments.push({
                  id,
                  name: metadata.name || id,
                  size: parseInt(metadata.size ?? "0"),
                  type: metadata.type || "application/octet-stream",
                  width: metadata.width ? parseInt(metadata.width) : null,
                  height: metadata.height ? parseInt(metadata.height) : null,
                  url: `${c.var.env.STORAGE_URL}/${resultPath}`,
               })
            } catch (_err) {}
         }

         return c.json({ attachments })
      },
   )
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
                     id: id as string,
                     name: file.name,
                     size: file.size,
                     type: file.type,
                     width: file.width,
                     height: file.height,
                     error: uploaded.error.message,
                     url: "",
                  }

               return {
                  id: id as string,
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

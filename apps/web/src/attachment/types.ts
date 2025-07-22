import type { Attachment } from "@unfiddle/core/attachment/types"

export type UploadedAttachment = Pick<
   Attachment,
   "id" | "name" | "type" | "url" | "size" | "width" | "height"
> & { error?: string | undefined }

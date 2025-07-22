import { api, query } from "@/api"
import { uploadedIdsAtom } from "@/attachment/store"
import type { UploadedAttachment } from "@/attachment/types"
import { MAX_FILE_SIZE } from "@/file/components/uploader/constants"
import {
   handleFiles,
   handleRejectedFiles,
   imageDimensions,
} from "@/file/components/uploader/utils"
import { fileToBase64 } from "@/file/components/uploader/utils"
import {
   queryOptions,
   useMutation,
   useQuery,
   useQueryClient,
} from "@tanstack/react-query"
import type { InferResponseType } from "hono"
import { useAtom } from "jotai"
import type React from "react"
import type { FileRejection } from "react-dropzone"
import { toast } from "sonner"

const attachmentListQueryOptions = (input: {
   subjectId: string
   ids: string[]
}) =>
   queryOptions({
      queryKey: ["attachments", input],
      queryFn: query(() =>
         api.storage["list-by-ids"].$post({
            json: { ids: input.ids },
         }),
      ),
      enabled: input.ids.length > 0,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
   })

export function useAttachments({
   subjectId,
   onSuccess,
   uploadedIds: initialUploadedIds,
}: {
   subjectId: string
   onSuccess?: (
      uploaded: InferResponseType<typeof api.storage.$post>["uploaded"],
   ) => void
   uploadedIds?: string[]
}) {
   const queryClient = useQueryClient()
   const [uploadedIds, setUploadedIds] = useAtom(uploadedIdsAtom)
   const ids = initialUploadedIds ?? uploadedIds[subjectId] ?? []

   const attachments = useQuery(attachmentListQueryOptions({ subjectId, ids }))

   const upload = useMutation({
      mutationFn: async (files: File[]) => {
         const json = await Promise.all(
            files.map(async (file) => {
               let width: number | null = null
               let height: number | null = null

               if (file.type.startsWith("image/")) {
                  const res = await imageDimensions(file)
                  width = res.width
                  height = res.height
               }

               return {
                  name: file.name,
                  type: file.type,
                  size: file.size,
                  width,
                  height,
                  base64: await fileToBase64(file),
               }
            }),
         )

         const res = await api.storage.$post({
            json: { files: json },
         })
         return (await res.json()).uploaded
      },
      onSuccess: async (uploaded) => {
         const failed = uploaded.filter((r) => "error" in r)
         for (const attachment of failed) {
            toast.error("Помилка завантаження", {
               description: `Не вдалося завантажити ${attachment.name}`,
            })
         }
         const succeeded = uploaded
            .filter((r): r is UploadedAttachment => !("error" in r))
            .map((item) => item.id)
         setUploadedIds((prev) => ({
            ...prev,
            [subjectId]: [...(prev[subjectId] ?? []), ...succeeded],
         }))
         onSuccess?.(uploaded)
      },
   })

   const onPaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const files = e.clipboardData?.files
      if (!files) return
      const acceptedFiles: File[] = []
      const rejectedFiles: FileRejection[] = []

      for (let i = 0; i < files.length; i++) {
         const file = files[i]
         if (!file) return

         if (file.size > MAX_FILE_SIZE) {
            rejectedFiles.push({
               file,
               errors: [
                  { code: "file-too-large", message: "File is too large" },
               ],
            })
         } else {
            acceptedFiles.push(file)
         }
      }

      handleRejectedFiles(rejectedFiles)
      handleFiles({
         files: acceptedFiles,
         onUpload: async () => await upload.mutateAsync(acceptedFiles),
      })
   }

   const remove = (idToRemove: string) => {
      setUploadedIds((prev) => {
         const currentUploads = prev[subjectId] ?? []
         const newUploads = currentUploads.filter((id) => id !== idToRemove)

         queryClient.setQueryData(
            attachmentListQueryOptions({ subjectId, ids: currentUploads })
               .queryKey,
            (currentData) => {
               if (!currentData) return { attachments: [] }
               return {
                  ...currentData,
                  attachments: currentData.attachments.filter(
                     (att) => att.id !== idToRemove,
                  ),
               }
            },
         )

         return {
            ...prev,
            [subjectId]: newUploads,
         }
      })
   }

   const clear = () => {
      setUploadedIds((prev) => {
         queryClient.setQueryData(
            attachmentListQueryOptions({ subjectId, ids: [] }).queryKey,
            () => ({
               attachments: [],
            }),
         )

         return {
            ...prev,
            [subjectId]: [],
         }
      })
   }

   return {
      uploaded: attachments.data?.attachments ?? [],
      isPending: attachments.isPending,
      error: attachments.error,
      refetch: attachments.refetch,
      remove,
      clear,
      upload,
      onPaste,
   }
}

export function useDownloadAttachment() {
   const download = async (files: { name: string; url: string }[]) => {
      if (files.length === 1) {
         const response = await fetch(files[0]?.url ?? "")
         const blob = await response.blob()
         const url = URL.createObjectURL(blob)
         const a = document.createElement("a")
         a.href = url
         a.download = files[0]?.name ?? "attachment"
         a.click()
         URL.revokeObjectURL(url)
         return "Downloaded single file"
      }

      const JSZip = (await import("jszip")).default
      const zip = new JSZip()

      const blobs = await Promise.all(
         files.map(async (file) => {
            const response = await fetch(file.url)
            return { name: file.name, blob: await response.blob() }
         }),
      )

      for (const { name, blob } of blobs) {
         zip.file(name, blob)
      }

      const zipBlob = await zip.generateAsync({ type: "blob" })
      const url = URL.createObjectURL(zipBlob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${files.length} ${files.length === 1 ? "attachment" : "attachments"}.zip`
      a.click()
      URL.revokeObjectURL(url)
      return "Downloaded zip file"
   }

   return useMutation<string, Error, { name: string; url: string }[]>({
      mutationFn: download,
   })
}

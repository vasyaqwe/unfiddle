import type { UploadedAttachment } from "@/attachment/types"
import type { FileRejection } from "react-dropzone"
import { toast } from "sonner"

export const handleFiles = ({
   files,
   maxFileCount = Infinity,
   multiple = true,
   onUpload,
}: {
   files: File[]
   maxFileCount?: number
   multiple?: boolean
   // onSetFiles: (files: File[]) => void
   onUpload?: (files: File[]) => Promise<UploadedAttachment[]>
}) => {
   if (!multiple && maxFileCount === 1 && files.length > 1)
      return toast.error("Максимум один файл за раз")

   const newFiles = files.map((file) =>
      Object.assign(file, { preview: URL.createObjectURL(file) }),
   )

   // onSetFiles(newFiles)

   if (onUpload && newFiles.length > 0) {
      const target = newFiles.length > 1 ? `${newFiles.length} файлів` : `файл`

      toast.promise(onUpload(newFiles), {
         loading: `Завантажуємо ${target}...`,
         success: (res) => {
            const succeeded = res.filter(
               (r): r is UploadedAttachment => !("error" in r),
            )
            return `${succeeded.length > 1 ? `${succeeded.length} файлів` : "Файл"} завантажено`
         },
         error: (err) => {
            return err instanceof Error
               ? err.message
               : `Невдало завантажити ${target}`
         },
      })
   }
}

export const handleRejectedFiles = (rejectedFiles: FileRejection[]) => {
   for (const { file, errors } of rejectedFiles) {
      if (errors.some((e) => e.code === "file-too-large")) {
         toast.error("Помилка завантаження", {
            description: `Занадто великий файл: ${file.name}`,
         })
      } else {
         toast.error("Помилка завантаження", {
            description: `Не вдалося завантажити ${file.name}`,
         })
      }
   }
}

export const imageDimensions = async (
   file: File,
): Promise<{ width: number; height: number }> => {
   return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (event) => {
         const img = new Image()
         img.onload = () => {
            resolve({ width: img.width, height: img.height })
         }
         img.onerror = (_error) => {
            reject(new Error("Failed to load image"))
         }
         img.src = event.target?.result as string
      }

      reader.onerror = (_error) => {
         reject(new Error("Failed to read file"))
      }

      reader.readAsDataURL(file)
   })
}

export const formatBytes = (
   bytes: number,
   opts: {
      decimals?: number
      sizeType?: "accurate" | "normal"
   } = {},
) => {
   const { decimals = 0, sizeType = "normal" } = opts

   const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
   const accurateSizes = ["Bytes", "KiB", "MiB", "GiB", "TiB"]

   if (bytes === 0) return "0 Byte"

   const i = Math.floor(Math.log(bytes) / Math.log(1024))

   return `${(bytes / 1024 ** i).toFixed(decimals)} ${
      sizeType === "accurate"
         ? (accurateSizes[i] ?? "Bytest")
         : (sizes[i] ?? "Bytes")
   }`
}

export const truncate = (str: string, maxLength: number) => {
   if (str.length <= maxLength) return str

   const ext = str.match(/\.(png|jpeg|jpg)$/i)
   if (!ext) return `${str.slice(0, maxLength - 1)}…`

   const nameLength = maxLength - ext[0].length - 3
   return `${str.slice(0, nameLength)}...${ext[0]}`
}

export const fileToBase64 = (file: File): Promise<string> => {
   return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
         const base64 = (reader.result as string).split(",")[1]
         resolve(base64 ?? "")
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
   })
}

//courtesy of https://github.com/sadmann7

import type { UploadedAttachment } from "@/attachment/types"
import { Icons } from "@unfiddle/ui/components/icons"
import { SVGPreview } from "@unfiddle/ui/components/svg-preview"
import { cn } from "@unfiddle/ui/utils"
import * as React from "react"
import Dropzone, {
   type DropzoneProps,
   type FileRejection,
} from "react-dropzone"
import { MAX_FILE_SIZE } from "./constants"
import { useControllableState } from "./hooks/use-controllable-state"
import { useDragState } from "./hooks/use-drag-state"
import { formatBytes, handleFiles, handleRejectedFiles } from "./utils"

type NativeDropFile = {
   path: string
   contents: Uint8Array
}

export type NativeDragDropEvent =
   | {
        type: "drag"
        x: number
        y: number
     }
   | {
        type: "drop"
        files: NativeDropFile[]
     }
   | {
        type: "cancel"
     }

interface Props extends React.ComponentProps<"div"> {
   /**
    * Value of the uploader.
    * @type File[]
    * @default undefined
    * @example value={files}
    */
   value?: File[]

   /**
    * Function to be called when the value changes.
    * @type (files: File[]) => void
    * @default undefined
    * @example onValueChange={(files) => setFiles(files)}
    */
   onValueChange?: (files: File[]) => void

   /**
    * Function to be called when files are uploaded.
    * @type (files: File[]) => Promise<void>
    * @default undefined
    * @example onUpload={(files) => uploadFiles(files)}
    */

   onUpload?: (files: File[]) => Promise<UploadedAttachment[]>

   /**
    * Progress of the uploaded files.
    * @type Record<string, number> | undefined
    * @default undefined
    * @example progresses={{ "file1.png": 50 }}
    */
   progresses?: Record<string, number>

   /**
    * Accepted file types for the uploader.
    * @type { [key: string]: string[]}
    * @default
    * ```ts
    * { "image/*": [] }
    * ```
    * @example accept={["image/png", "image/jpeg"]}
    */
   accept?: DropzoneProps["accept"]

   /**
    * Maximum file size for the uploader.
    * @type number | undefined
    * @default 1024 * 1024 * 2 // 2MB
    * @example maxSize={1024 * 1024 * 2} // 2MB
    */
   maxSize?: DropzoneProps["maxSize"]

   /**
    * Maximum number of files for the uploader.
    * @type number | undefined
    * @default 1
    * @example maxFileCount={4}
    */
   maxFileCount?: DropzoneProps["maxFiles"]

   /**
    * Whether the uploader should accept multiple files.
    * @type boolean
    * @default false
    * @example multiple
    */
   multiple?: boolean

   /**
    * Whether the uploader is disabled.
    * @type boolean
    * @default false
    * @example disabled
    */
   disabled?: boolean
}

export function FileUploader(props: Props) {
   const {
      value: valueProp,
      onValueChange,
      onUpload,
      progresses,
      maxSize = MAX_FILE_SIZE,
      maxFileCount = Infinity,
      multiple = false,
      disabled = false,
      className,
      ...dropzoneProps
   } = props

   const [files, _setFiles] = useControllableState({
      prop: valueProp,
      onChange: onValueChange,
   })

   const onDrop = (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      handleRejectedFiles(rejectedFiles)
      handleFiles({
         files: acceptedFiles,
         maxFileCount,
         multiple,
         // onSetFiles: setFiles,
         onUpload,
      })
   }

   // Revoke preview url when component unmounts
   React.useEffect(() => {
      return () => {
         if (!files) return
         for (const file of files) {
            if (isFileWithPreview(file)) {
               URL.revokeObjectURL(file.preview)
            }
         }
      }
   }, [])

   const isDisabled = disabled || (files?.length ?? 0) >= maxFileCount

   const { isDragging } = useDragState()

   return (
      <Dropzone
         onDrop={onDrop}
         maxSize={maxSize}
         maxFiles={maxFileCount}
         multiple={maxFileCount > 1 || multiple}
         disabled={isDisabled}
      >
         {({ getRootProps, getInputProps }) => (
            <div
               {...getRootProps()}
               className={cn(
                  "bg-background/25 backdrop-blur-[5px]",
                  isDragging ? "" : "invisible",
                  isDisabled ? "pointer-events-none opacity-70" : "",
                  className,
               )}
               {...dropzoneProps}
            >
               <input {...getInputProps()} />
               <div className="flex h-full flex-col items-center justify-center text-center sm:px-5">
                  <p className="font-medium text-xl">Кидайте файли</p>
                  <p className="mt-4 text-foreground/70">
                     Дозволено
                     {maxFileCount > 1
                        ? ` ${maxFileCount === Infinity ? "кілька" : maxFileCount}
                      файлів (кожен не понад ${formatBytes(maxSize)})`
                        : `файл розміром не понад ${formatBytes(maxSize)}`}
                  </p>
               </div>
            </div>
         )}
      </Dropzone>
   )
}

const isFileWithPreview = (file: File): file is File & { preview: string } =>
   "preview" in file && typeof file.preview === "string"

export function FilePreview({
   file,
}: {
   file: UploadedAttachment
}) {
   if (file.type.startsWith("image/")) {
      if (file.name.endsWith(".svg")) return <SVGPreview url={file.url} />

      return (
         <img
            src={file.url}
            alt={file.name}
            loading="lazy"
            className="size-full shrink-0 rounded-[inherit] object-contain object-center"
         />
      )
   }

   return <Icons.attachment className="size-6" />
}

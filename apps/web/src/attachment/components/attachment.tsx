import type { UploadedAttachment } from "@/attachment/types"
import { FilePreview } from "@/file/components/uploader"
import { formatBytes, truncate } from "@/file/components/uploader/utils"
import { Button } from "@unfiddle/ui/components/button"
import { Icons } from "@unfiddle/ui/components/icons"
import {
   Tooltip,
   TooltipPopup,
   TooltipTrigger,
} from "@unfiddle/ui/components/tooltip"
import { cx } from "@unfiddle/ui/utils"

export function Attachment({
   file,
   onRemove,
}: {
   file: UploadedAttachment
   onRemove: () => void
}) {
   const image = file.type.startsWith("image/")

   return (
      <Tooltip delay={0}>
         <TooltipTrigger
            render={
               <div
                  className={cx(
                     "group relative flex flex-col justify-center rounded-md border border-neutral dark:bg-primary-3",
                     image ? "size-17" : "h-17 px-2",
                  )}
               />
            }
         >
            <Button
               onClick={onRemove}
               type="button"
               kind={"icon"}
               size={"xs"}
               variant={"secondary"}
               aria-label={`Remove ${file.name}`}
               className="-top-2 !rounded-full -right-2 absolute bg-white p-1 text-foreground shadow-none hover:border-red-9 hover:bg-red-9 hover:text-white active:bg-red-9 group-hover:visible max-md:size-8 md:invisible dark:border-transparent dark:bg-primary-6 dark:shadow-xs dark:hover:border-red-9 dark:hover:bg-red-9"
            >
               <Icons.xMark />
            </Button>
            <FilePreview file={file} />
            {!image ? (
               <span className="mt-1.5 font-medium text-foreground/75 text-xs">
                  {truncate(file.name, 40)}
               </span>
            ) : null}
         </TooltipTrigger>
         <TooltipPopup sideOffset={9}> {formatBytes(file.size)}</TooltipPopup>
      </Tooltip>
   )
}

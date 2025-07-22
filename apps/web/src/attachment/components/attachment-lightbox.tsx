import { useDownloadAttachment } from "@/attachment/hooks"
import type { UploadedAttachment } from "@/attachment/types"
import { FilePreview } from "@/file/components/uploader"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { Button } from "@unfiddle/ui/components/button"
import {
   Dialog,
   DialogPopup,
   DialogXClose,
} from "@unfiddle/ui/components/dialog"
import { Icons } from "@unfiddle/ui/components/icons"
import { Separator } from "@unfiddle/ui/components/separator"
import { cx } from "@unfiddle/ui/utils"
import { ZoomPane } from "@unfiddle/ui/zoom-pane"
import { ZoomImageRenderer } from "@unfiddle/ui/zoom-pane/image-renderer"

export default function AttachmentLightbox({
   attachments,
}: { attachments: UploadedAttachment[] }) {
   const search = useSearch({ from: "/_authed/$workspaceId/_layout" })
   const navigate = useNavigate()
   const currentAttachment = attachments.find(
      (a) => a.id === search.attachmentId,
   )

   const prevAttachment = () => {
      const currentIndex = attachments.findIndex(
         (a) => a.id === currentAttachment?.id,
      )
      const newIndex =
         currentIndex > 0 ? currentIndex - 1 : attachments.length - 1

      const newAttachment = attachments[newIndex]
      if (newAttachment)
         navigate({ to: ".", search: { attachmentId: newAttachment.id } })
   }

   const nextAttachment = () => {
      const currentIndex = attachments.findIndex(
         (a) => a.id === currentAttachment?.id,
      )
      const newIndex =
         currentIndex < attachments.length - 1 ? currentIndex + 1 : 0
      const newAttachment = attachments[newIndex]
      if (newAttachment)
         navigate({ to: ".", search: { attachmentId: newAttachment.id } })
   }

   const download = useDownloadAttachment()

   return (
      <Dialog
         open={!!currentAttachment}
         onOpenChange={(open) => {
            if (!open)
               navigate({ to: ".", search: { attachmentId: undefined } })
         }}
      >
         <DialogPopup
            onClick={(e) => {
               e.preventDefault()
               e.stopPropagation()
            }}
            onKeyDown={(e) => {
               if (
                  ["INPUT", "TEXTAREA", "SELECT"].includes(
                     (e.target as HTMLElement).tagName,
                  )
               )
                  return
               if (
                  (e.target as HTMLElement).tagName === "DIV" &&
                  (e.target as HTMLElement).isContentEditable
               )
                  return

               if (e.key === "ArrowRight") {
                  nextAttachment()
               } else if (e.key === "ArrowLeft") {
                  prevAttachment()
               }
            }}
            className={
               "mt-0 flex h-svh max-h-svh w-full max-w-full flex-col rounded-none p-0 transition-none"
            }
         >
            <div className="flex h-(--header-height) items-center border-neutral border-b pr-2 pl-3">
               <p className="line-clamp-1 font-medium">
                  {currentAttachment?.name ?? "Untitled"}
               </p>
               <div className="z-[2] ml-auto flex items-center gap-2">
                  <Button
                     disabled={download.isPending}
                     onClick={() => {
                        if (!currentAttachment) return
                        download.mutate([currentAttachment])
                     }}
                     aria-label="Download image"
                     kind={"icon"}
                     variant={"ghost"}
                     className="[--hover:var(--color-primary-4)] dark:[--hover:var(--color-primary-5)]"
                  >
                     <Icons.download />
                  </Button>
                  <Separator className={"h-6 w-px"} />
                  <DialogXClose className={"-mt-0 mr-0"} />
               </div>
            </div>
            {attachments.length === 1 ? null : (
               <>
                  <button
                     onClick={prevAttachment}
                     className="-translate-y-1/2 absolute top-1/2 left-3 z-[1] flex h-full w-16 cursor-pointer items-center text-foreground/70 transition-colors duration-100 hover:text-foreground md:h-full"
                  >
                     <Icons.chevronLeft className="size-6" />
                  </button>
                  <button
                     onClick={nextAttachment}
                     className="-translate-y-1/2 absolute top-1/2 right-3.5 z-[1] flex h-full w-16 cursor-pointer items-center justify-end text-foreground/70 transition-colors duration-100 hover:text-foreground md:h-full"
                  >
                     <Icons.chevronRight className="size-6" />
                  </button>
               </>
            )}
            <ZoomPane
               key={currentAttachment?.url}
               width={currentAttachment?.width ?? 0}
               height={currentAttachment?.height ?? 0}
            >
               {currentAttachment?.url ? (
                  <ZoomImageRenderer
                     width={currentAttachment.width ?? 0}
                     height={currentAttachment.height ?? 0}
                     src={currentAttachment.url}
                     isSvg={currentAttachment.name.endsWith(".svg")}
                  />
               ) : null}
            </ZoomPane>
            <div className="scrollbar-hidden flex items-center justify-center gap-2 overflow-x-auto border-neutral border-t bg-transparent px-3 py-4 shadow-xs backdrop-blur-3xl">
               {attachments.map((attachment) => (
                  <button
                     key={attachment.id}
                     onClick={() => {
                        navigate({
                           to: ".",
                           search: { attachmentId: attachment.id },
                        })
                     }}
                     className={cx(
                        "cursor-(--cursor) rounded-md border outline-4",
                        currentAttachment?.id === attachment.id
                           ? "border-primary-8 outline-primary-8/25"
                           : "border-transparent outline-transparent",
                     )}
                  >
                     <div
                        className={
                           "group relative flex size-18 grow items-center gap-2 rounded-md border border-neutral md:size-18 dark:bg-primary-3"
                        }
                     >
                        <FilePreview file={attachment} />
                     </div>
                  </button>
               ))}
            </div>
         </DialogPopup>
      </Dialog>
   )
}

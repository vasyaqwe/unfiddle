import { useDeleteAttachment } from "@/attachment/mutations/use-delete-attachment"
import type { UploadedAttachment } from "@/attachment/types"
import { useAuth } from "@/auth/hooks"
import { useNavigate } from "@tanstack/react-router"
import { Icons } from "@unfiddle/ui/components/icons"
import {
   ContextMenu,
   ContextMenuItem,
   ContextMenuPopup,
   ContextMenuTrigger,
} from "@unfiddle/ui/components/menu/context"
import { ScrollArea } from "@unfiddle/ui/components/scroll-area"
import { cn } from "@unfiddle/ui/utils"
import * as React from "react"

const AttachmentLightbox = React.lazy(
   () => import("@/attachment/components/attachment-lightbox"),
)

interface Props extends React.ComponentProps<"div"> {
   images: UploadedAttachment[]
   subjectId: string
}

export function ImagesCarousel({
   images,
   className,
   subjectId,
   ...props
}: Props) {
   if (images.length === 0) return null

   return (
      <>
         <React.Suspense fallback={null}>
            <AttachmentLightbox attachments={images} />
         </React.Suspense>
         <ScrollArea
            orientation="horizontal"
            className={cn("mt-4 max-w-fit", className)}
            {...props}
         >
            <div className="flex gap-1 [--base-width:160px] md:[--base-width:220px]">
               {images.map((attachment) => {
                  return (
                     <Image
                        key={attachment.id}
                        attachment={attachment}
                        subjectId={subjectId}
                     />
                  )
               })}
            </div>
         </ScrollArea>
      </>
   )
}

function Image({
   attachment,
   subjectId,
}: { attachment: UploadedAttachment; subjectId: string }) {
   const auth = useAuth()
   const navigate = useNavigate()
   const deleteItem = useDeleteAttachment()
   const [contextMenuOpen, setContextMenuOpen] = React.useState(false)

   const { width, height } = attachment
   const aspectRatio = width && height ? width / height : 1

   return (
      <ContextMenu
         open={contextMenuOpen}
         onOpenChange={setContextMenuOpen}
      >
         <ContextMenuTrigger
            render={
               <div
                  className={
                     "cursor-pointer transition-opacity data-active:opacity-80"
                  }
                  onClick={() => {
                     navigate({
                        to: ".",
                        search: { attachmentId: attachment.id },
                     })
                  }}
                  data-active={contextMenuOpen ? "" : undefined}
               >
                  <img
                     loading={"lazy"}
                     draggable={false}
                     src={attachment.url}
                     alt={attachment.name}
                     style={
                        {
                           aspectRatio,
                           "--aspect-ratio": aspectRatio,
                        } as never
                     }
                     className="size-full max-h-[320px] min-w-[calc(var(--base-width)*var(--aspect-ratio))] rounded-xl object-cover"
                  />
               </div>
            }
         />
         <ContextMenuPopup>
            <ContextMenuItem
               destructive
               onClick={() =>
                  deleteItem.mutate({
                     attachmentId: attachment.id,
                     subjectId,
                     workspaceId: auth.workspace.id,
                  })
               }
            >
               <Icons.trash />
               Видалити
            </ContextMenuItem>
         </ContextMenuPopup>
      </ContextMenu>
   )
}

import { useDownloadAttachment } from "@/attachment/hooks"
import type { UploadedAttachment } from "@/attachment/types"
import { useAuth } from "@/auth/hooks"
import { trpc } from "@/trpc"
import { useMutation } from "@tanstack/react-query"
import { Button } from "@unfiddle/ui/components/button"
import { Icons } from "@unfiddle/ui/components/icons"
import {
   ContextMenu,
   ContextMenuItem,
   ContextMenuPopup,
   ContextMenuTrigger,
} from "@unfiddle/ui/components/menu/context"
import { SVGPreview } from "@unfiddle/ui/components/svg-preview"
import * as React from "react"

export function FileItem({
   attachment,
   subjectId,
   onDeleteSuccess,
}: {
   attachment: UploadedAttachment
   subjectId: string
   onDeleteSuccess?: () => void
}) {
   const auth = useAuth()
   const download = useDownloadAttachment()
   const deleteItem = useMutation(trpc.attachment.delete.mutationOptions())
   const [contextMenuOpen, setContextMenuOpen] = React.useState(false)

   return (
      <ContextMenu
         open={contextMenuOpen}
         onOpenChange={setContextMenuOpen}
      >
         <ContextMenuTrigger
            render={
               <Button
                  variant={"secondary"}
                  key={attachment.id}
                  disabled={download.isPending}
                  onClick={() => download.mutate([attachment])}
                  className="w-full max-w-fit justify-start pl-2 md:pl-2"
                  data-popup-open={contextMenuOpen ? "" : undefined}
               >
                  {attachment.name.endsWith(".svg") ? (
                     <SVGPreview
                        className="size-5"
                        url={attachment.url}
                     />
                  ) : (
                     <Icons.attachment />
                  )}
                  <span className="line-clamp-1 font-medium text-muted text-sm">
                     {attachment.name}
                  </span>
               </Button>
            }
         />
         {onDeleteSuccess && (
            <ContextMenuPopup>
               <ContextMenuItem
                  destructive
                  onClick={() => {
                     deleteItem.mutate(
                        {
                           attachmentId: attachment.id,
                           workspaceId: auth.workspace.id,
                           subjectId,
                        },
                        {
                           onSuccess: onDeleteSuccess,
                        },
                     )
                  }}
               >
                  <Icons.trash />
                  840;8B8
               </ContextMenuItem>
            </ContextMenuPopup>
         )}
      </ContextMenu>
   )
}

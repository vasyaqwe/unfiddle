import type { Workspace } from "@ledgerblocks/core/workspace/types"
import { cn } from "@ledgerblocks/ui/utils"
import Avatar from "boring-avatars"

interface Props extends React.ComponentProps<"div"> {
   workspace: Partial<Omit<Workspace, "createdAt" | "updatedAt">>
   size?: number
}

export function WorkspaceLogo({
   workspace,
   className,
   children,
   size = 20,
   ...props
}: Props) {
   return (
      <div
         style={
            {
               "--size": `${size}px`,
            } as never
         }
         className={cn(
            "relative size-(--size) shrink-0 overflow-hidden",
            className,
         )}
         {...props}
      >
         {workspace.image ? (
            <img
               src={workspace.image}
               alt={""}
               referrerPolicy="no-referrer"
               className={
                  "grid h-[inherit] w-full place-content-center object-cover object-top"
               }
            />
         ) : (
            <Avatar
               name={workspace.id}
               size={size}
            />
         )}
         {children}
      </div>
   )
}

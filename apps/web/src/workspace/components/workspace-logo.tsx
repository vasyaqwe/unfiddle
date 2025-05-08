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
   size = 28,
   ...props
}: Props) {
   return (
      <div
         style={
            {
               "--size": `${size}px`,
               "--radius": `${size / 5}px`,
            } as never
         }
         className={cn(
            "relative size-(--size) shrink-0 overflow-hidden rounded-(--radius)",
            workspace.image
               ? "border border-neutral bg-background shadow-[inset_0_-1px_2px_0_rgb(0_0_0_/_0.12)]"
               : "",
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
                  "grid h-[inherit] w-full place-content-center object-contain"
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

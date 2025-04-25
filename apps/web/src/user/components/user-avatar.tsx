import type { User } from "@unfiddle/core/auth/types"
import { cn } from "@unfiddle/ui/utils"
import Avatar from "boring-avatars"

interface Props extends React.ComponentProps<"div"> {
   user: Omit<User, "createdAt" | "updatedAt">
   size?: number
}

export function UserAvatar({
   user,
   className,
   children,
   size = 20,
   ...props
}: Props) {
   return (
      <span
         style={
            {
               "--avatar-size": `${size}px`,
            } as never
         }
         className={cn(
            "relative block size-(--avatar-size) shrink-0 rounded-full shadow-xs",
            className,
         )}
         {...props}
      >
         {user.image ? (
            <img
               src={user.image}
               alt={""}
               referrerPolicy="no-referrer"
               className={
                  "grid h-[inherit] w-full place-content-center rounded-full object-cover object-top"
               }
            />
         ) : (
            <Avatar
               name={user.id}
               size={size}
            />
         )}
         {children}
      </span>
   )
}

import type { User } from "@unfiddle/core/auth/types"
import { cn } from "@unfiddle/ui/utils"

interface Props extends React.ComponentProps<"div"> {
   user: Omit<User, "createdAt" | "updatedAt" | "emailVerified" | "email">
   size?: number
}

export function UserAvatar({
   user,
   className,
   children,
   size = 20,
   ...props
}: Props) {
   const name = user.name[0]?.toUpperCase()

   return (
      <span
         style={
            {
               "--size": `${size}px`,
            } as never
         }
         className={cn(
            "relative block size-(--size) shrink-0 rounded-full shadow-xs",
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
            <span
               style={{ fontSize: "calc(var(--size) * 0.575)" }}
               className={cn(
                  "grid size-full place-items-center rounded-full bg-[#f45b68] font-medium text-white/85 leading-[0] shadow-xs",
               )}
            >
               {name}
            </span>
         )}
         {children}
      </span>
   )
}

import type { User } from "@unfiddle/core/auth/types"
import { cn } from "@unfiddle/ui/utils"

interface Props extends React.ComponentProps<"div"> {
   user: Omit<User, "createdAt" | "updatedAt">
   size?: number
}

export function UserAvatar({
   user,
   className,
   children,
   size = 24,
   ...props
}: Props) {
   const name = user.name
      ? user.name[0]?.toUpperCase()
      : (user.email?.[0]?.toUpperCase() ?? "?")

   return (
      <span
         style={
            {
               "--avatar-size": `${size}px`,
            } as never
         }
         className={cn(
            "relative block size-(--avatar-size) shrink-0",
            className,
         )}
         {...props}
      >
         {user.image ? (
            <img
               src={user.image}
               alt={name}
               referrerPolicy="no-referrer"
               className={
                  "grid h-[inherit] w-full place-content-center rounded-full object-cover object-top"
               }
            />
         ) : (
            <span
               style={{ fontSize: "calc(var(--avatar-size) * 0.55)" }}
               className={cn(
                  "grid size-full place-items-center rounded-full bg-[#c06d25] font-medium text-white leading-[0] shadow-xs",
                  className,
               )}
            >
               {name}
            </span>
         )}
         {children}
      </span>
   )
}

import { trpc } from "@/trpc"
import { UserAvatar } from "@/user/components/user-avatar"
import {
   AvatarStack,
   AvatarStackItem,
} from "@ledgerblocks/ui/components/avatar-stack"
import { Button } from "@ledgerblocks/ui/components/button"
import {
   Combobox,
   ComboboxEmpty,
   ComboboxInput,
   ComboboxItem,
   ComboboxPopup,
   ComboboxTrigger,
   ComboboxTriggerIcon,
} from "@ledgerblocks/ui/components/combobox"
import { Icons } from "@ledgerblocks/ui/components/icons"
import { useQuery } from "@tanstack/react-query"
import { useNavigate, useParams, useSearch } from "@tanstack/react-router"

export function WhoCombobox() {
   const params = useParams({ from: "/_authed/$workspaceId/_layout/analytics" })
   const search = useSearch({ from: "/_authed/$workspaceId/_layout/analytics" })
   const navigate = useNavigate()
   const members = useQuery(
      trpc.workspace.member.list.queryOptions({
         workspaceId: params.workspaceId,
      }),
   )

   const selectedMembers = members.data?.filter((member) =>
      search.who.includes(member.user.id),
   )
   const selectedMember = selectedMembers?.[0]

   return (
      <Combobox
         multiple
         value={search.who}
         onValueChange={(who) =>
            navigate({
               to: ".",
               search: (prev) => ({
                  ...prev,
                  who,
                  replace: true,
               }),
            })
         }
      >
         <ComboboxTrigger
            render={
               <Button
                  variant={"secondary"}
                  className={"md:!gap-1.5 min-w-40"}
               >
                  {search.who.includes("all") ? (
                     <>Загальна</>
                  ) : search.who.length === 1 && selectedMember ? (
                     <>
                        <UserAvatar
                           size={16}
                           user={selectedMember.user}
                        />
                        <span className="line-clamp-1">
                           {selectedMember.user.name}
                        </span>
                     </>
                  ) : (
                     <AvatarStack size={18}>
                        {selectedMembers?.map((m) => (
                           <AvatarStackItem key={m.user.id}>
                              <UserAvatar
                                 size={18}
                                 user={m.user}
                              />
                           </AvatarStackItem>
                        ))}
                     </AvatarStack>
                  )}
                  <ComboboxTriggerIcon />
               </Button>
            }
         />
         <ComboboxPopup align="end">
            <ComboboxInput placeholder="Шукати.." />
            <ComboboxEmpty>Нікого не знайдено</ComboboxEmpty>
            <ComboboxItem value="all">
               <Icons.users />
               Загальна
            </ComboboxItem>
            {members.data?.map((member) => (
               <ComboboxItem
                  key={member.user.id}
                  value={member.user.id}
               >
                  <UserAvatar
                     size={18}
                     className="mr-[3px] ml-[2px] md:mr-[2px] md:ml-px"
                     user={member.user}
                  />
                  <span className="line-clamp-1">{member.user.name}</span>
               </ComboboxItem>
            ))}
         </ComboboxPopup>
      </Combobox>
   )
}

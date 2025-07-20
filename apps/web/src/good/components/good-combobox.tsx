// import { useAuth } from "@/auth/hooks"
// import { useCreateGood } from "@/good/mutations/use-create-good"
// import { useDeleteGood } from "@/good/mutations/use-delete-good"
// import { trpc } from "@/trpc"
// import { useQuery } from "@tanstack/react-query"
// import { Button } from "@unfiddle/ui/components/button"
// import {
//    Combobox,
//    ComboboxEmpty,
//    ComboboxInput,
//    ComboboxItem,
//    ComboboxPopup,
//    ComboboxTrigger,
//    ComboboxTriggerIcon,
// } from "@unfiddle/ui/components/combobox"
// import * as React from "react"

// export function GoodCombobox({
//    goodId,
//    setGoodId,
// }: {
//    goodId: string
//    setGoodId: React.Dispatch<React.SetStateAction<string>>
// }) {
//    const auth = useAuth()
//    const goods = useQuery(
//       trpc.good.list.queryOptions({ workspaceId: auth.workspace.id }),
//    )

//    const [goodName, setGoodName] = React.useState("")
//    const createGood = useCreateGood({
//       onSuccess: (id) => {
//          setGoodName("")
//          setGoodId(id)
//       },
//    })
//    const deleteGood = useDeleteGood({
//       onMutate: () => {
//          setGoodId("noop")
//       },
//    })
//    const selectedGood = goods.data?.find((item) => item.id === goodId)

//    return (
//       <Combobox
//          value={goodId}
//          onValueChange={(value) => {
//             if (goodId === value) return setGoodId("noop")
//             setGoodId(value)
//          }}
//          canBeEmpty
//       >
//          <ComboboxTrigger
//             render={
//                <Button
//                   variant={"secondary"}
//                   className="flex w-full justify-start"
//                >
//                   {selectedGood ? selectedGood.name : "-"}
//                   <ComboboxTriggerIcon />
//                </Button>
//             }
//             id="good"
//          />
//          <ComboboxPopup
//             align="start"
//             onKeyDown={(e) => {
//                const el = e.currentTarget as HTMLElement
//                const item = el.querySelector(
//                   "[data-selected=true]",
//                ) as HTMLElement | null
//                const id = item?.dataset.value

//                if (!id || id.startsWith("__new__") || e.key !== "Delete") return

//                e.preventDefault()
//                deleteGood.mutate({
//                   id,
//                   workspaceId: auth.workspace.id,
//                })
//             }}
//          >
//             <ComboboxInput
//                placeholder="Шукати або додати нове.."
//                value={goodName}
//                onValueChange={setGoodName}
//             />
//             <ComboboxEmpty>
//                {goods.data?.length === 0
//                   ? "Додайте перше"
//                   : "Нічого не знайдено"}
//             </ComboboxEmpty>
//             {goods.data?.map((item) => (
//                <ComboboxItem
//                   key={item.id}
//                   value={item.id}
//                   keywords={[item.name]}
//                   disabled={goods.isRefetching}
//                >
//                   {item.name}
//                </ComboboxItem>
//             ))}
//             {goodName.length > 0 ? (
//                <ComboboxItem
//                   value={`__new__${goodName}`}
//                   keywords={[goodName.trim()]}
//                   disabled={createGood.isPending}
//                   onSelect={() => {
//                      createGood.mutate({
//                         workspaceId: auth.workspace.id,
//                         name: goodName,
//                      })
//                   }}
//                >
//                   Створити "{goodName}"
//                </ComboboxItem>
//             ) : null}
//          </ComboboxPopup>
//       </Combobox>
//    )
// }

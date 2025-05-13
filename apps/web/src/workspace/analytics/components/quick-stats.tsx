import { formatCurrency } from "@/currency"
import { formatNumber } from "@/number"
import { trpc } from "@/trpc"
import {
   Stat,
   StatLabel,
   StatValue,
   StatValueSup,
} from "@/workspace/analytics/components/stat"
import {
   Card,
   CardContent,
   CardHeader,
   CardTitle,
} from "@ledgerblocks/ui/components/card"
import { useQuery } from "@tanstack/react-query"
import { useParams, useSearch } from "@tanstack/react-router"

export function QuickStats() {
   const params = useParams({ from: "/_authed/$workspaceId/_layout/analytics" })
   const search = useSearch({ from: "/_authed/$workspaceId/_layout/analytics" })

   const members = useQuery(
      trpc.workspace.member.list.queryOptions({
         workspaceId: params.workspaceId,
      }),
   )

   const selectedMembers =
      search.who.length === 1
         ? [{ user: { id: "all", name: "" } }]
         : members.data?.filter((member) => search.who.includes(member.user.id))

   return (
      <section className="grid grid-cols-2 gap-3 md:gap-4 xl:gap-6 2xl:grid-cols-5">
         <Card className="max-2xl:order-1">
            <CardHeader>
               <CardTitle>Всього замовлень</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-neutral">
               {selectedMembers?.map((m) => (
                  <Stat key={m.user.id}>
                     <StatLabel>{m.user.name}</StatLabel>
                     <StatValue>{formatNumber(200)}</StatValue>
                  </Stat>
               ))}
            </CardContent>
         </Card>
         <Card className="max-2xl:order-3">
            <CardHeader>
               <CardTitle>Успішно</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-neutral">
               {selectedMembers?.map((m) => (
                  <Stat key={m.user.id}>
                     <StatLabel>{m.user.name}</StatLabel>
                     <StatValue>
                        {formatNumber(120)} <StatValueSup>70%</StatValueSup>
                     </StatValue>
                  </Stat>
               ))}
            </CardContent>
         </Card>
         <Card className="max-2xl:order-4">
            <CardHeader>
               <CardTitle>Неуспішно</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-neutral">
               {selectedMembers?.map((m) => (
                  <Stat key={m.user.id}>
                     <StatLabel>{m.user.name}</StatLabel>
                     <StatValue>
                        {formatNumber(40)} <StatValueSup>30%</StatValueSup>
                     </StatValue>
                  </Stat>
               ))}
            </CardContent>
         </Card>
         <Card className="max-2xl:order-2">
            <CardHeader>
               <CardTitle>Маржинальність</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-neutral">
               {selectedMembers?.map((m) => (
                  <Stat key={m.user.id}>
                     <StatLabel>{m.user.name}</StatLabel>
                     <StatValue className={"text-green-9"}>10%</StatValue>
                  </Stat>
               ))}
            </CardContent>
         </Card>
         <Card className="order-last max-2xl:col-span-2">
            <CardHeader>
               <CardTitle>Загальний прибуток</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-neutral">
               {selectedMembers?.map((m) => (
                  <Stat key={m.user.id}>
                     <StatLabel>{m.user.name}</StatLabel>
                     <StatValue>{formatCurrency(29000)}</StatValue>
                  </Stat>
               ))}
            </CardContent>
         </Card>
      </section>
   )
}

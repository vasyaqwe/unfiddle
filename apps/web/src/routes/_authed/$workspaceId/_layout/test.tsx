import { trpc } from "@/trpc"
import { useMutation } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Button } from "@unfiddle/ui/components/button"
import { toast } from "sonner"

export const Route = createFileRoute("/_authed/$workspaceId/_layout/test")({
   component: TestComponent,
})

function TestComponent() {
   const orderMigration = useMutation(
      trpc.workspace.migrateOrdersToOrderItems.mutationOptions({
         onSuccess: (data) => {
            toast.success(data.message)
         },
         onError: (error) => {
            toast.error("Order migration failed", {
               description: error.message,
            })
         },
      }),
   )

   const procurementMigration = useMutation(
      trpc.workspace.migrateProcurementsToOrderItems.mutationOptions({
         onSuccess: (data) => {
            toast.success(data.message)
         },
         onError: (error) => {
            toast.error("Procurement migration failed", {
               description: error.message,
            })
         },
      }),
   )

   const handleOrderMigrate = () => {
      orderMigration.mutate()
   }

   const handleProcurementMigrate = () => {
      procurementMigration.mutate()
   }

   return (
      <div className="space-y-4 p-4">
         <h1 className="mb-4 font-bold text-xl">Migration Control</h1>

         <div className="rounded-lg border p-4">
            <h2 className="font-semibold text-lg">Step 1: Migrate Orders</h2>
            <p className="mb-2 text-gray-500 text-sm">
               This will create an 'order_item' for each existing order.
            </p>
            <Button
               onClick={handleOrderMigrate}
               disabled={orderMigration.isPending}
            >
               {orderMigration.isPending
                  ? "Migrating Orders..."
                  : "Run Order Migration"}
            </Button>
         </div>

         <div className="rounded-lg border p-4">
            <h2 className="font-semibold text-lg">
               Step 2: Migrate Procurements
            </h2>
            <p className="mb-2 text-gray-500 text-sm">
               This will link existing procurements to their new 'order_item'.
            </p>
            <Button
               onClick={handleProcurementMigrate}
               disabled={procurementMigration.isPending}
            >
               {procurementMigration.isPending
                  ? "Migrating Procurements..."
                  : "Run Procurement Migration"}
            </Button>
         </div>
      </div>
   )
}

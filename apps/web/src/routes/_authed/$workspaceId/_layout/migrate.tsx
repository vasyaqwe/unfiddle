import { trpc } from "@/trpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/_authed/$workspaceId/_layout/migrate")({
   component: RouteComponent,
});

function RouteComponent() {
   const [restoreData, setRestoreData] = useState("");
   const backupQuery = useQuery(trpc.workspace.backup.queryOptions());
   const restoreMutation = useMutation(trpc.workspace.restore.mutationOptions());

   const handleBackup = async () => {
      await backupQuery.refetch();
   };

   const handleCopy = () => {
      navigator.clipboard.writeText(JSON.stringify(backupQuery.data, null, 2));
   };

   const handleRestore = async () => {
      try {
         await restoreMutation.mutateAsync(JSON.parse(restoreData));
         alert("Restore successful!");
      } catch (error) {
         console.error(error);
         alert("Restore failed!");
      }
   };

   return (
      <div className="p-4">
         <h1 className="font-bold text-2xl">Migrate</h1>
         <div className="mt-4">
            <button
               className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
               onClick={handleBackup}
            >
               Backup
            </button>
            {backupQuery.data && (
               <div className="mt-4">
                  <h2 className="font-bold text-xl">Backup Data</h2>
                  <button
                     className="mt-2 rounded bg-gray-500 px-4 py-2 font-bold text-white hover:bg-gray-700"
                     onClick={handleCopy}
                  >
                     Copy to Clipboard
                  </button>
               </div>
            )}
         </div>
         <div className="mt-8">
            <h2 className="font-bold text-xl">Restore</h2>
            <textarea
               className="mt-2 h-64 w-full rounded border p-2"
               value={restoreData}
               onChange={(e) => setRestoreData(e.target.value)}
            />
            <button
               className="mt-2 rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700"
               onClick={handleRestore}
            >
               Restore
            </button>
         </div>
      </div>
   );
}

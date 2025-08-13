// src/server.ts
import { throttle } from "@tldraw/utils"
import { Server } from "partyserver"
import type { Connection } from "partyserver"
import { createTLSchema } from "tldraw"
import type { HistoryEntry, TLRecord, TLStoreSnapshot } from "tldraw"

export class Whiteboard extends Server {
   static override options = {
      hibernate: true,
   }

   records: Record<string, TLRecord> = {}
   readonly schema = createTLSchema()

   override async onStart(): Promise<void> {
      const snapshot = await this.ctx.storage.get<TLStoreSnapshot>("snapshot")
      if (!snapshot) return

      const migrationResult = this.schema.migrateStoreSnapshot(snapshot)
      if (migrationResult.type === "error") {
         throw new Error(migrationResult.reason)
      }

      this.records = migrationResult.value
   }

   persist = throttle(async () => {
      await this.ctx.storage.put("snapshot", {
         store: this.records,
         schema: this.schema.serialize(),
      })
   }, 1000)

   override onConnect(connection: Connection<unknown>) {
      connection.send(
         JSON.stringify({
            type: "init",
            snapshot: { store: this.records, schema: this.schema.serialize() },
         }),
      )
   }

   override async onMessage(
      sender: Connection<unknown>,
      message: string,
   ): Promise<void> {
      // Parse the message once
      const msg = JSON.parse(message) as
         | {
              clientId: string
              type: "update"
              updates: HistoryEntry<TLRecord>[]
           }
         | {
              clientId: string
              type: "recovery"
           }

      const schema = createTLSchema().serialize()

      switch (msg.type) {
         case "update": {
            try {
               for (const update of msg.updates) {
                  const {
                     changes: { added, updated, removed },
                  } = update
                  for (const record of Object.values(added)) {
                     this.records[record.id] = record
                  }
                  for (const [, to] of Object.values(updated)) {
                     this.records[to.id] = to
                  }
                  for (const record of Object.values(removed)) {
                     delete this.records[record.id]
                  }
               }
               this.broadcast(message, [sender.id])
               await this.persist()
            } catch (_err) {
               sender.send(
                  JSON.stringify({
                     type: "recovery",
                     snapshot: { store: this.records, schema },
                  }),
               )
            }
            break
         }
         case "recovery": {
            sender.send(
               JSON.stringify({
                  type: "recovery",
                  snapshot: { store: this.records, schema },
               }),
            )
            break
         }
      }
   }
}

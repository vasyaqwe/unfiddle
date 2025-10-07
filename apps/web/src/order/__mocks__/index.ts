import type { useOrder } from "@/order/hooks"
import { vi } from "vitest"

vi.mock("@/order/hooks", () => ({
   useOrder: vi.fn(
      () =>
         ({
            id: "mock",
            name: "mock",
            shortId: 1,
            workspaceId: "mock",
            currency: "UAH",
            sellingPrice: 1,
            status: "pending",
            severity: "low",
            vat: true,
            client: "mock",
            deliversAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            analogs: [],
            items: [
               {
                  id: "mock",
                  name: "mock",
                  quantity: 1,
                  desiredPrice: 1,
               },
            ],
            assignees: [],
            attachments: [],
            creator: {
               id: "mock",
               name: "mock",
               image: "mock",
            },
            creatorId: "mock",
            normalizedName: "mock",
            deletedAt: null,
            goodId: "mock",
            groupId: "mock",
            note: "mock",
         }) satisfies ReturnType<typeof useOrder>,
   ),
}))

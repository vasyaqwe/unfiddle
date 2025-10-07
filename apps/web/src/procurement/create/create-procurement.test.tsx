import "@/socket/__mocks__"
import "@/auth/__mocks__"
import "@/order/__mocks__"
import { createProcurementOpenAtom } from "@/procurement/store"
import { trpcMsw } from "@/tests/handlers"
import { TestProviders } from "@/tests/providers"
import { server } from "@/tests/server"
import { store } from "@/tests/store"
import { render, screen, within, waitFor } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { expect, vi } from "vitest"
import { CreateProcurement } from "./create-procurement"

describe("CreateProcurement form", () => {
   it("should create procurement", async () => {
      const user = userEvent.setup()
      const createProcurementSpy = vi.fn()

      server.use(
         trpcMsw.procurement.create.mutation(async (input) => {
            createProcurementSpy(input.input['0'].json)
            const orderItemId = input.input['0'].json.orderItemId ?? null
            if (!orderItemId) throw new Error("orderItemId is required")
            return {
               ...input.input['0'].json,
               id: "mock" as any,
               creatorId: "mock" as any,
               status: "pending" as const,
               note: input.input['0'].json.note ?? null,
               orderItemId,
               provider: input.input['0'].json.provider ?? null,
               attachments: [],
               createdAt: new Date(),
               updatedAt: new Date(),
            }
         }),
      )

      store.set(createProcurementOpenAtom, true)
      render(<CreateProcurement />, { wrapper: TestProviders })
      const popup = within(
         await screen.findByTestId("create-procurement-popup"),
      )
      await popup.findByText("Нова закупівля")

      await user.type(popup.getByLabelText("Кількість"), "10")
      await user.type(popup.getByLabelText("Ціна"), "123.45")
      await user.type(popup.getByLabelText("Постачальник"), "Test Provider")
      await user.type(popup.getByLabelText("Комент"), "Test comment")

      await user.click(popup.getByText("Додати"))

      await waitFor(() => {
         expect(
            screen.queryByTestId("create-procurement-popup"),
         ).not.toBeInTheDocument()
      })

      expect(createProcurementSpy).toHaveBeenCalledOnce()
      expect(createProcurementSpy).toHaveBeenCalledWith(
         expect.objectContaining({
            quantity: 10,
            purchasePrice: 123.45,
            provider: "Test Provider",
            note: "Test comment",
         }),
      )
   })
})

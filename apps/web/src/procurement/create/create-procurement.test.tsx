import "@/socket/__mocks__"
import "@/auth/__mocks__"
import "@/order/__mocks__"
import { createProcurementOpenAtom } from "@/procurement/store"
import { trpcMsw } from "@/tests/handlers"
import { TestProviders } from "@/tests/providers"
import { server } from "@/tests/server"
import { store } from "@/tests/store"
import { render, screen, within } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { CreateProcurement } from "./create-procurement"

describe("CreateProcurement form", () => {
   it("should create procurement", async () => {
      const user = userEvent.setup()

      server.use(
         trpcMsw.procurement.create.mutation((opts) => {
            const orderItemId = opts.input.orderItemId ?? null
            if (!orderItemId) throw new Error("orderItemId is required")
            return {
               ...opts.input,
               id: "mock" as any,
               creatorId: "mock" as any,
               status: "pending" as const,
               note: opts.input.note ?? null,
               orderItemId,
               provider: opts.input.provider ?? null,
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
   })
})

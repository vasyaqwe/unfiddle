import "@/socket/__mocks__"
import "@/auth/__mocks__"
import "@/order/__mocks__"
import { createProcurementOpenAtom } from "@/procurement/store"
import { trpcMsw } from "@/tests/handlers"
import { TestProviders } from "@/tests/providers"
import { server } from "@/tests/server"
import { store } from "@/tests/store"
import { render, screen, waitFor, within } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import type { RouterInput } from "@unfiddle/core/trpc/types"
import { expect, vi } from "vitest"
import { CreateProcurement } from "./create-procurement"

describe("CreateProcurement form", () => {
   it("should create procurement", async () => {
      const user = userEvent.setup()
      const spy = vi.fn()

      server.use(
         trpcMsw.procurement.create.mutation(async (opts) => {
            const input = ((opts.input as any)["0"] as any)
               .json as RouterInput["procurement"]["create"]
            spy(input)
            const orderItemId = input.orderItemId ?? null
            if (!orderItemId) throw new Error("orderItemId is required")
            return {
               ...input,
               id: "mock" as any,
               creatorId: "mock" as any,
               status: "pending" as const,
               note: input.note ?? null,
               orderItemId,
               provider: input.provider ?? null,
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

      await user.type(popup.getByLabelText("Кількість"), "1")
      await user.type(popup.getByLabelText("Ціна"), "1.1")
      await user.type(popup.getByLabelText("Постачальник"), "mock")
      await user.type(popup.getByLabelText("Комент"), "mock")

      await user.click(popup.getByText("Додати"))

      await waitFor(() => {
         expect(
            screen.queryByTestId("create-procurement-popup"),
         ).not.toBeInTheDocument()
      })

      expect(spy).toHaveBeenCalledOnce()
      expect(spy).toHaveBeenCalledWith(
         expect.objectContaining({
            orderItemId: "mock",
         }),
      )
   })
})

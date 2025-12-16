import "@/socket/__mocks__"
import "@/router/__mocks__"
import "@/auth/__mocks__"
import { createOrderOpenAtom } from "@/order/store"
import { trpcMsw } from "@/tests/handlers"
import { TestProviders } from "@/tests/providers"
import { server } from "@/tests/server"
import { store } from "@/tests/store"
import { render, screen, waitFor, within } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { CURRENCIES } from "@unfiddle/core/currency/constants"
import {
   ORDER_PAYMENT_TYPES,
   ORDER_PAYMENT_TYPES_TRANSLATION,
   ORDER_SEVERITIES,
   ORDER_SEVERITIES_TRANSLATION,
} from "@unfiddle/core/order/constants"
import type { RouterInput } from "@unfiddle/core/trpc/types"
import { expect } from "vitest"
import { CreateOrder } from "./create-order"

describe("CreateOrder form", () => {
   it("should manage order items and trash button states correctly", async () => {
      const user = userEvent.setup()

      store.set(createOrderOpenAtom, true)
      render(<CreateOrder />, { wrapper: TestProviders })
      await screen.findByText("Нове замовлення")

      expect(screen.getByTestId("trash-button")).toBeDisabled()

      await user.click(screen.getByRole("button", { name: "Додати товар" }))

      const trashButtons = screen.getAllByTestId("trash-button")
      expect(trashButtons).toHaveLength(2)
      for (const button of trashButtons) {
         expect(button).toBeEnabled()
      }

      await user.click(trashButtons[0]!)

      expect(screen.getByTestId("trash-button")).toBeDisabled()
   })
   it(
      "should create order",
      {
         timeout: 10000,
      },
      async () => {
         const user = userEvent.setup()

         server.use(
            trpcMsw.order.create.mutation((opts) => {
               const input = ((opts.input as any)["0"] as any)
                  .json as RouterInput["order"]["create"]
               return {
                  ...input,
                  id: "mock" as any,
                  creatorId: "mock" as any,
                  shortId: 1,
                  normalizedName: input.name.toLowerCase(),
                  items: input.items ?? [],
                  analogs: [],
               }
            }),
         )

         store.set(createOrderOpenAtom, true)
         render(<CreateOrder />, { wrapper: TestProviders })
         const popup = within(await screen.findByTestId("create-order-popup"))

         await user.type(popup.getByLabelText("Назва"), "mock")
         await user.click(popup.getByRole("combobox", { name: "Валюта" }))
         await user.click(
            await screen.findByRole("option", { name: CURRENCIES[0] }),
         )
         await user.type(popup.getByLabelText("Ціна продажу"), "1.1")
         await user.type(
            popup.getByLabelText("Термін постачання"),
            "2025-12-31",
         )

         await user.click(popup.getByRole("combobox", { name: "Пріоритет" }))
         await user.click(
            await screen.findByRole("option", {
               name: ORDER_SEVERITIES_TRANSLATION[ORDER_SEVERITIES[0]],
            }),
         )
         await user.click(
            popup.getByRole("combobox", { name: "Варіант оплати" }),
         )
         await user.click(
            await screen.findByRole("option", {
               name: ORDER_PAYMENT_TYPES_TRANSLATION[ORDER_PAYMENT_TYPES[0]],
            }),
         )

         await user.type(popup.getByLabelText("Комент"), "mock")

         await user.type(popup.getAllByTestId("order-item-name")[0]!, "mock")
         await user.type(popup.getAllByTestId("order-item-quantity")[0]!, "1")
         await user.type(popup.getAllByTestId("order-item-price")[0]!, "1.1")

         await user.click(popup.getByText("Додати"))

         await waitFor(() => {
            expect(
               screen.queryByTestId("create-order-popup"),
            ).not.toBeInTheDocument()
         })
      },
   )
})

import "@/socket/__mocks__"
import "@/auth/__mocks__"
import { createOrderOpenAtom } from "@/order/store"
import { trpcMsw } from "@/tests/handlers"
import { TestProviders } from "@/tests/providers"
import { server } from "@/tests/server"
import { store } from "@/tests/store"
import { render, screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { CURRENCIES } from "@unfiddle/core/currency/constants"
import {
   ORDER_SEVERITIES,
   ORDER_SEVERITIES_TRANSLATION,
} from "@unfiddle/core/order/constants"
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
            trpcMsw.order.create.mutation((opts) => ({
               ...opts.input,
               id: "mock" as any,
               creatorId: "mock" as any,
               shortId: 1,
               normalizedName: opts.input.name.toLowerCase(),
               items: opts.input.items ?? [],
               analogs: [],
            })),
         )

         store.set(createOrderOpenAtom, true)
         render(<CreateOrder />, { wrapper: TestProviders })
         await screen.findByText("Нове замовлення")

         await user.type(screen.getByLabelText("Назва"), "Test Project Alpha")
         await user.click(screen.getByRole("combobox", { name: "Валюта" }))
         await user.click(
            await screen.findByRole("option", { name: CURRENCIES[0] }),
         )
         await user.type(screen.getByLabelText("Ціна продажу"), "1234.56")

         await user.type(screen.getByLabelText("Клієнт"), "Acme Corp.")

         await user.click(screen.getByRole("combobox", { name: "Пріоритет" }))
         await user.click(
            await screen.findByRole("option", {
               name: ORDER_SEVERITIES_TRANSLATION[ORDER_SEVERITIES[0]],
            }),
         )

         await user.type(
            screen.getByLabelText("Термін постачання"),
            "2025-12-31",
         )

         await user.type(
            screen.getByLabelText("Комент"),
            "Needs express delivery.",
         )

         await user.click(screen.getByLabelText("З ПДВ"))

         await user.type(
            screen.getAllByTestId("order-item-name")[0]!,
            "Product",
         )
         await user.type(screen.getAllByTestId("order-item-quantity")[0]!, "10")
         await user.type(screen.getAllByTestId("order-item-price")[0]!, "99.99")

         await user.click(screen.getByText("Додати"))
      },
   )
})

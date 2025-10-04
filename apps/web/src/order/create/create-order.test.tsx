import { createOrderOpenAtom } from "@/order/store"
import { trpcMsw } from "@/tests/handlers"
import { TestProviders } from "@/tests/providers"
import { server } from "@/tests/server"
import { store } from "@/tests/store"
import {
   render,
   screen,
   waitForElementToBeRemoved,
} from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { CURRENCIES } from "@unfiddle/core/currency/constants"
import {
   ORDER_SEVERITIES,
   ORDER_SEVERITIES_TRANSLATION,
} from "@unfiddle/core/order/constants"
import { CreateOrder } from "./create-order"

test(
   "creates order",
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

      await user.type(screen.getByLabelText("Термін постачання"), "2025-12-31")

      await user.type(
         screen.getByLabelText("Комент"),
         "Needs express delivery.",
      )

      await user.click(screen.getByLabelText("З ПДВ"))

      const trashButtons = screen.getAllByTestId("trash-button")
      expect(trashButtons[0]).toBeDisabled()

      await user.click(screen.getByText("Додати товар"))

      const updatedTrashButtons = screen.getAllByTestId("trash-button")

      expect(updatedTrashButtons[0]).toBeEnabled()
      expect(updatedTrashButtons[1]).toBeEnabled()

      const itemInputs = screen.getAllByTestId("order-item-name")
      await user.type(itemInputs[0]!, "Product")
      await user.type(itemInputs[1]!, "Product")
      const allQuantityInputs = screen.getAllByTestId("order-item-quantity")
      await user.type(allQuantityInputs[0]!, "10")
      await user.type(allQuantityInputs[1]!, "10")
      const allPriceInputs = screen.getAllByTestId("order-item-price")
      await user.type(allPriceInputs[0]!, "99.99")
      await user.type(allPriceInputs[1]!, "99.99")

      await user.click(screen.getByText("Додати"))
      await waitForElementToBeRemoved(() =>
         screen.queryByText("Нове замовлення"),
      )
   },
)

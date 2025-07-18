import { CURRENCY_SYMBOLS } from "@unfiddle/core/currency/constants"

export const formatCurrency = (
   price: number,
   options: Intl.NumberFormatOptions = {},
) => {
   const formattedPrice = new Intl.NumberFormat("uk-UA", {
      style: "currency",
      currency: options.currency ?? "UAH",
      notation: options.notation ?? "standard",
      currencyDisplay: "code",
      ...options,
   })
      .format(Number(price))
      .replace(",00", "")
      .replaceAll(",", ".")

   const currencyCode = options.currency ?? "UAH"
   const symbol = CURRENCY_SYMBOLS[currencyCode as never] ?? currencyCode

   return `${formattedPrice.replace(currencyCode, "").trim()} ${symbol}`
}

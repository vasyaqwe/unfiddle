export const formatCurrency = (
   price: number,
   options: Intl.NumberFormatOptions = {},
) => {
   return new Intl.NumberFormat("uk-UA", {
      style: "currency",
      currency: options.currency ?? "UAH",
      notation: options.notation ?? "standard",
      ...options,
   })
      .format(Number(price))
      .replace(",00", "")
      .replaceAll(",", ".")
}

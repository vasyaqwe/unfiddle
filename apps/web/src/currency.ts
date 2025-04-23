export const formatCurrency = (
   price: number,
   options: Intl.NumberFormatOptions = {},
) => {
   return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: options.currency ?? "USD",
      notation: options.notation ?? "compact",
      ...options,
   }).format(Number(price))
}

export const formatNumber = (
   number: number,
   options: Intl.NumberFormatOptions = {},
) => {
   return new Intl.NumberFormat("uk-UA", {
      notation: options.notation ?? "standard",
      ...options,
   }).format(Number(number))
}

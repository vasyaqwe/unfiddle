import { CURRENCIES } from "@unfiddle/core/currency/constants"
import { tryCatch } from "@unfiddle/core/try-catch"

const getExchangeRatesFromKV = async (
   KV: KVNamespace,
   baseCurrency: string,
) => {
   const { data } = await tryCatch(KV.get(`exchange_rates_${baseCurrency}`))
   if (!data) return null

   return JSON.parse(data) as { [key: string]: number }
}

const getExchangeRatesFromApi = async (baseCurrency: string) => {
   const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`,
   )
   if (!response.ok) return null

   const data = (await response.json()) as { rates: { [key: string]: number } }
   return data.rates
}

const storeExchangeRatesInKV = async (
   KV: KVNamespace,
   baseCurrency: string,
   rates: { [key: string]: number },
) => {
   const filteredRates = Object.fromEntries(
      Object.entries(rates).filter(([currency]) =>
         CURRENCIES.includes(currency as (typeof CURRENCIES)[number]),
      ),
   )

   await tryCatch(
      KV.put(`exchange_rates_${baseCurrency}`, JSON.stringify(filteredRates), {
         expirationTtl: 4 * 60 * 60, // 4 hours
      }),
   )
}

export const getExchangeRates = async (
   KV: KVNamespace,
   baseCurrency: string,
) => {
   const cachedRates = await getExchangeRatesFromKV(KV, baseCurrency)
   if (cachedRates) return cachedRates

   const apiRates = await getExchangeRatesFromApi(baseCurrency)
   if (!apiRates) return null

   await storeExchangeRatesInKV(KV, baseCurrency, apiRates)

   return apiRates
}

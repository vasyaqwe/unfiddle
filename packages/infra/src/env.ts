const API_URL = {
   development: "http://localhost:8787",
   production: "https://api.unfiddle.com",
}

export const clientEnv = {
   development: {
      API_URL: API_URL.development,
      WEB_URL: "http://localhost:3000",
      COLLABORATION_URL: "unfiddle.vasyaqwe.partykit.dev",
      STORAGE_URL: `${API_URL.development}/r2`,
      CLOUDFLARE_ACCOUNT_ID: "bfef1e994f1aac7e7a42dc4ba75197a0",
      CLOUDFLARE_DATABASE_ID: "0c2d4aab-cf2f-4c14-aa7e-89f11ef8daee",
   },
   production: {
      API_URL: API_URL.production,
      WEB_URL: "https://unfiddle.com",
      COLLABORATION_URL: "unfiddle.vasyaqwe.partykit.dev",
      STORAGE_URL: "https://pub-895ae2cc585140758f6a1aea105c66e5.r2.dev",
      CLOUDFLARE_ACCOUNT_ID: "bfef1e994f1aac7e7a42dc4ba75197a0",
      CLOUDFLARE_DATABASE_ID: "0c2d4aab-cf2f-4c14-aa7e-89f11ef8daee",
   },
} as const

type Environment = "production" | "development"

export type ApiEnv = {
   ENVIRONMENT: Environment
   GOOGLE_CLIENT_ID: string
   GOOGLE_CLIENT_SECRET: string
   RATE_LIMITER: RateLimit
   KV: KVNamespace
   DATABASE: D1Database
   BETTER_AUTH_SECRET: string
   BUCKET: R2Bucket
}

export type ClientEnv = (typeof clientEnv)[Environment]

export type Env = ApiEnv & ClientEnv

const API_URL = {
   development: "http://localhost:8787",
   production: "https://unfiddle-api.vasylpolishchuk22.workers.dev",
   // production: "https://api.unfiddle.com",
}

export const clientEnv = {
   development: {
      API_URL: API_URL.development,
      WEB_URL: "http://localhost:3000",
      STORAGE_URL: `${API_URL.development}/r2`,
      CLOUDFLARE_ACCOUNT_ID: "bfef1e994f1aac7e7a42dc4ba75197a0",
      CLOUDFLARE_DATABASE_ID: "84c23660-f3ee-410d-b7eb-5b5bf25978ea",
   },
   production: {
      API_URL: API_URL.production,
      WEB_URL: "https://app.unfiddle.com",
      STORAGE_URL: "",
      CLOUDFLARE_ACCOUNT_ID: "bfef1e994f1aac7e7a42dc4ba75197a0",
      CLOUDFLARE_DATABASE_ID: "84c23660-f3ee-410d-b7eb-5b5bf25978ea",
   },
} as const

type Environment = "production" | "development"

export type ApiEnv = {
   ENVIRONMENT: Environment
   GOOGLE_CLIENT_ID: string
   GOOGLE_CLIENT_SECRET: string
   RATE_LIMITER: RateLimit
   UNFIDDLE_KV: KVNamespace
   DATABASE: D1Database
   BETTER_AUTH_SECRET: string
}

export type ClientEnv = (typeof clientEnv)[Environment]

export type Env = ApiEnv & ClientEnv

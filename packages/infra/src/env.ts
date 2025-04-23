const API_URL = {
   development: "http://localhost:8787",
   production: "https://api.unfiddle.com",
}

export const clientEnv = {
   development: {
      API_URL: API_URL.development,
      WEB_URL: "http://localhost:3000",
      STORAGE_URL: `${API_URL.development}/r2`,
      DATABASE_URL: "http://127.0.0.1:8080",
      CLOUDFLARE_ACCOUNT_ID: "5094cfe311accd47a9b121ba2cf70631",
   },
   production: {
      API_URL: API_URL.production,
      WEB_URL: "https://app.unfiddle.com",
      STORAGE_URL: "",
      DATABASE_URL: "libsql://unfiddle-db-vasyaqwe.aws-us-east-1.turso.io",
      CLOUDFLARE_ACCOUNT_ID: "5094cfe311accd47a9b121ba2cf70631",
   },
} as const

type Environment = "production" | "development"

export type ApiEnv = {
   ENVIRONMENT: Environment
   DATABASE_AUTH_TOKEN: string
   GOOGLE_CLIENT_ID: string
   GOOGLE_CLIENT_SECRET: string
   RATE_LIMITER: RateLimit
   UNFIDDLE_KV: KVNamespace
}

export type ClientEnv = (typeof clientEnv)[Environment]

export type Env = ApiEnv & ClientEnv

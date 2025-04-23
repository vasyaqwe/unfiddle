import { clientEnv } from "@unfiddle/infra/env"

const metaEnv = import.meta.env

export const env = {
   ...metaEnv,
   ...clientEnv[metaEnv.MODE as "development" | "production"],
}

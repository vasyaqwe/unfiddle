import { sentryVitePlugin } from "@sentry/vite-plugin"
import tailwindcss from "@tailwindcss/vite"
import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
   process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }

   return {
      plugins: [
         sentryVitePlugin({
            authToken: process.env.SENTRY_AUTH_TOKEN,
            org: "unfiddle",
            project: "unfiddle-web",
         }),
         TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
         react({
            babel: {
               plugins: [["babel-plugin-react-compiler", {}]],
            },
         }),
         tailwindcss(),
         tsconfigPaths(),
      ],
      build: {
         sourcemap: true,
      },
      preview: {
         port: 3000,
      },
      server: {
         port: 3000,
      },
      define: {
         "process.env": {},
      },
   }
})

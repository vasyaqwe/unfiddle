import c from "ansi-colors"

type Method = "info" | "warn" | "error" | "trpcError" | "success" | "loading"

const production = process.env.ENVIRONMENT === "production"

const prefixes: Record<Method, string> = {
   info: production ? "[INFO]" : c.white("[INFO]"),
   warn: production ? "[WARN]" : c.yellow("[WARN]"),
   error: production ? "[ERROR]" : c.red("[ERROR]"),
   trpcError: production ? "[TRPC_ERROR]" : c.redBright("[TRPC_ERROR]"),
   success: production ? "[SUCCESS]" : c.green("[SUCCESS]"),
   loading: production ? "[LOADING]" : c.magenta("[LOADING]"),
}

const methods: Record<Method, "log" | "error"> = {
   info: "log",
   warn: "error",
   error: "error",
   trpcError: "error",
   success: "log",
   loading: "log",
}

const loggerFactory = (method: Method) => {
   return (...message: unknown[]) => {
      const consoleLogger = console[methods[method]]
      const prefix = `${production ? "[LOG]" : c.blueBright.bold(" [LOG] ")}${prefixes[method]}`

      consoleLogger(prefix, ...message)
   }
}

export const logger: Record<Method, (...message: unknown[]) => void> = {
   info: loggerFactory("info"),
   warn: loggerFactory("warn"),
   error: loggerFactory("error"),
   trpcError: loggerFactory("trpcError"),
   success: loggerFactory("success"),
   loading: loggerFactory("loading"),
}

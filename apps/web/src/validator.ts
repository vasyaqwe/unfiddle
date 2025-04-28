import type { ValidatorAdapter } from "@tanstack/react-router"

export interface ZodTypeLike {
   // biome-ignore lint/suspicious/noExplicitAny: <explanation>
   _input: any
   // biome-ignore lint/suspicious/noExplicitAny: <explanation>
   _output: any
   // biome-ignore lint/suspicious/noExplicitAny: <explanation>
   parse: (input: any) => any
}

export type InputOutputOption = "input" | "output"

export interface zodValidatorOptions {
   readonly schema: ZodTypeLike
   readonly input?: InputOutputOption
   readonly output?: InputOutputOption
}

export type zodValidatorInput<
   TOptions extends ZodTypeLike | zodValidatorOptions,
> = TOptions extends zodValidatorOptions
   ? "input" extends TOptions["input"]
      ? TOptions["schema"]["_input"]
      : TOptions["schema"]["_output"]
   : TOptions extends ZodTypeLike
     ? TOptions["_input"]
     : never

export type zodValidatorOutput<
   TOptions extends ZodTypeLike | zodValidatorOptions,
> = TOptions extends zodValidatorOptions
   ? "output" extends TOptions["output"]
      ? TOptions["schema"]["_output"]
      : TOptions["schema"]["_input"]
   : TOptions extends ZodTypeLike
     ? TOptions["_output"]
     : never

export type zodValidatorAdapter<
   TOptions extends ZodTypeLike | zodValidatorOptions,
> = ValidatorAdapter<zodValidatorInput<TOptions>, zodValidatorOutput<TOptions>>

export const validator = <TOptions extends ZodTypeLike | zodValidatorOptions>(
   options: TOptions,
): zodValidatorAdapter<TOptions> => {
   const input = "input" in options ? options.input : "input"
   const output = "output" in options ? options.output : "output"
   const _input = "schema" in options ? options.schema._input : options._input
   const _output =
      "schema" in options ? options.schema._output : options._output
   return {
      types: {
         input: input === "output" ? _output : _input,
         output: output === "input" ? _input : _output,
      },
      parse: (input) =>
         "schema" in options
            ? options.schema.parse(input)
            : options.parse(input),
   }
}

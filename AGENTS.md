# Agent Guidelines for Unfiddle

## Build/Test Commands
- **Build**: `bun run build` (all), `bun run build:web` (web only)
- **Dev**: `bun run dev` (all), `bun run dev:web` (web+api), `bun run dev:api` (api only)
- **Lint/Format**: `bun run format-lint:fix` (auto-fix), `bun run format-lint` (check only)
- **Typecheck**: `bun run typecheck` (all packages)

## Code Style (Biome Config)
- **Indentation**: 3 spaces, no tabs
- **Line width**: 80 characters
- **Quotes**: Double quotes for JS/TS, JSX attributes multiline
- **Semicolons**: As needed (ASI)
- **Trailing commas**: Always
- **Arrow functions**: Always use parentheses
- **Imports**: Auto-organized, no unused imports/variables

## Conventions
- **Package manager**: Bun (not npm/yarn)
- **Monorepo**: Turbo with workspaces in `apps/*`, `packages/*`, `tooling/*`
- **Types**: Strict TypeScript, use `type` for object shapes, `interface` for extensible contracts
- **Imports**: Use workspace aliases (`@unfiddle/core`, `@unfiddle/ui`), relative for same package
- **Components**: React 19 with hooks, use `cx()` from `@unfiddle/ui/utils` for className merging
- **Error handling**: Use tRPC for API errors, Sentry for client errors
- **State**: Jotai for global state, TanStack Query for server state
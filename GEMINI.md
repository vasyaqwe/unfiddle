Guidelines

## Commit message style 
- use present tense, short, casual, lowercased wording, e.g. "upd ios env to production"

## Code structure
- organize by domain, e.g. auth/index.ts auth/types.ts
- place reusable things in packages/core
- place app specific things in their corresponding apps/[app name]

## Convex functions 
- place in domains like user/functions.ts and then export in convex, e.g.: 
// convex/user.ts
export * from "../user/functions"
- for authed functions, use the custom authedQuery/authedMutation, for anything else, check the sibling middleware.ts, if there is an appropriate custom function

## General conventions
- do not use semicolons
- for React hooks and components, use function syntax, for every other function, use arrow syntax
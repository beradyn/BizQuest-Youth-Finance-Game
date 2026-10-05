# BizQuest

BizQuest is a playful financial-literacy and entrepreneurship game for ages 5–17, built by a team for a competition.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/bizquest` — Expo mobile game and brand assets
- `artifacts/bizquest/constants/game-content.ts` — venture types, learning quests, and avatar choices
- `artifacts/bizquest/providers/GameProvider.tsx` — player progress and local persistence
- `artifacts/bizquest/constants/colors.ts` — BizQuest color palette

## Architecture decisions

- Business funding uses practice-only Biz Bucks; it is not connected to real money.
- Player progress is stored on-device so the first version works without accounts or a server.

## Product

- Players choose a small business, manage product stock and practice cash, adjust prices, make sales, and move money into savings.
- Short decision quests teach budgeting, saving, costs, and profit; XP, Biz Points, and badges reward progress.
- Players can customize a procedural founder avatar with skin tone, hair, outfit, and accessories.
- Branding centers on a gold compass coin; the visual direction is energetic, warm, and kid-friendly.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

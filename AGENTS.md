# Repository Guidelines

## Project Structure & Module Organization
- `app/[locale]/` hosts locale-specific routes and dashboards, with auth flows under `app/auth/`.
- `components/` houses shared UI, while `hooks/`, `lib/`, and `providers/` group reusable logic and context wiring.
- Localization assets live in `messages/` with shared setup in `i18n.ts`; align message keys across locales.
- Static assets belong in `public/`, global styles in `styles/`, and Tailwind tokens in `tailwind.config.ts`.
- Supabase configuration, SQL migrations, and Edge functions reside in `supabase/`; update these alongside backend changes.

## Build, Test, and Development Commands
- `npm run dev` — start the Next.js dev server (defaults to http://localhost:3000) with locale-aware routing.
- `npm run build` — generate a production build; fails on type or lint errors.
- `npm run start` — serve the built app; run only after a successful `build`.
- `npm run lint` — execute ESLint with the `next/core-web-vitals` ruleset.
- `npm run format` — apply Prettier with the Tailwind plugin across the workspace.

## Coding Style & Naming Conventions
- TypeScript/TSX with Prettier-managed 2-space indentation; avoid manual formatting tweaks.
- Name components and providers in PascalCase (`UploadPanel.tsx`), hooks in camelCase with a `use` prefix, and utilities in descriptive kebab or camel case (`lib/supabaseClient.ts`).
- Keep server actions under `app/api/...`, favor Tailwind class composition over bespoke CSS, and run Prettier plus ESLint before committing.

## Testing Guidelines
- Automated tests are not configured yet; always run `npm run lint` and `npm run build` before submitting changes.
- Manually smoke-test asset upload flows, locale switching, and Supabase authentication in local dev.
- When adding automated tests, colocate them with the subject file (e.g., `Component.test.tsx`) and register the script in `package.json`.

## Commit & Pull Request Guidelines
- Keep commit subjects short, present-tense, and descriptive, matching recent history; add bilingual context only when it improves clarity.
- Use optional scope prefixes (`components:`, `supabase:`) and squash fixups, then open PRs with intent, notable changes, and manual QA steps.
- Attach UI screenshots for visual tweaks, reference Supabase migrations, and confirm `npm run build` before requesting review.

## Security & Configuration Tips
- Store secrets in `.env.local` and never commit real API keys; add `.env.example` entries for new variables.
- Coordinate Supabase updates through `supabase/sql` and `supabase/functions` so reviewers can apply migrations and redeploy Edge functions.

---
tags: ['pellito-hub', 'design', 'prd']
status: draft
last_updated: 2026-04-28
---

# Pellito Hub — Product Requirements Document

## Problem Statement

The restaurant kitchen I was working in is doubling its staff with seasonal hires — mostly college students with little to no kitchen experience. Their current training material is a single binder of recipes printed in tiny font. Hires can't read the binder on the line, can't take it home to study, and can't use it to test their own knowledge. The Training Manager re-explains the same recipes every season, and during shift, bilingual managers become the translation bottleneck for Spanish-speaking staff. The Training Manager has no visibility into which recipes new hires actually struggle with, so coaching is reactive instead of targeted.

There is no Pellito Hub deployment live anywhere today; the previous scaffolds were never seeded with real recipes and have been archived.

## Solution

A mobile-first, role-filtered recipe and self-quiz web app that replaces the binder. Staff log in on their phone with shared role credentials, browse menu item recipes with readable layout, take auto-generated 5-question quizzes (with optional 3-question hard follow-ups), and ask Pellito — a Mastra-powered "deckhand" agent in the restaurant's coastal branding — questions about a recipe. Spanish translations of UI and recipe content land at V2. The Training Manager logs in to a separate admin view with a dashboard of anonymous aggregate metrics (most-missed questions, quiz completion, active sessions) and edits recipes inline with instant publish.

The app is built in 5 stages — Prototype → V1 → V2 → V3 → MVP — on the dev domain `pellito.mechanicalcupcakes.fun`, with stable cuts copied to `pellito.ernestofgaia.xyz` for the employer pitch starting at V2.

## User Stories

1. As a seasonal Line Cook hire, I want to log in on my phone with a shared role credential, so that I don't need to manage another account.
2. As a Line Cook, I want to browse a list of all menu item recipes, so that I can find the one I need before service.
3. As a Line Cook, I want to search recipes by name, so that I can find one quickly when called.
4. As a Line Cook, I want each recipe rendered in a readable mobile layout, so that I can use it on the line without squinting at the binder.
5. As a Line Cook, I want to take a 5-question quiz on a recipe I just read, so that I can self-test my knowledge.
6. As a Line Cook, I want to choose between Easy and Difficult quiz mode, so that I can match the difficulty to my current confidence.
7. As a Line Cook, I want to be offered 3 hard follow-up questions after passing 5 easy ones, so that I can level up without restarting.
8. As a Line Cook, I want to see which questions I got wrong at the end of a quiz, so that I learn from my mistakes.
9. As a Line Cook, I want to ask Pellito a natural-language question about a recipe ("how long do I sear the salmon?"), so that I get a focused answer faster than re-reading the recipe.
10. As a Line Cook, I want to log out at end of shift, so that the next person on the device starts a clean session.
11. As a Spanish-speaking Line Cook (V2), I want a language toggle that flips both the app UI and the recipe content into Spanish, so that I can train without needing a bilingual manager.
12. As a Spanish-speaking Line Cook (V2), I want quizzes presented in Spanish, so that I'm tested in my own language.
13. As a Line Cook (V3), I want to navigate by voice and have Pellito read recipe steps aloud, so that I can keep my hands clean and free during prep.
14. As a Training Manager, I want to log in with the `admin` shared credential, so that the line cook view and the admin view stay separated.
15. As a Training Manager, I want to see total quiz attempts over the rolling 7- and 30-day windows, so that I know how much the app is being used.
16. As a Training Manager, I want to see the top 5 most-missed quiz questions, so that I know what to coach next.
17. As a Training Manager, I want to see most-viewed recipes, so that I can tell which dishes the team is studying most.
18. As a Training Manager, I want to see active sessions per day, so that I can spot patterns in when the team is using the app.
19. As a Training Manager, I want to see average quiz score, so that I have a single trendline to share with leadership.
20. As a Training Manager, I want to edit a recipe inline (title, ingredients, steps, allergens, notes) and have the change visible to Line Cooks immediately, so that I can correct mistakes without a deploy.
21. As a Training Manager, I want to add a new recipe without uploading an image, so that I can capture menu changes typed directly.
22. As a Training Manager, I want to delete or archive a recipe, so that retired menu items don't pollute training.
23. As a Training Manager, I want recipe edits to publish instantly with no draft step, so that the workflow stays one click.
24. As a Training Manager (V1), I want to bulk-import recipes via CSV, so that I can seed the app from the scrape spreadsheet without typing 24 recipes.
25. As a Training Manager (V2), I want to enter Spanish translations for each recipe field, so that the bilingual experience is faithful to my menu language rather than machine-translated.
26. As a Training Manager (V2), I want to edit auto-generated quiz question text, so that I can fix awkward phrasing while keeping auto-gen for new questions.
27. As Ernest (developer), I want anonymous-only analytics, so that staff trust the app and there's no PII liability.
28. As Ernest (developer), I want shared role credentials (`linecook`/`linecook`, `admin`/`admin`), so that onboarding a new hire takes zero account-management work.
29. As Ernest (developer), I want a Drizzle schema ported from the archived Prisma model, so that the data model isn't designed from scratch and the schema work already done isn't lost.
30. As Ernest (developer), I want SQLite for the prototype, so that I can iterate locally without standing up Postgres.
31. As Ernest (developer), I want to migrate to Postgres at V1, so that the dashboard queries and ingestion run on production-grade infrastructure.
32. As Ernest (developer), I want Mastra in the codebase from the prototype on, so that I don't have to refactor when the agent surface grows in V3.
33. As Ernest (developer), I want the prototype agent to inject recipes directly into context (no RAG), so that I avoid the cost and complexity of embeddings while the corpus is small.
34. As Ernest (developer), I want to graduate to RAG at V2 (Voyage AI + brain.json) per my Mastra preflight pattern, so that the language and content scaling don't blow the token budget.
35. As Ernest (developer), I want to deploy the prototype to `pellito.mechanicalcupcakes.fun` as soon as the core loop runs locally, so that the app is live on the VPS quickly even before V1 features are complete.
36. As Ernest (developer), I want to copy stable cuts of V2/V3/MVP to `pellito.ernestofgaia.xyz` manually, so that the employer pitch URL stays unaffected by dev iteration on the mechanicalcupcakes.fun domain.
37. As Ernest (developer), I want a Quiz Generator I can unit-test in isolation, so that quiz quality is verifiable without standing up the full app.
38. As Ernest (developer), I want a Recipe Importer I can unit-test in isolation, so that CSV format changes don't silently corrupt seed data.
39. As Ernest (developer), I want a Dashboard Metrics aggregator I can unit-test against an in-memory DB, so that I trust the metric tiles without manual DB poking.
40. As Ernest (developer), I want a Session Tracker module I can unit-test, so that anonymous session counting is verifiable.
41. As Ernest (developer), I want a stable Recipe Repository interface, so that the SQLite → Postgres migration at V1 doesn't ripple through the codebase.
42. As Ernest (developer), I want the Pellito Agent's tool surface to grow without breaking callers, so that prototype context-injection and V2 RAG share the same `searchRecipes` tool name.
43. As Ernest (developer), I want a single `/api/health` endpoint returning 200, so that the NPM reverse proxy and uptime checks have a stable target.
44. As Ernest (developer), I want all secrets in `.env` (never committed), so that the VPS deploy path matches the rest of the EoG project standards.
45. As the restaurant owner watching the pitch (V2 demo), I want to see English/Spanish flip live on a phone with a real menu item, so that I believe the bilingual claim.
46. As Ernest (developer), I want the old archived prototype deleted only after V2 ships green, so that I can borrow patterns from it without risk during prototype/V1.
47. As Ernest (developer), I want the new build to live in `websites/Pellito Hub/pellito-hub/`, so that the codebase is clearly separated from archived attempts.
48. As Ernest (developer), I want the Mastra agent prompted as "Pellito the Deckhand" with the restaurant's nautical/coastal voice, so that branding is consistent end-to-end.

## Implementation Decisions

### Modules

The build decomposes into seven deep modules and several shallow surfaces:

**Deep modules (stable interfaces, testable in isolation):**

- **Quiz Generator** — pure function `(recipe, difficulty) → Question[]`. Generates easy/hard multiple-choice questions from structured recipe fields. Picks distractors from sibling recipes. No DB or network calls. Drives stories 5–8, 26.
- **Recipe Importer** — `(csvText) → ImportResult`. Parses CSV → validates `RecipeInput[]` → upserts via Recipe Repository. Drives story 24.
- **Dashboard Metrics** — `(timeWindow) → MetricTiles`. Aggregation queries returning the five dashboard tiles. Extending metrics adds fields to the return type rather than changing callers. Drives stories 15–19.
- **Session Tracker** — `start(role)` / `end(sessionId)` / `activeSessions(window)`. Manages anonymous `RoleSession` records (role + start/end only, no PII). Drives stories 18, 27.
- **Recipe Repository** — `getRecipe`, `listRecipes(filter)`, `upsertRecipe`, `deleteRecipe`. Hides the SQLite (prototype) → Postgres (V1) switch behind a stable interface. Drives stories 2, 3, 20–23, 41.
- **Pellito Agent** — Mastra `Agent` with stage-progressive tools: `getRecipe(name)` (prototype), `searchRecipes(query)` (V2 RAG-backed). Tool names stay stable across stages so callers don't change when the implementation swaps from context-injection to RAG. Claude Haiku 4.5 default. Drives stories 9, 11, 12, 13, 32–34, 42, 48.
- **Brain Builder (V2+)** — `(recipes) → brain.json`. Voyage AI `voyage-3-lite` embed pipeline producing the in-memory JSON brain per the Mastra preflight pattern. Drives story 34.

**Shallow surfaces (not worth deep abstraction; tested via manual walkthrough):**

- **Auth/Session** — one cookie, two valid shared credentials. Login route validates, sets a signed cookie with the role; logout clears it. Middleware gates `/admin/*` to admin role.
- **i18n (V2)** — string-bundle lookup keyed by language code; recipes carry parallel Spanish fields (or a `translations` JSON column — finalized at scrape time per `design/03-data-model.md`).
- **API routes** — thin glue between UI and the deep modules. No business logic in routes.
- **React UI components** — Line Cook screens (login, recipe list, recipe detail, quiz) and Manager screens (dashboard, recipe editor, CSV import). Mobile-first via Tailwind. Component patterns, color tokens, and canonical top bar spec are in `design/07-design-system.md`. Screen routes and interaction flows are in `design/06-ux-flows.md`.

### Schema

Ported from the archived Prisma prototype's `schema.prisma` to Drizzle, with these changes:

- Drop `Scrapbook` (no in-app vision ingest in this build)
- Drop "Russian" from any language enum/check; only "English" / "Spanish"
- Status values stay: `draft` | `published` | `archived`
- The exact shape of `ingredients` / `prep_steps` / `cook_steps` (string array vs. structured object) is finalized in `design/03-data-model.md` once the scrape session completes

### API contracts (high-level)

- `POST /api/auth/login` — `{ username, password }` → sets role cookie
- `POST /api/auth/logout` — clears cookie
- `GET /api/health` — returns 200 for NPM/uptime
- `GET /api/recipes` — list, filter by status/role
- `GET /api/recipes/:id` — single recipe (in selected language at V2+)
- `POST /api/recipes` / `PATCH /api/recipes/:id` / `DELETE /api/recipes/:id` — admin-only
- `POST /api/recipes/import-csv` — admin-only, body is CSV text
- `POST /api/quiz` — `{ recipeId, difficulty }` → `Question[]`
- `POST /api/quiz/attempt` — logs missed questions (no user identity)
- `GET /api/admin/stats` — admin-only, returns dashboard tiles for a time window
- `POST /api/chat` — regex-routes to the Pellito agent, streams response
- `POST /api/admin/ingest-brain` (V2+) — rebuilds `brain.json` after recipe edits

### Architectural decisions

- **Stack:** Next.js (App Router) + TypeScript + Tailwind + Mastra + Drizzle ORM. Claude Haiku 4.5 default agent model. Voyage `voyage-3-lite` embeddings (V2+). Per `MASTRA_SDK_PREFLIGHT.md`.
- **Routing inside `/api/chat`:** regex/keyword classifier, not LLM, per the preflight rule "Routing is regex, not LLM."
- **Tool design:** tools are dumb (fetch/search/return); reasoning lives in the agent.
- **Recipes static at build time?** No — Manager edits publish instantly. At V2 the brain is rebuildable on demand (admin button or auto-rebuild on save). This intentionally diverges from the preflight's "Knowledge is static at build time" line for this app's editing UX.
- **Session model:** anonymous `RoleSession` records only. No per-user accounts at any stage. If individual tracking is ever requested it becomes a paid scope item, not a default.
- **Edit model:** instant publish, no draft. Single-Manager content team makes draft/publish unnecessary at this stage.
- **Stage-based deploy:** Prototype runs locally; as soon as the core loop works it Dockerizes and deploys to `pellito.mechanicalcupcakes.fun`. V1+ continues there. V2/V3/MVP green cuts get manually copied to `pellito.ernestofgaia.xyz`.
- **VPS deploy pattern** per `DEPLOYMENT_STANDARDS & VPS Tips.md`: Hostinger VPS, Docker, Nginx Proxy Manager, container hostname matches NPM target, internal Docker network, no host port mapping.

### Borrow list from the archived Prisma prototype

Per the archived prototype's README and `ops/archive-cleanup.md`:

1. Prisma schema → port to Drizzle
2. Auth middleware + login/logout route shape
3. Mastra agent system-prompt direction ("coastal mascot")
4. View component layout shells (strip placeholder copy)
5. Client branding strings (menu-item names, house drinks, etc.)
6. Admin stats route shape
7. Health endpoint

No actual recipe data exists in the archive; the 24 recipes still come from the upcoming scrape session.

## Testing Decisions

### What makes a good test (for this project)

- **Test external behavior, not implementation details.** A test should still pass after refactoring the inside of a module as long as the module's interface and contract didn't change.
- **Prefer pure-function tests on deep modules.** The Quiz Generator, Recipe Importer, and Dashboard Metrics aggregator all reduce to inputs → outputs and don't need a running server.
- **Use in-memory SQLite for repository-level tests.** No Docker, no Postgres, runs in milliseconds.
- **Treat agent outputs as evals, not asserts.** Don't assert on exact LLM text; assert on tool calls and structural properties (e.g. "the agent called `getRecipe` with the salmon's ID"). Light eval coverage at V1, heavier at V2+ when RAG lands.
- **Skip UI unit tests.** Cover via manual phone walkthrough at each stage exit. Add Playwright only if a regression bites.

### Modules under test

- **Unit-test from prototype on:** Quiz Generator, Recipe Importer, Dashboard Metrics aggregator, Session Tracker.
- **Integration-test (in-memory SQLite, one happy path each):** Recipe Repository, the `/api/recipes` and `/api/quiz` routes.
- **Eval-style at V1+:** Pellito Agent — given a fixed recipe corpus, does it call the right tool with sensible args? No assertions on natural-language phrasing.
- **Eval-style at V2+:** Brain Builder — embedding count matches chunk count, retrieval returns the expected recipe for known queries.
- **No automated tests:** UI components, auth (just two creds), i18n string lookup.

### Prior art

- The archived Prisma prototype had no test suite to mirror. Establish vitest as the runner for the rewrite.
- The `MASTRA_SDK_PREFLIGHT.md` doesn't prescribe a test pattern; this project sets the precedent for future Mastra projects under the EoG umbrella.

## Out of Scope

- **Per-user accounts and individual progress tracking.** Anonymous aggregate only. If the buyer requests this later, it is paid scope.
- **In-app vision ingest / image upload pipeline.** Recipes are scraped externally via an LLM session and imported via CSV.
- **Russian language support.** Was aspirational in the archived README; not a real staff need at this kitchen.
- **Prep Cook and FOH role views as built features.** Schema stays future-proof but UI does not ship until in-house ingredient recipes (Prep) and marketing/plating docs (FOH) are provided. Earliest activation: V3.
- **Real-time-during-service tooling.** This app is for training and lookup, not live ticket management or timer choreography.
- **Multi-tenant / multi-restaurant support.** The first deploy is single-tenant. The portable-demo fallback is also single-tenant — repackaged per customer.
- **Customer-facing branded subdomain** (e.g. a client's own `training.` subdomain). Optional, MVP stage only, contingent on the client signing.
- **POS / payroll / scheduling integrations.** Not in any stage.
- **Voice input/output.** Deferred to V3.
- **Full RAG pipeline.** Deferred to V2.
- **Folding into Mechanical Cupcakes OS.** Standalone first; integration happens after MVP if standalone is stable.

## Further Notes

- **Source documents** that fed this PRD: `design/01-grill-me-summary.md`, `PROJECT_BRIEF.md`, `Ideas & Projects/A Priori/MASTRA_SDK_PREFLIGHT.md`, `Ideas & Projects/A Priori/DEPLOYMENT_STANDARDS & VPS Tips.md`, the archived prototype's README.
- **Branding:** All visual identity follows the **Coastal Industrial Utility** design system documented in `design/07-design-system.md`. Light mode only. Primary color: Coastal Blue (`#526a8d`). Background: near-white `#f9f9ff`. No dark navy backgrounds — earlier issue descriptions referencing `bg-slate-900` / amber / blue CTAs are superseded by the stitch-derived spec. The "Pellito the Deckhand" agent persona is a deliberate continuation of the restaurant's nautical/coastal voice, not generic AI-mascot styling.
- **Buyer relationship:** Ernest was working in the kitchen at the time; the pitch target is its Training Manager. If the pitch lands, the engagement converts to paid work. If it doesn't, the app remains as a portable demo for any local restaurant and a Mastra showcase under the Ernest of Gaia portfolio.
- **Urgency:** No Pellito deployment exists today. Prototype-to-VPS is the immediate priority — we Dockerize and ship to `pellito.mechanicalcupcakes.fun` as soon as the local loop works, even before all V1 features are in place.
- **Data dependency:** Real recipe data must be scraped from the 24 photos at `websites/Pellito Hub/clean pantry kitchen recipes 24/` in a separate LLM session before V1 can ship. The exact recipe field shape is finalized after that session and recorded in `design/03-data-model.md` and `ingest/recipe-schema.md`.
- **Stage exit criteria** are tracked one-per-file in `stages/` (`prototype.md`, `v1.md`, `v2.md`, `v3.md`, `mvp.md`).

# git-grass Project Task Tracker

Status indicators:
- [x] Complete and verified
- [/] In progress
- [ ] Planned / Future Roadmap

---

## 1. Foundation & Project Setup
- [x] Inspect existing workspace, directory tree, and git remote (`https://github.com/sn3hhaa/git-grass`).
- [x] Initialize Git repository with default branch `main` and origin remote.
- [x] Verify Node.js (v24), npm (v12), and git availability.
- [x] Create project manifest (`package.json`) with dependencies and CLI entry point.
- [x] Create TypeScript configuration (`tsconfig.json`) targeting ES2022 / NodeNext.
- [x] Create `.gitignore` and `.editorconfig`.
- [x] Create and verify full MIT `LICENSE` text (1101 bytes).
- [x] Create initial `README.md` and `CHANGELOG.md`.
- [x] Install npm dependencies and verify compiler toolchain (`vitest`, `tsx`, `typescript`).

## 2. CLI & Configuration
- [x] Define Zod schemas and TypeScript interfaces for configuration (`src/shared/config.ts`).
- [x] Standardize on `gemma3:1b` model identifier across configuration, documentation, diagnostics, and tests.
- [x] Implement configuration read/write and atomic migration helpers (`src/session/storage.ts`).
- [x] Implement `git grass init` command (`src/cli/commands/init.ts`).
- [x] Implement `git grass status` command (`src/cli/commands/status.ts`).
- [x] Implement `git grass config` command (`src/cli/commands/config.ts`).
- [x] Implement `git grass doctor` command (`src/cli/commands/doctor.ts`) for environment, Ollama, model, and inference diagnostics.
- [x] Implement `git grass challenge` command (`src/cli/commands/challenge.ts`) for test previewing and schema validation.
- [x] Implement `git grass uninstall` command (`src/cli/commands/uninstall.ts`).
- [x] Write unit tests for configuration parsing, duration constraints, and elapsed calculations (`tests/config.test.ts`).

## 3. Git Integration
- [x] Implement Git command wrapper with argument arrays and safe execution (`src/git/executor.ts`).
- [x] Implement repository detection (`src/git/repository.ts`).
- [x] Implement pre-commit hook installer and existing hook wrapper (`src/git/hooks.ts`).
- [x] Implement `git grass check` command for hook gating (`src/cli/commands/check.ts`).
- [x] Implement staged tree fingerprinting and modification check (`src/git/staged-state.ts`).
- [x] Write integration tests for hook gating with isolated disposable repositories (`tests/git-gate.test.ts`).

## 4. Session Management
- [x] Define session state machine types: `IDLE`, `BREAK_REQUIRED`, `SESSION_CREATED`, `CHALLENGE_READY`, `BREAK_IN_PROGRESS`, `AWAITING_COMPLETION`, `COMPLETED`, `COMMITTING`, `COMMITTED`, `PUSHED`, `PUSH_FAILED` (`src/shared/types.ts`).
- [x] Implement session lifecycle manager (`src/session/manager.ts`).
- [x] Implement cryptographic session token generation and validation (`src/session/validation.ts`).
- [x] Implement atomic session persistence in `.git-grass/session.json`.
- [x] Write unit tests for session state transitions and validation (`tests/session.test.ts`).

## 5. QR & Local Server
- [x] Implement Express HTTP application (`src/server/app.ts`).
- [x] Implement route handlers: `/session/:id`, `/start`, `/complete`, `/commit`, `/status` (`src/server/routes.ts`).
- [x] Implement token authorization middleware and payload rate/size limiting (`src/server/auth.ts`).
- [x] Implement local network IP detection (`src/server/network.ts`).
- [x] Implement terminal ANSI QR code generation with fallback URL display (`src/server/service.ts`).
- [x] Write tests for server routes and error conditions (`tests/server.test.ts`).

## 6. Mobile Interface
- [x] Build responsive, mobile-first HTML view (`web/index.html`).
- [x] Style with outdoor-inspired, accessible, high-contrast aesthetic (`web/styles.css`).
- [x] Implement interactive client logic with timer, offline resilience, and commit form (`web/app.js`).
- [x] Support locking phone without timer breakage (authoritative timestamp comparisons).
- [x] Test mobile interface across responsive viewport sizes and error states.

## 7. AI Challenge Engine
- [x] Define outdoor challenge schema with Zod (`src/challenge/schema.ts`).
- [x] Implement project context extractor: repo name, readme summary, dependency keywords (`src/challenge/context.ts`).
- [x] Implement Ollama client with strict timeouts and model presence checks (`src/challenge/ollama.ts`).
- [x] Create curated offline fallback challenge dataset across tech stacks (`challenges/fallback-challenges.json`).
- [x] Implement challenge generator combining context, AI, and fallbacks (`src/challenge/generator.ts`).
- [x] Write mocked unit tests for challenge generation, prompt safety, and fallback resilience (`tests/challenge.test.ts`).
- [x] Write opt-in live Ollama integration test (`TEST_REAL_OLLAMA=1`).

## 8. Commit & Push Workflow
- [x] Implement `git grass start` command (`src/cli/commands/start.ts`).
- [x] Implement `git grass verify` command (`src/cli/commands/verify.ts`).
- [x] Implement safe commit execution with commit message from mobile check-in (`src/git/commit-flow.ts`).
- [x] Implement recursion prevention flag (`GIT_GRASS_BYPASS_TOKEN`).
- [x] Implement auto-push against bare remote and graceful failure handling preserving local commits.
- [x] Verify staged changes integrity before committing.

## 9. Testing & Security
- [x] Run full automated test suite with Vitest (49 passing tests, 1 opt-in skipped).
- [x] Verify security boundaries (safe exec, no shell injection, local network only, bounded inputs).
- [x] Test disposable repository end-to-end simulation.

## 10. Documentation
- [x] Complete comprehensive `README.md` with CLI reference, Hosted AI setup, Ollama setup, and troubleshooting.
- [x] Complete `docs/PRD.md`.
- [x] Complete `docs/ARCHITECTURE.md`.
- [x] Complete `docs/SECURITY.md`.
- [x] Complete `docs/TESTING.md`.
- [x] Complete `docs/CONTRIBUTING.md`.
- [x] Complete `docs/DECISIONS.md`.
- [x] Complete `docs/ROADMAP.md`.
- [x] Update `CHANGELOG.md`.

## 11. Hosted AI Backend (Render + Backboard — ₹0 Setup)
- [x] Create Render Web Service specification (`render.yaml`) with build and start commands for Free tier.
- [x] Implement production Express app (`src/hosted/server.ts`) binding to `0.0.0.0:${PORT}` with 25kb body limit and CORS.
- [x] Implement health-check endpoint (`GET /health`) reporting provider, model, and uptime.
- [x] Implement challenge endpoint (`POST /api/challenge`) validating schemas with Zod.
- [x] Implement in-memory LRU/TTL cache (`src/hosted/cache.ts`) preventing duplicate calls and protecting credits.
- [x] Implement sliding-window IP rate limiter (`src/hosted/rate-limiter.ts`) enforcing 15 req/min.
- [x] Implement Backboard provider (`src/hosted/providers/backboard.ts`) calling `POST https://app.backboard.io/api/threads/messages` with Gemini 2.0 Flash.
- [x] Evaluate Thinking Machines Tinker (`src/hosted/providers/tinker.ts`) and safely disable by default to prevent credit drain.
- [x] Implement provider factory (`src/hosted/providers/factory.ts`) and fallback provider (`src/hosted/providers/fallback.ts`).
- [x] Implement CLI client (`src/challenge/hosted-client.ts`) and multi-tier cascade in `src/challenge/generator.ts`.
- [x] Add configuration support for `hostedBackendUrl` and update `git grass doctor` diagnostics.
- [x] Create comprehensive automated tests (`tests/hosted-backend.test.ts`) with 18 test cases.

## 12. Public Website & Mobile UX Polish
- [x] Create technical, responsive CSS stylesheet (`site/styles.css`).
- [x] Create lightweight interactive script (`site/app.js`) with mobile drawer, copy buttons, terminal demo, and category filters.
- [x] Build comprehensive Home page (`site/index.html`) with interactive terminal demo.
- [x] Build Documentation page (`site/docs/index.html`).
- [x] Build Architecture & Security page (`site/architecture/index.html`).
- [x] Build Challenge Showcase page (`site/challenges/index.html`).
- [x] Build Privacy Policy page (`site/privacy/index.html`).
- [x] Build Changelog page (`site/changelog/index.html`).
- [x] Build Contributing Guide page (`site/contributing/index.html`).
- [x] Build custom 404 page (`site/404.html`).
- [x] Polish mobile session web app (`web/`) with completion summary and safe share action.
- [x] Add automated website integrity tests (`tests/website.test.ts`).
- [x] Add Render static site blueprint specification (`render.yaml`).

## 13. Final Build & Verification
- [x] Build TypeScript output (`dist/`).
- [x] Verify `npm pack --dry-run` package integrity.
- [x] Verify CLI commands: `help`, `doctor`, `challenge --test`.
- [x] Review Git status and diffs.
- [x] Push all milestone commits to GitHub origin (`https://github.com/sn3hhaa/git-grass`).
- [x] Confirm remote synchronization.

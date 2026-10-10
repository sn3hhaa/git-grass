# git-grass Project Task Tracker

Status indicators:
- [x] Complete and verified
- [/] In progress
- [ ] Planned / Pending

---

## 1. Foundation & Project Setup
- [x] Inspect existing workspace, directory tree, and git remote (`https://github.com/sn3hhaa/git-grass`).
- [x] Initialize Git repository with default branch `main` and origin remote.
- [x] Verify Node.js (v24), npm (v12), and git availability.
- [x] Create project manifest (`package.json`) with dependencies and CLI entry point.
- [x] Create TypeScript configuration (`tsconfig.json`) targeting ES2022 / NodeNext.
- [x] Create `.gitignore` and `.editorconfig`.
- [x] Create MIT `LICENSE`.
- [x] Create initial `README.md` and `CHANGELOG.md`.
- [ ] Install npm dependencies and verify compiler toolchain.

## 2. CLI & Configuration
- [ ] Define Zod schemas and TypeScript interfaces for configuration (`src/shared/config.ts`).
- [ ] Implement configuration read/write and migration helpers (`src/session/storage.ts`).
- [ ] Implement `git grass init` command (`src/cli/commands/init.ts`).
- [ ] Implement `git grass status` command (`src/cli/commands/status.ts`).
- [ ] Implement `git grass config` command (`src/cli/commands/config.ts`).
- [ ] Implement `git grass uninstall` command (`src/cli/commands/uninstall.ts`).
- [ ] Write unit tests for configuration parsing, duration constraints, and elapsed calculations.

## 3. Git Integration
- [ ] Implement Git command wrapper with argument arrays and safe execution (`src/git/executor.ts`).
- [ ] Implement repository detection (`src/git/repository.ts`).
- [ ] Implement pre-commit hook installer and existing hook wrapper (`src/git/hooks.ts`).
- [ ] Implement `git grass check` command for hook gating (`src/cli/commands/check.ts`).
- [ ] Implement staged tree fingerprinting and modification check (`src/git/staged-state.ts`).
- [ ] Write integration tests for hook gating with isolated disposable repositories (`tests/git-gate.test.ts`).

## 4. Session Management
- [ ] Define session state machine types: `IDLE`, `BREAK_REQUIRED`, `SESSION_CREATED`, `CHALLENGE_READY`, `BREAK_IN_PROGRESS`, `AWAITING_COMPLETION`, `COMPLETED`, `COMMITTING`, `COMMITTED`, `PUSHED`, `PUSH_FAILED` (`src/shared/types.ts`).
- [ ] Implement session lifecycle manager (`src/session/manager.ts`).
- [ ] Implement cryptographic session token generation and validation (`src/session/validation.ts`).
- [ ] Implement atomic session persistence in `.git-grass/session.json`.
- [ ] Write unit tests for session state transitions and validation (`tests/session.test.ts`).

## 5. QR & Local Server
- [ ] Implement Express HTTP application (`src/server/app.ts`).
- [ ] Implement route handlers: `/session/:id`, `/start`, `/complete`, `/status` (`src/server/routes.ts`).
- [ ] Implement token authorization middleware and payload rate/size limiting (`src/server/auth.ts`).
- [ ] Implement local network IP detection (`src/server/network.ts`).
- [ ] Implement terminal ANSI QR code generation with fallback URL display.
- [ ] Write tests for server routes and error conditions (`tests/server.test.ts`).

## 6. Mobile Interface
- [ ] Build responsive, mobile-first HTML view (`web/index.html`).
- [ ] Style with outdoor-inspired, accessible, high-contrast aesthetic (`web/styles.css`).
- [ ] Implement interactive client logic with timer, offline resilience, and commit form (`web/app.js`).
- [ ] Support locking phone without timer breakage (authoritative timestamp comparisons).
- [ ] Test mobile interface across responsive viewport sizes.

## 7. AI Challenge Engine
- [ ] Define outdoor challenge schema with Zod (`src/challenge/schema.ts`).
- [ ] Implement project context extractor: repo name, readme summary, dependency keywords (`src/challenge/context.ts`).
- [ ] Implement Ollama / Gemma client with strict timeouts and error fallbacks (`src/challenge/ollama.ts`).
- [ ] Create curated offline fallback challenge dataset across tech stacks (`challenges/fallback-challenges.json`).
- [ ] Implement challenge generator combining context, AI, and fallbacks (`src/challenge/generator.ts`).
- [ ] Write unit tests for challenge generation and fallback resilience (`tests/challenge.test.ts`).

## 8. Commit & Push Workflow
- [ ] Implement `git grass start` command (`src/cli/commands/start.ts`).
- [ ] Implement `git grass verify` command (`src/cli/commands/verify.ts`).
- [ ] Implement safe commit execution with commit message from mobile check-in.
- [ ] Implement recursion prevention flag (`GIT_GRASS_BYPASS_TOKEN`).
- [ ] Implement optional push execution with graceful failure reporting.
- [ ] Verify staged changes integrity before committing.

## 9. Testing & Security
- [ ] Run full automated test suite with Vitest.
- [ ] Verify security boundaries (safe exec, no shell injection, local network only, bounded inputs).
- [ ] Test disposable repository end-to-end simulation.

## 10. Documentation
- [ ] Complete comprehensive `README.md`.
- [ ] Complete `docs/PRD.md`.
- [ ] Complete `docs/ARCHITECTURE.md`.
- [ ] Complete `docs/SECURITY.md`.
- [ ] Complete `docs/TESTING.md`.
- [ ] Complete `docs/CONTRIBUTING.md`.
- [ ] Complete `docs/DECISIONS.md`.
- [ ] Complete `docs/ROADMAP.md`.
- [ ] Update `CHANGELOG.md`.

## 11. Final Push & Verification
- [ ] Build TypeScript output (`dist/`).
- [ ] Run test suite (`npm test`).
- [ ] Review Git status and diffs.
- [ ] Push milestone commits to `https://github.com/sn3hhaa/git-grass`.
- [ ] Confirm remote synchronization.


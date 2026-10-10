# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-10-10

### Added
- **Render-Hosted AI API Backend:**
  - Production-grade Express API server in `src/hosted/` with `/health` and `POST /api/challenge` endpoints.
  - Deployment configuration via `render.yaml` blueprint for Render Web Services on the free plan ($0 additional cost).
  - Binding to `0.0.0.0:${PORT}` with graceful SIGTERM/SIGINT shutdown handling.
  - Strict security guardrails: 25kb body limit, CORS headers, sanitized errors, zero credential leaks.
- **Backboard AI Provider:**
  - Production client integration in `src/hosted/providers/backboard.ts` calling `https://app.backboard.io/api/threads/messages` with `X-API-Key`.
  - Configurable LLM provider and model (default: Google Gemini 2.0 Flash via Backboard for ultra-low token consumption).
  - Resilient response parsing supporting raw JSON and markdown-fenced codeblocks.
  - Timeout protection (8s default) and complete secret redaction on error.
- **Credit & Abuse Protection Safeguards:**
  - In-memory bounded LRU/TTL challenge cache (`src/hosted/cache.ts`) preventing duplicate inference requests and eliminating wasted API credits.
  - In-memory sliding-window IP rate limiter (`src/hosted/rate-limiter.ts`) enforcing 15 requests per minute maximum.
- **Thinking Machines Tinker Provider (Evaluated & Inactive):**
  - Evaluated Thinking Machines Tinker framework in `src/hosted/providers/tinker.ts`.
  - Safely disabled by default (`isConfigured() === false`) to protect user credits, as Tinker is an experimental distributed LoRA/sampling infrastructure rather than a turnkey chat API.
- **CLI Hosted AI Integration:**
  - Client module `src/challenge/hosted-client.ts` enabling CLI to connect seamlessly to Render service.
  - Added `hostedBackendUrl` configuration key and CLI command `git grass config hostedBackendUrl <URL>`.
  - Environment variable override `GIT_GRASS_BACKEND_URL`.
  - Multi-tier challenge generation cascade in `createOutdoorChallenge`: Hosted Backend -> Local Ollama -> Curated Offline Fallbacks.
  - Updated `git grass doctor` to diagnose hosted backend health, reporting connectivity, provider, and model information.
- **Comprehensive Hosted Backend Test Suite:**
  - 18 tests in `tests/hosted-backend.test.ts` covering `/health`, `/api/challenge`, schema validation, caching, rate limiting (429), Backboard client mocks (valid JSON, markdown fence, 401, 429, timeouts), Tinker credit-protection safety, and client failovers. Total test suite expanded to 43 passing tests.

## [0.1.1] - 2026-10-10

### Added
- `git grass doctor` diagnostic command to audit Node.js, Git, Ollama CLI, local API connectivity, model presence, and fallback datasets.
- `git grass challenge` (`--test`) command to preview and schema-validate project-aware challenges without triggering a Git commit or break session.
- Comprehensive mocked AI test suite in `tests/challenge.test.ts` verifying request formatting, prompt safety, timeout handling, JSON validation, and model tag inspection.
- Opt-in live integration test for real local Ollama inference (`TEST_REAL_OLLAMA=1`).
- Bare remote push test in `tests/git-gate.test.ts` verifying remote synchronization and local commit preservation on push failure.

### Changed
- Standardized default local AI model identifier to `gemma3:1b` across configuration, documentation, tests, and CLI diagnostics.
- Added explicit model availability pre-check in `createOutdoorChallenge` before initiating inference requests.
- Restored full MIT License legal text in `LICENSE`.

## [0.1.0] - 2026-10-10

### Added
- **Core CLI & Runtime:**
  - TypeScript CLI application powered by Commander.js.
  - Subcommands: `init`, `status`, `check`, `start`, `verify`, `config`, `uninstall`.
  - Configurable focus intervals (default: 60 mins), break durations (default: 15 mins), and strict 10-minute minimum enforcement.
  - Safe configuration storage and atomic JSON file management in `.git-grass/`.

- **Git Commit Break Gate:**
  - Non-destructive `.git/hooks/pre-commit` hook installation preserving existing custom linters and scripts.
  - Staged tree fingerprinting (`git write-tree`) to guarantee staged changes are never lost, modified, or corrupted.
  - Internal bypass mechanism (`GIT_GRASS_BYPASS_TOKEN`) preventing recursive pre-commit loops during authorized commits.
  - Safe process execution via `node:child_process.execFile` with argument arrays to prevent shell injection.

- **Local Server & QR Engine:**
  - Express HTTP server binding to local network IP with port fallback.
  - ANSI QR code generation in terminal for instant mobile camera scanning.
  - Cryptographic session authentication with 24-byte random tokens and constant-time equality validation.
  - Bounded request sizes (50kb limit) and sanitized API responses.

- **Mobile Web Experience:**
  - Lightweight, responsive, zero-dependency mobile web application (`index.html`, `styles.css`, `app.js`).
  - 10 application states: Session Loading, Project Context, Duration Selection, Challenge View, Start Confirmation, In-Progress Timer (with screen-lock advisory), Completion Check-in, Commit Message Input, Committing Feedback, and Receipt.
  - High-contrast, accessible, outdoor-inspired visual design with reduced-motion support.
  - Authoritative workstation-side timer calculations preventing clock manipulation.

- **Project-Aware Challenge Engine:**
  - Repository context extractor analyzing repo name, README excerpts, and dependency keywords.
  - Local AI integration supporting Ollama (`gemma3:1b`) with strict timeouts.
  - Curated offline fallback challenge library (`challenges/fallback-challenges.json`) covering 6 domains: GameDev, Audio, ML, Web, Systems, and General Curiosity.
  - Strict Zod validation ensuring challenges are 100% physical, screen-free, and safe.

- **Comprehensive Documentation & Quality Assurance:**
  - Full suite of 9 technical markdown documents (`PRD`, `ARCHITECTURE`, `IMPLEMENTATION_PLAN`, `TASK`, `SECURITY`, `TESTING`, `CONTRIBUTING`, `DECISIONS`, `ROADMAP`).
  - Automated test suite using Vitest with unit, server, and Git integration boundaries.

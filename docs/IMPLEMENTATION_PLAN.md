# git-grass Implementation Plan

**Product:** git-grass  
**Tagline:** Your AI can write the code. It can't touch grass.  
**Repository:** https://github.com/sn3hhaa/git-grass  
**Target:** Production-grade, zero-cost, Git-native developer tool with local AI / fallback challenge engine and mobile outdoor break gateway.

---

## Architecture Overview

```
                      +---------------------------------------+
                      |               Developer               |
                      +---------------------------------------+
                                          |
                                          | (git commit)
                                          v
                      +---------------------------------------+
                      |         .git/hooks/pre-commit         |
                      |          (git grass check)            |
                      +---------------------------------------+
                                          |
                      +-------------------+-------------------+
                      |                                       |
           [Break Due / Blocked]                   [Break Not Due / Allowed]
                      |                                       |
                      v                                       v
          +-----------------------+              +--------------------------+
          | Displays Terminal QR  |              | Commit Proceeds Normally |
          | & Starts Local Server |              +--------------------------+
          +-----------------------+
                      |
           (Scan QR via Phone)
                      |
                      v
          +-----------------------+
          | Mobile Web Experience |
          |  (Phone-Free Walk)    |
          +-----------------------+
                      |
         (Timer Complete & Prompt)
                      |
                      v
          +-----------------------+
          | Submit Reflection &   |
          | Commit Message        |
          +-----------------------+
                      |
                      v
          +-----------------------+
          | Local CLI executes    |
          | atomic commit & push  |
          +-----------------------+
```

---

## Milestones & Engineering Sequence

### Milestone 1: Foundation & Project Setup
- [x] Inspect workspace, git remotes, and runtime environment.
- [x] Scaffold Node.js TypeScript project (`package.json`, `tsconfig.json`, `.gitignore`, `.editorconfig`, `LICENSE`).
- [x] Create project task tracking (`docs/TASK.md`) and implementation roadmap (`docs/IMPLEMENTATION_PLAN.md`).
- [ ] Install dependencies (`commander`, `zod`, `express`, `qrcode`, `qrcode-terminal`, `picocolors`, `vitest`, `tsx`, `typescript`).

### Milestone 2: CLI Foundation & Configuration System
- [ ] Define Zod schemas and TypeScript types for repository configuration (`.git-grass/config.json`) and session state.
- [ ] Implement configuration manager with defaults (60m interval, 15m duration, 10m minimum enforcement).
- [ ] Implement CLI commands:
  - `git grass init`: detect repo, initialize `.git-grass`, configure settings, install pre-commit hook safely.
  - `git grass status`: view interval, last break timestamp, break due state, active session.
  - `git grass config`: view and update settings.
  - `git grass uninstall`: safely remove git-grass hooks and config.
- [ ] Write unit tests for configuration parsing, duration constraints, and elapsed calculations.

### Milestone 3: Git Integration & Commit Gate
- [ ] Implement Git repository detection and safe command execution via `node:child_process` `execFile`/`spawn`.
- [ ] Implement `git grass check`: exits `0` if commit allowed, non-zero if break required.
- [ ] Implement safe pre-commit hook wrapper that preserves existing hooks and avoids clobbering.
- [ ] Implement staged change fingerprinting (`git diff --staged` tree SHA) to verify integrity.
- [ ] Implement recursion prevention (internal commit token/env marker).
- [ ] Write tests using isolated temporary Git repositories.

### Milestone 4: QR & Local Server Architecture
- [ ] Implement local HTTP server with Express:
  - `GET /session/:id`: session info, status, project context, challenge.
  - `POST /session/:id/start`: initiate outdoor walk (authoritative server timestamp).
  - `POST /session/:id/complete`: submit reflection and commit message after required duration.
  - `GET /session/:id/status`: polling/real-time session state check.
- [ ] Implement cryptographic session token generation and authentication.
- [ ] Implement local network IP auto-detection (serving to phone on local Wi-Fi / hotspot).
- [ ] Generate terminal QR code and clickable session URL.
- [ ] Implement automated server tests.

### Milestone 5: Mobile Web Experience
- [ ] Build standalone, zero-dependency mobile web interface (`index.html`, `styles.css`, `app.js`).
- [ ] Implement 10 states: Loading, Project Info, Duration Selection, Challenge View, Start Confirmation, In-Progress Timer (phone-free lock advisory), Completion Check-in, Commit Message Input, Committing Feedback, Final Success/Error.
- [ ] Offline-resilient client logic: timestamps computed against server baseline; works if phone screen locks.
- [ ] Nature-inspired, high-contrast, accessible UI styled for outdoor visibility.

### Milestone 6: Project-Aware Challenge Engine & AI Fallback
- [ ] Implement project context extractor (reading package.json, README.md, repo name, git keywords).
- [ ] Implement Ollama / Gemma AI provider interface with strict timeout and validation.
- [ ] Implement bundled offline fallback challenge library (`challenges/fallback-challenges.json`) categorized by tech stack (web, ML, systems, game, mobile, general).
- [ ] Strict TypeScript Zod schema validation for challenges: strictly outdoor, zero screen time, zero shell commands, safety notes included.
- [ ] Unit tests for challenge generation, fallback resilience, and schema validation.

### Milestone 7: Verified Completion & Atomic Git Operations
- [ ] Enforce 10-minute minimum break duration on the server (phone timestamps untrusted).
- [ ] Validate staged changes against initial session fingerprint before committing.
- [ ] Execute `git commit -m "<msg>"` safely without shell injection.
- [ ] Execute optional `git push` if enabled and upstream exists; report push status without failing local commit.
- [ ] Integration test the end-to-end commit workflow.

### Milestone 8: Documentation, Security, Testing & Release
- [ ] Create comprehensive suite of documentation:
  - `README.md`: full product guide, diagrams, quickstart, CLI reference.
  - `docs/PRD.md`
  - `docs/ARCHITECTURE.md`
  - `docs/SECURITY.md`
  - `docs/TESTING.md`
  - `docs/CONTRIBUTING.md`
  - `docs/DECISIONS.md`
  - `docs/ROADMAP.md`
  - `CHANGELOG.md`
- [ ] Run full test suite and build verification (`npm run build`, `npm test`).
- [ ] Push all verified milestone commits to GitHub remote.


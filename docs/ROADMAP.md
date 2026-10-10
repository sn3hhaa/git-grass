# Project Roadmap — git-grass

This roadmap tracks currently delivered MVP capabilities alongside planned future explorations for git-grass.

---

## 1. MVP v0.1.0 (Delivered & Verified)

- [x] **Git Commit Hook Gate:** Non-destructive pre-commit gate that preserves existing hooks and detects focus interval expiration.
- [x] **CLI Suite:** `init`, `status`, `check`, `start`, `verify`, `config`, `uninstall`.
- [x] **Staged Index Integrity:** Tree SHA fingerprinting (`git write-tree`) to verify uncorrupted staging state.
- [x] **Terminal ANSI QR Code:** High-contrast QR generation allowing immediate mobile scanning.
- [x] **Local LAN HTTP Server:** Express server operating on local network with 48-char cryptographic token authentication.
- [x] **Lightweight Mobile Web Experience:** 10-state mobile web UI styled with outdoor-inspired, accessible aesthetic.
- [x] **Project-Aware Challenge Engine:** Context extraction (repo name, README excerpt, package keywords) combined with Ollama (Gemma 2B) and zero-config offline fallback library.
- [x] **Authoritative Server Timer:** 10-minute minimum duration enforcement on workstation server.
- [x] **Mobile Check-in & Git Execution:** Phone-originated commit message triggering safe local commit and optional push.
- [x] **Automated Test Suite:** Vitest unit and integration test coverage across disposable repositories.

---

## 2. Near-Term Roadmap (v0.2.0 — v0.3.0)

- [ ] **Cross-Platform Audio Gong:** Optional gentle terminal audio chime or bell when the minimum break timer expires on the workstation.
- [ ] **Interactive Visual Walk Route Suggester:** Optional integration with OpenStreetMap / local park boundaries to suggest public walking paths.
- [ ] **Expanded Local LLM Backends:** Support for llama.cpp and Apple Silicon MLX local inference backends in addition to Ollama.
- [ ] **Git Worktree Support:** Multi-worktree session awareness when working with parallel Git branches.

---

## 3. Long-Term Explorations (v1.0.0+)

- [ ] **Wearable Step Sync (Optional):** Optional opt-in step count verification via Web Bluetooth without cloud synchronization.
- [ ] **Team Forest / Commit Streaks:** Optional local SVG badge generator showing "Touch Grass" commits vs digital commits for repository READMEs.
- [ ] **Team Pair Breaks:** Coordinated break sessions for remote pair programming pairs.

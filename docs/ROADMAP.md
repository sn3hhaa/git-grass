# Project Roadmap — git-grass

This roadmap tracks currently delivered MVP capabilities alongside planned future explorations for git-grass.

---

## 1. MVP v0.1.0 & v0.1.1 (Delivered & Verified)

- [x] **Git Commit Hook Gate:** Non-destructive pre-commit gate that preserves existing hooks and detects focus interval expiration.
- [x] **CLI Suite:** `init`, `status`, `check`, `start`, `verify`, `config`, `doctor`, `challenge`, `uninstall`.
- [x] **Staged Index Integrity:** Tree SHA fingerprinting (`git write-tree`) to verify uncorrupted staging state.
- [x] **Terminal ANSI QR Code:** High-contrast QR generation allowing immediate mobile scanning.
- [x] **Local LAN HTTP Server:** Express server operating on local network with 48-char cryptographic token authentication.
- [x] **Lightweight Mobile Web Experience:** 10-state mobile web UI styled with outdoor-inspired, accessible aesthetic.
- [x] **Local AI & Curated Fallback:** Ollama with `gemma3:1b` integration alongside 7 curated domain-aware offline fallbacks.
- [x] **Authoritative Server Timer:** 10-minute minimum duration enforcement on workstation server.
- [x] **Mobile Check-in & Git Execution:** Phone-originated commit message triggering safe local commit and optional push.

---

## 2. Hosted AI Backend v0.2.0 (Delivered & Verified)

- [x] **Render Web Service Blueprint:** Zero-config `render.yaml` deployment specification for Render Free plan ($0 cost).
- [x] **Backboard AI Provider:** Production integration with Backboard API (`https://app.backboard.io/api`) running Gemini 2.0 Flash for ultra-low token cost.
- [x] **Credit & Cost Protection:** In-memory LRU/TTL challenge cache and sliding-window IP rate limiter preventing wasted API credits.
- [x] **Zero-Local-Install Developer Experience:** Zero model downloads, zero Docker, zero Ollama required on developer laptops.
- [x] **Thinking Machines Tinker Safety:** Evaluated and disabled by default to safeguard credits from GPU sampling costs.
- [x] **CLI Cloud Sync & Diagnostics:** Config key `hostedBackendUrl`, environment variable `GIT_GRASS_BACKEND_URL`, and diagnostic support in `git grass doctor`.
- [x] **43 Passing Automated Tests:** Complete test coverage across unit, server, Git gate, and hosted cloud tiers.

---

## 3. Near-Term Roadmap (v0.3.0)

- [ ] **Cross-Platform Audio Gong:** Optional gentle terminal audio chime or bell when the minimum break timer expires on the workstation.
- [ ] **Interactive Visual Walk Route Suggester:** Optional integration with OpenStreetMap / local park boundaries to suggest public walking paths.
- [ ] **Expanded Local LLM Backends:** Support for llama.cpp and Apple Silicon MLX local inference backends in addition to Ollama.
- [ ] **Git Worktree Support:** Multi-worktree session awareness when working with parallel Git branches.

---

## 3. Long-Term Explorations (v1.0.0+)

- [ ] **Wearable Step Sync (Optional):** Optional opt-in step count verification via Web Bluetooth without cloud synchronization.
- [ ] **Team Forest / Commit Streaks:** Optional local SVG badge generator showing "Touch Grass" commits vs digital commits for repository READMEs.
- [ ] **Team Pair Breaks:** Coordinated break sessions for remote pair programming pairs.

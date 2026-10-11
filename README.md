# 🌱 git-grass

> **"Your AI can write the code. It can't touch grass."**

[![npm version](https://img.shields.io/npm/v/git-grass.svg)](https://www.npmjs.com/package/git-grass)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org)
[![Tests Passing](https://img.shields.io/badge/tests-51%20passed-success.svg)](https://github.com/sn3hhaa/git-grass/tree/main/tests)
[![Website](https://img.shields.io/badge/website-live-brightgreen.svg)](https://git-grass.onrender.com)

**git-grass** is an open-source, Git-native outdoor-break enforcement tool that integrates physical recovery directly into your source control workflow. [Explore the documentation and interactive demo on the official website](https://git-grass.onrender.com).

When your configured focus interval expires, your next protected `git commit` is paused. The CLI generates a compact terminal QR code and [Break Gateway](https://git-grass.onrender.com/break/?s=demo&r=git-grass&c=systems) session. Using repository file structure and manifest metadata, git-grass generates an observational outdoor challenge tailored to your project domain using **Backboard Cloud AI**, **Thinking Machines Tinker** open-weight model sampling, **Render** cloud microservice hosting, or zero-config bundled offline fallbacks.

The developer selects their walk duration on mobile, locks their phone, steps away from their workstation, returns refreshed, completes a short check-in on the phone, and submits their commit message directly from their yard or doorway. The local CLI safely validates staging integrity and executes the commit.

---

## 🚨 Problem Statement

Modern AI-assisted development tools (Copilot, Cursor, Gemini, Claude) enable unprecedented coding velocity. However, this velocity creates uninterrupted marathons in front of monitors:
- **Dismissible Reminders:** Standard desktop notification alerts are reflexively clicked away in milliseconds.
- **Ocular and Cognitive Fatigue:** Long stretches without focal depth changes strain vision and degrade architectural thinking.
- **Screen-Based "Breaks":** Developers take breaks by browsing social media or reading feeds on their phones, offering zero cognitive or physical recovery.

---

## 🌿 The Solution: Git-Native Gating

git-grass establishes **Git** as the gatekeeper of developer wellness:
1. **Zero Distraction While Working:** git-grass does not pop up intrusive banners or disrupt your coding flow while you are in focus.
2. **Natural Milestone Enforcement:** The gate triggers only when you finish a block of work and execute `git commit`.
3. **Guaranteed Staged Integrity:** Staged changes are fingerprinted (`git write-tree`) and strictly preserved.
4. **Phone as a Temporary Bridge:** The phone interface is not a dashboard or feed; it explicitly instructs you to lock your screen and step outside.
5. **Domain-Aware Challenges:** Instead of generic push-ups, tasks are thematic observational walks (e.g. noticing civil routing systems when building backend infra, or observing light contrast when tuning UI designs).
6. **$0 Cost & 100% Local:** No cloud accounts, databases, API keys, or subscriptions required.

---

## 🌐 Live Website & Product Gallery

- **Official Website:** [https://git-grass.onrender.com](https://git-grass.onrender.com)
- **Technical Documentation:** [https://git-grass.onrender.com/docs/](https://git-grass.onrender.com/docs/)
- **Live Break Gateway Demo:** [https://git-grass.onrender.com/break/?s=demo&r=git-grass&c=systems](https://git-grass.onrender.com/break/?s=demo&r=git-grass&c=systems)
- **npm Package:** [https://www.npmjs.com/package/git-grass](https://www.npmjs.com/package/git-grass)
- **GitHub Repository:** [https://github.com/sn3hhaa/git-grass](https://github.com/sn3hhaa/git-grass)

### 1. Official Website Main Page 

<img width="939" height="402" alt="Screenshot 2026-10-11 145627" src="https://github.com/user-attachments/assets/1f27edfa-9127-4982-a3a9-fa05d67b4052" />

### 2. Technical Architecture & CLI Documentation 

<img width="667" height="407" alt="Screenshot 2026-10-11 142847" src="https://github.com/user-attachments/assets/28c78644-cdef-458e-b20a-4b6122c0d202" />

### 3. CLI Installation & Hook Setup 

<img width="794" height="365" alt="Screenshot 2026-10-11 143317" src="https://github.com/user-attachments/assets/d726de19-bbce-48cb-ad22-45bdce81372e" />

### 4. Git Commit Gate & Compact QR Code

<img width="821" height="429" alt="Screenshot 2026-10-11 143349" src="https://github.com/user-attachments/assets/c94bf329-7f58-48bb-bbff-92259c75adf3" />

### 5. Mobile Break Gateway — Break Duration & Domain Selection

<img width="716" height="1600" alt="WhatsApp Image 2026-10-11 at 14 52 12" src="https://github.com/user-attachments/assets/dae01a92-92f0-4ff6-8bc2-7e7d921039bb" />

### 6. Mobile Break Gateway — Outdoor Challenge & Start Break

<img width="716" height="1600" alt="WhatsApp Image 2026-10-11 at 14 52 12 (1)" src="https://github.com/user-attachments/assets/c84bb0d8-0e12-4f42-b464-6555a676bc9e" />

### 7. Mobile Outdoor Walk — Active Countdown Timer & Check-In

<img width="716" height="1600" alt="WhatsApp Image 2026-10-11 at 14 52 12 (2)" src="https://github.com/user-attachments/assets/0672e4e6-b004-4e01-921b-b61e4b885a71" />

---

## 🖥️ Terminal Demo

When an outdoor break is due, running `git commit` yields:

```text
$ git commit -m "feat: complete search engine backend"

🌱 git-grass

Your AI can write the code.
It can't touch grass.

A break is required.

Your staged changes are preserved.
Select your break duration on the mobile Break Gateway.

Scan the QR code to receive your outdoor challenge:

 ▄▄▄▄▄▄▄ ▄▄ ▄  ▄▄  ▄▄▄▄▄▄▄ 
 █ ▄▄▄ █ █▄▀ ▄   █ █ ▄▄▄ █ 
 █ ███ █ ▀▄▀▄ ▀██▄ █ ███ █ 
 █▄▄▄▄▄█ █▀█ ▄ ▄ █ █▄▄▄▄▄█ 
 ▄▄  ▄▄▄  █▄ ▄ ▀ █  ▄ ▄▄▄▄ 
 ▄  █▀ ▄▄▄ ▄█ ▄██▀▄▄▄██▄▀  
 █▀▄█▀▀▄██▀▀▄█  ▀▀▄▄█ ▄██▄ 
 ▀ █ █ ▄▀▄▀ █▀█ ██▀ ▄█▄▄▀  
 ▄▄▄▄ █▄▀█▀█     ██▄██▄█▀  
 ▄▄▄▄▄▄▄ ▀▀ █▄▀█▀█ ▄ █     
 █ ▄▄▄ █ ██▄▀█ ▀ █▄▄▄███▀▄ 
 █ ███ █  ▄▀█ ▄█▀█▄█▀ ▄▀▄  
 █▄▄▄▄▄█ █▀▀▀█  █ ▄█▀▀▀██▄ 
▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀

Open Break Gateway:
https://git-grass.onrender.com/break/?s=7ed7ba61&r=pixel-leader-otp&c=web

Git commit paused. Workstation will resume after outdoor break check-in.
```

---

## 📱 Mobile Workflow & User Journey

```text
┌──────────────┐     git commit      ┌─────────────────────────┐
│  Developer   │ ──────────────────> │  Workstation Git Hook   │
└──────────────┘                     └────────────┬────────────┘
       ▲                                          │ Focus Expired
       │                                          ▼
       │  Scans Terminal QR Code     ┌─────────────────────────┐
       ├──────────────────────────── │ git-grass Server (:4242)│
       │                             └────────────┬────────────┘
       ▼                                          │ Local LAN HTTP
┌──────────────┐     Outdoor Mission              │
│ Phone / LAN  │ <────────────────────────────────┘
└──────┬───────┘
       │
       │ Taps [Start Break] ──> Locks Phone ──> 10m+ Walk Outside
       │
       ▼
┌──────────────┐     Submits Check-in & Message     ┌─────────────────────────┐
│ Phone / LAN  │ ─────────────────────────────────> │ Validates Token & SHA-1 │
└──────────────┘                                    └────────────┬────────────┘
                                                                 │ Native Release
                                                                 ▼
                                                    ┌─────────────────────────┐
                                                    │ Commit Released & Pushed│
                                                    └─────────────────────────┘
```

---

## 🎯 Project-Aware Challenge Examples

git-grass inspects your repository context and selects an outdoor observation task:

| Domain | Challenge Title | Observational Mission | Reflection Prompt |
|---|---|---|---|
| **GameDev / 3D** | *Real-World Level Designer* | Spot 3 physical shapes, elevation shifts, or obstacles in your neighborhood. | *"Which physical obstacle could inspire the most engaging game mechanic?"* |
| **Audio / Media** | *Soundscape Explorer* | Walk without headphones; identify near, mid, and distant acoustic layers. | *"Which sound was most difficult to distinguish from the ambient noise floor?"* |
| **Machine Learning** | *Pattern & Texture Observer* | Observe natural fractal textures, leaf veins, and shadow gradients. | *"What distinctive feature made one natural texture immediately recognizable?"* |
| **Frontend / Web** | *Everyday Information Systems* | Examine public physical signage, noticeboards, and typography outdoors. | *"What design element made the most effective sign understandable at 10 paces?"* |
| **DevOps / Systems** | *Distributed Infrastructure Walk* | Observe utility lines, storm conduits, and redundant physical paths. | *"What physical routing junction reminded you of backend architecture?"* |
| **General / Unknown** | *Curiosity Walk* | Walk half your normal speed; observe 3 details you usually miss. | *"What unexpected detail did you notice that you normally overlook?"* |

---

## 🏗️ Architecture Overview

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        WORKSTATION RUNTIME                             │
│                                                                        │
│   git commit ──> .git/hooks/pre-commit ──> git-grass check             │
│                                                   │                    │
│   ┌───────────────────────────────────────────────┴────────────────┐   │
│   │                                                                │   │
│   ▼                                                                ▼   │
│  [Local Session Server]                               [AI Engine]      │
│  • Express HTTP (:4242)                               • Render Backend │
│  • ANSI Terminal QR Generator                         • Backboard AI   │
│  • Cryptographic Token Store                          • 12 Built-in    │
│  • Atomic Git Release Engine                            Fallbacks ($0) │
└───────────────────────────────┬────────────────────────────────────────┘
                                │ Local LAN (Zero Cloud Telemetry)
                                ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        MOBILE CLIENT / BROWSER                         │
│                                                                        │
│   • Instant Vanilla HTML/CSS/JS (Zero dependencies, instant load)      │
│   • Step Outside & Lock Phone Guidance                                 │
│   • Minimum 10-Minute Workstation Hard Timer Check                     │
│   • Reflection Prompt & Remote Commit Release Dispatch                 │
└────────────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Technology Stack

| Area | Technology | Rationale |
|---|---|---|
| **Runtime** | Node.js (>= 18.0.0) | Cross-platform standard for developer CLI tools. |
| **Language** | TypeScript (ES2022 / NodeNext) | Type safety, maintainability, and clean modularity. |
| **CLI Framework** | Commander.js | Standard, lightweight command dispatcher. |
| **Schema Validation** | Zod | Runtime validation of configuration, sessions, and AI payloads. |
| **Local Server** | Express | Lightweight, reliable HTTP server bound to local LAN interface. |
| **QR Generation** | `qrcode-terminal` & `qrcode` | Crisp ANSI QR codes displayed directly in terminal windows. |
| **Git Integration** | Native Git via `child_process.execFile` | Safe execution with argument arrays; zero shell interpolation. |
| **Mobile Client** | Vanilla HTML5, CSS3, JavaScript | Zero-dependency, lightweight, offline-resilient, instant mobile load. |
| **AI Inference** | Backboard API (Gemini 2.0 Flash) on Render | Free-tier cloud backend; zero laptop setup, ₹0 cost. |
| **Fallback Library** | Curated JSON (`challenges/fallback-challenges.json`) | Immediate graceful failover when AI server is absent. |
| **Test Suite** | Vitest | High-speed ESM native testing across isolated disposable repos. |

---

## 🚀 Installation & Quick Start

### Global Installation

```bash
npm install -g git-grass
```

Or execute directly via `npx`:
```bash
npx git-grass --help
```

### Enable in a Git Repository

Navigate to any Git repository:
```bash
cd my-project
git grass init
```

`git grass init` will:
1. Detect repository root.
2. Initialize `.git-grass/config.json` with sensible defaults (60m interval, 15m duration).
3. Safely install or wrap the `.git/hooks/pre-commit` hook without clobbering existing hooks.

---

## 📖 CLI Command Reference

### `git grass init [options]`
Initialize git-grass in the current Git repository and install the commit gate.
- `-i, --interval <minutes>`: Set break interval in minutes (default: `60`, min: `10`).
- `-d, --duration <minutes>`: Set default break duration in minutes (default: `15`, min: `10`).
- `--auto-push`: Enable automatic push to upstream branch after verified commit.

### `git grass status`
Displays timer status, elapsed minutes since last break, active sessions, and configuration summary.

### `git grass check`
Used by Git hooks. Exits `0` if commit may proceed, or starts the session gate and exits non-zero if a break is required.

### `git grass start [options]`
Manually starts an outdoor break session immediately and displays the QR code.
- `-d, --duration <minutes>`: Duration in minutes (min: `10`).
- `-p, --port <port>`: Server port (default: `4242`).

### `git grass verify`
Checks whether the active session has satisfied server-side duration and check-in requirements.

### `git grass config [key] [value]`
Inspects or safely updates repository configuration values:
```bash
# View entire configuration
git grass config

# Update break interval
git grass config interval 45

# Update default walk duration
git grass config duration 20

# Enable auto-push
git grass config autoPush true

# Reset last break timer to now
git grass config resetLastBreak
```

### `git grass doctor`
Runs a comprehensive environment diagnostic check:
- Node.js & Git version check
- Active repository configuration & pre-commit hook verification
- Hosted Cloud AI backend (`Render + Backboard`) connectivity & health check
- Bundled offline fallback dataset (`challenges/fallback-challenges.json`) verification and live test challenge generation

### `git grass challenge [--test]`
Generates and displays an outdoor observation challenge for the current repository without triggering a Git commit or starting a break session. Tests the challenge generation pipeline and schema validation directly.

### `git grass uninstall [--yes]`
Safely removes git-grass pre-commit hooks and `.git-grass/` configuration, strictly preserving any unrelated custom hooks.

---

## ☁️ Cloud AI Architecture (Render + Backboard + Thinking Machines Tinker)

For developers who want real AI-generated, project-aware challenges with zero local AI runtimes or heavy models on their machine, git-grass provides a multi-provider cloud and direct-CLI AI pipeline.

### Architecture Overview
- **Deployment Platform (Render):** Full-stack `render.yaml` Blueprint deploying both the Static Documentation Website (`https://git-grass.onrender.com`) and the Hosted AI Web Service (`0.0.0.0` binding, `/health` endpoint).
- **Backboard AI Engine (`src/hosted/providers/backboard.ts`):** Uses the [Backboard API](https://app.backboard.io) 3-step stateful workflow (`POST /assistants` -> `POST /assistants/{id}/threads` -> `POST /threads/{id}/messages` with `FormData`) to synthesize repository-specific outdoor challenges.
- **Thinking Machines Tinker Engine (`src/hosted/providers/tinker.ts`):** Integrated open-weight model sampling provider (`Qwen/Qwen3-30B-A3B`) via OpenAI-compatible `/v1/chat/completions` inference with strict `OutdoorChallengeSchema` validation.
- **Credit & Abuse Protection:**
  - **In-Memory Cache:** 1-hour TTL cache (up to 1,000 entries) preventing identical queries from consuming duplicate credits.
  - **Sliding-Window Rate Limiter:** 15 requests/minute per client IP to prevent runaway credit drainage.
- **Instant Offline Fallback:** If cloud providers are unreachable or offline, git-grass **instantly and transparently falls back to its bundled curated challenge library** (`challenges/fallback-challenges.json`). Your Git commit workflow is never interrupted.
- **Local Privacy Unaltered:** The local session server never transmits private source code or Git history; only repository name, domain category, and top-level file extensions/keywords are used to craft the outdoor walk analogy.

### Deploying to Render in 3 Steps ($0 Cost)

1. **Deploy with Blueprint:** Connect your git-grass repository to Render and select **New Blueprint Instance** (uses `render.yaml` to deploy both the Static Website and Hosted AI Web Service automatically), or deploy manually as a Web Service:
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start:hosted`
   - **Instance Type:** `Free`

2. **Configure Environment Variables in Render Dashboard:**
   | Variable | Description | Recommended / Default |
   | :--- | :--- | :--- |
   | `AI_PROVIDER` | Active AI provider (`backboard`, `tinker`, `fallback`) | `backboard` |
   | `BACKBOARD_API_KEY` | Your Backboard API Key from [app.backboard.io](https://app.backboard.io) | *(Your Secret Key)* |
   | `BACKBOARD_PROVIDER` | LLM provider on Backboard | `google` |
   | `BACKBOARD_MODEL` | LLM model on Backboard | `gemini-2.0-flash` |
   | `RATE_LIMIT_MAX` | Max requests per minute per IP | `15` |
   | `CACHE_TTL_MS` | Cache TTL in milliseconds | `3600000` (1 hour) |

3. **Configure Your Local Git-Grass CLI:**
   Point your local CLI to your deployed Render URL:
   ```bash
   git grass config hostedBackendUrl https://your-service.onrender.com
   ```
   *Or set the environment variable:*
   ```bash
   export GIT_GRASS_BACKEND_URL=https://your-service.onrender.com
   ```

Verify connectivity anytime using:
```bash
git grass doctor
```

---

## 🔒 Security & Privacy Guarantees

- **No Source Code Transmitted:** git-grass never transmits source code files or Git history to external services.
- **Local Network Boundary:** The session server binds to your local Wi-Fi LAN address or loopback. No public internet tunnels are opened.
- **Cryptographic Tokens:** Sessions use 48-character hex tokens evaluated with constant-time equality checks.
- **Zero Shell Concatenation:** Git commands are executed with argument arrays via `execFile` to eliminate shell injection risks.
- **Integrity Fingerprints:** Staged changes are validated before commit execution using `git write-tree`.
- **Workflow Gate, Not a Prison:** Developers can bypass pre-commit hooks when emergencies arise with `git commit --no-verify`.

---

## 🧪 Testing

git-grass comes with a comprehensive test suite across unit, server, and Git integration boundaries:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Verify TypeScript compilation
npm run lint
```

Integration tests dynamically spin up isolated disposable Git repositories in temporary OS directories to verify hook behavior, staged index integrity, and recursion prevention.

---

## 🛠️ Troubleshooting

### "The QR code points to 127.0.0.1 and my phone cannot connect"
If your computer is not connected to a local Wi-Fi network or hotspot, git-grass falls back to `127.0.0.1`. Connect both your computer and phone to the same local Wi-Fi network or mobile hotspot, and re-run `git grass start`.

### "My existing pre-commit hook disappeared"
git-grass never deletes existing pre-commit hooks. It prepends its wrapper block with distinct `# --- BEGIN GIT-GRASS HOOK ---` markers. When uninstalled with `git grass uninstall -y`, git-grass strips only its own block, leaving your original linter/formatter scripts intact.

---

## 📚 Complete Documentation & Live Links

- [Official Website & Interactive Demo](https://git-grass.onrender.com)
- [Live Technical Documentation](https://git-grass.onrender.com/docs/)
- [Live Mobile Break Gateway](https://git-grass.onrender.com/break/?s=demo&r=git-grass&c=systems)
- [npm Package (`git-grass`)](https://www.npmjs.com/package/git-grass)
- [Product Requirements Document (PRD)](https://github.com/sn3hhaa/git-grass/blob/main/docs/PRD.md)
- [System Architecture & Sequence Diagrams](https://github.com/sn3hhaa/git-grass/blob/main/docs/ARCHITECTURE.md)
- [Implementation Plan & Delivery Record](https://github.com/sn3hhaa/git-grass/blob/main/docs/IMPLEMENTATION_PLAN.md)
- [Task Tracker](https://github.com/sn3hhaa/git-grass/blob/main/docs/TASK.md)
- [Security Model & Threat Assessment](https://github.com/sn3hhaa/git-grass/blob/main/docs/SECURITY.md)
- [Testing & Quality Assurance Guide](https://github.com/sn3hhaa/git-grass/blob/main/docs/TESTING.md)
- [Contributing Guidelines](https://github.com/sn3hhaa/git-grass/blob/main/docs/CONTRIBUTING.md)
- [Architectural Decision Records (ADRs)](https://github.com/sn3hhaa/git-grass/blob/main/docs/DECISIONS.md)

---

## 🏆 Hackathon Context

**git-grass** was created during an intensive engineering sprint as an open-source contribution to developer wellness. It proves that developer tooling can balance shipping velocity with biological reality.

*Your AI can write the code. It can't touch grass.*

---

## 📄 License

MIT © [Sneha Tiwari](https://github.com/sn3hhaa).

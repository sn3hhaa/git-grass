# Architectural Decision Records (ADRs) — git-grass

This document records the foundational architectural decisions, rationale, alternatives considered, and tradeoffs made during the development of **git-grass**.

---

## ADR-01: Editor-Independent CLI & Native Git Integration

### Context
Developers use a diverse variety of IDEs and editors: VS Code, Neovim, JetBrains, Zed, Cursor, Windsurf, or terminal tmux sessions. Building a VS Code extension would exclude non-VS Code users and couple the tool to a single proprietary extension marketplace.

### Decision
Implement git-grass as a standalone Node.js TypeScript CLI integrating directly with native Git hooks (`.git/hooks/pre-commit`).

### Consequences
- Works identically across all editors, terminal emulators, and CI/CD environments.
- Leverages standard Git conventions (`git commit` triggers `git grass check`).
- Avoids maintenance overhead across multiple IDE plugin ecosystems.

---

## ADR-02: Why Pre-Commit Hooks Over Polling Daemons

### Context
Tracking developer active focus time can be implemented either via a persistent background daemon tracking keyboard/mouse events, or via discrete Git workflow gates.

### Decision
Use repository-local Git pre-commit hooks instead of persistent desktop monitoring daemons.

### Consequences
- **Privacy First:** No keyboard logging, window title sniffing, or background system monitoring.
- **Natural Boundary:** Commits represent natural cognitive milestones when a feature or bug fix is finished.
- **Resource Efficiency:** Zero CPU or memory overhead while the developer is writing code.

---

## ADR-03: Zero-Install Mobile Web Over Native Mobile Apps

### Context
A mobile interface is needed for the developer to view the outdoor challenge and unlock the workstation. Developing native iOS and Android apps would require App Store approvals, build tooling, and native app installations.

### Decision
Serve a lightweight, responsive, zero-dependency mobile web application (`web/index.html`, `styles.css`, `app.js`) directly from the local workstation over LAN Wi-Fi.

### Consequences
- The developer opens the session in mobile Safari or Chrome immediately by scanning the terminal QR code.
- Zero downloads, zero accounts, and zero cloud hosting required.
- High accessibility and instant cross-platform compatibility.

---

## ADR-04: Local AI (Ollama / Gemma) with Offline Fallback

### Context
Generating project-aware challenges requires language model reasoning. Relying exclusively on paid cloud APIs (OpenAI, Anthropic, Gemini API) introduces API costs, requires users to configure API keys, and fails completely when offline.

### Decision
Support local open-weight model inference via Ollama (preferring Gemma 2B or Gemma 2), while bundling a comprehensive curated domain fallback challenge library (`challenges/fallback-challenges.json`).

### Consequences
- $0 cost to run; zero subscription or API key dependencies.
- Proprietary source code context stays 100% on the local machine.
- Works seamlessly on airplanes, trains, or outdoors without active internet connectivity.

---

## ADR-05: Local CLI Ownership of Git Operations

### Context
The mobile interface captures the user's reflection and commit message. Could the mobile app execute Git commands directly?

### Decision
The mobile client never executes Git commands. It submits the validated message payload over an authenticated HTTP connection to the local workstation server, where the CLI performs the Git operations using safe process execution (`child_process.execFile`).

### Consequences
- Git credentials, SSH keys, GPG signing keys, and source repositories never leave the developer's laptop.
- The phone remains a simple lightweight controller.

---

## ADR-06: Trust & Recovery Over Surveillance-Based Verification

### Context
How should git-grass verify that the developer actually walked outside rather than sitting at their desk?

### Decision
Enforce a hard server-side 10-minute minimum timer, require an observational reflection question, and advise locking the phone screen. Deliberately omit invasive biometric, GPS, or camera surveillance.

### Consequences
- git-grass treats developers as adults seeking mindful structure, not untrusted employees requiring surveillance.
- Lightweight, battery-friendly, and respects privacy.
- Friction is intentional, positive, and non-hostile.

---

## ADR-07: Hackathon Scope & Engineering Tradeoffs

### Context
The project required a demonstrable, rock-solid MVP within a strict deadline.

### Decision
Prioritize the complete end-to-end workflow (Git hook → terminal QR → phone UI → challenge engine → verified atomic commit) over optional features like multi-user team synchronization, Bluetooth proximity beacons, or custom audio synthesizers.

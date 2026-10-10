# 🌱 git-grass

> **"Your AI can write the code. It can't touch grass."**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org)

**git-grass** is an open-source, Git-native outdoor break enforcement tool that integrates physical recovery directly into your developer workflow. When your configured focus interval expires, your next `git commit` is paused until you step away from the workstation, complete a real-world outdoor challenge, and check back in.

---

## 🌟 Why git-grass?

AI coding assistants, continuous integration loops, and high-intensity sprints keep software engineers glued to monitors for unhealthy stretches. Existing reminder apps are easily dismissed with a click.

**git-grass changes the dynamic:**
- **Git is the gatekeeper:** It hooks into your native `git commit` workflow. When a break is due, commits are temporarily paused.
- **Your work stays safe:** Staged changes are fingerprinted and strictly preserved.
- **Project-aware outdoor challenges:** Instead of generic timers, local AI (or bundled domain fallbacks) analyzes your repository context to generate an observational outdoor walk.
- **Phone is just a bridge:** A terminal QR code launches a lightweight mobile session. Lock your phone, step outside for at least 10 minutes, and return refreshed.
- **Commit from the yard:** Type your commit message on your phone upon completing your walk, and git-grass triggers your local commit safely.

---

## ⚡ Quick Start

### Installation

```bash
npm install -g git-grass
```

Or run via npx:
```bash
npx git-grass --help
```

### Enable in your repository

```bash
cd your-repo
git grass init
```

Check your break schedule:
```bash
git grass status
```

---

## 📋 Documentation

- [Product Requirements (PRD)](./docs/PRD.md)
- [System Architecture](./docs/ARCHITECTURE.md)
- [Implementation Plan](./docs/IMPLEMENTATION_PLAN.md)
- [Task Tracker](./docs/TASK.md)
- [Security & Threat Model](./docs/SECURITY.md)
- [Testing Guide](./docs/TESTING.md)
- [Contributing](./docs/CONTRIBUTING.md)
- [Architectural Decisions](./docs/DECISIONS.md)
- [Roadmap](./docs/ROADMAP.md)

---

## 📄 License

MIT © [Sneha Tiwari](https://github.com/sn3hhaa) and git-grass contributors.


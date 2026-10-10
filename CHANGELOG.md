# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
  - Local AI integration supporting Ollama (`gemma:2b` / `gemma2`) with strict timeouts.
  - Curated offline fallback challenge library (`challenges/fallback-challenges.json`) covering 6 domains: GameDev, Audio, ML, Web, Systems, and General Curiosity.
  - Strict Zod validation ensuring challenges are 100% physical, screen-free, and safe.

- **Comprehensive Documentation & Quality Assurance:**
  - Full suite of 9 technical markdown documents (`PRD`, `ARCHITECTURE`, `IMPLEMENTATION_PLAN`, `TASK`, `SECURITY`, `TESTING`, `CONTRIBUTING`, `DECISIONS`, `ROADMAP`).
  - Automated test suite using Vitest with 17 passing tests across unit, server, and Git integration boundaries.

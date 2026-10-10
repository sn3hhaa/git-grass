# Contributing to git-grass

Thank you for your interest in contributing to **git-grass**! We welcome bug reports, documentation improvements, new challenge categories, and architectural contributions.

---

## 1. Prerequisites

- **Node.js:** v18.0.0 or later (v20+ recommended).
- **Git:** Git 2.20 or later.
- **npm:** v9 or later.
- *(Optional)* **Ollama:** with `gemma:2b` or `gemma2` for local AI challenge generation testing.

---

## 2. Local Development Setup

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/sn3hhaa/git-grass.git
   cd git-grass
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the TypeScript build and watch mode:
   ```bash
   npm run build
   ```
4. Run tests:
   ```bash
   npm test
   ```
5. Test the CLI locally without global installation:
   ```bash
   npm run dev -- status
   npm run dev -- help
   ```

---

## 3. Engineering Guidelines & Coding Conventions

- **TypeScript Strict Mode:** All code must pass `npm run lint` (`tsc --noEmit`) with strict mode enabled.
- **Pure JavaScript & CSS for Mobile Web:** The mobile web UI under `web/` must remain zero-dependency vanilla HTML/CSS/JavaScript. Do not introduce heavy frontend frameworks (React, Vue, Tailwind) into the mobile web layer.
- **Zero Shell Concatenation:** Never concatenate user input into shell strings. Always use `execFile` or `spawn` with argument arrays.
- **10-Minute Minimum Constraint:** Never lower or allow bypass of the 10-minute minimum break requirement.
- **Documentation Integrity:** Update documentation and task trackers alongside code changes.

---

## 4. Git Commit Conventions

We follow Conventional Commits:

- `feat(scope): ...` for new features
- `fix(scope): ...` for bug fixes
- `docs(scope): ...` for documentation
- `test(scope): ...` for test suite additions
- `chore(scope): ...` for maintenance and toolchain updates

---

## 5. Adding New Fallback Challenges

To add new domain-specific fallback challenges, edit `challenges/fallback-challenges.json`:
- Ensure tasks are physically conducted outdoors.
- Ensure tasks require zero screen time or photography.
- Avoid any tasks requiring purchases, equipment, or interactions with strangers.
- Add safety notes relevant to outdoor walking.
- Verify with `npm test`.

---

## 6. Submitting a Pull Request

1. Create a feature branch: `git checkout -b feat/my-improvement`
2. Ensure all tests pass: `npm test`
3. Verify TypeScript compilation: `npm run build`
4. Commit your changes with meaningful messages.
5. Push to your fork and submit a PR to `main`.

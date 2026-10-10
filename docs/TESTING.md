# Testing Guide & Quality Assurance — git-grass

This document describes the automated and manual testing strategies employed to verify git-grass.

---

## 1. Automated Test Suite Overview

git-grass uses **Vitest** as its unified test runner. All unit and integration tests run across Node.js 18+ and TypeScript without external mocks or simulated databases.

To run the complete test suite:
```bash
npm test
```

To run tests in watch mode:
```bash
npm run test:watch
```

---

## 2. Test Coverage & Modules

| Test File | Target Module | Scope & Invariants Verified |
|---|---|---|
| `tests/config.test.ts` | `src/shared/config.ts` | Default values (60m interval, 15m duration); strict enforcement of minimum 10-minute break constraint; calculation of elapsed time and break-due logic. |
| `tests/session.test.ts` | `src/session/validation.ts` | Unique ID generation; 24-byte crypto token generation; state machine transition constraints; server-side duration requirement checks (rejecting premature completion). |
| `tests/challenge.test.ts` | `src/challenge/` | Schema validation for `OutdoorChallengeSchema`; rejection of screen-based or <10m tasks; fallback challenge loading and tech-stack domain matching; mocked Ollama request formatting with `gemma3:1b`; JSON validation; schema-violation rejection; connection timeout failover; model tag inspection; prompt confidentiality (no source-code/secret disclosure); opt-in live Ollama integration test. |
| `tests/server.test.ts` | `src/server/` | Express HTTP server startup on dynamic ports; rejection of unauthenticated requests; token verification; retrieval of sanitized session data; break initiation; rejection of premature completion. |
| `tests/git-gate.test.ts` | `src/git/` | Creation of isolated disposable Git repositories in OS temp directories; safe installation of pre-commit hook; preservation of existing custom hooks during installation and uninstallation; staged index tree fingerprinting (`git write-tree`); detection of modified staged content; atomic commit execution with recursion bypass; auto-push to disposable bare remote; preservation of local commit if push fails. |
| `tests/hosted-backend.test.ts` | `src/hosted/`, `src/challenge/hosted-client.ts` | Health-check endpoint verification (`/health`); request payload schema validation (min duration 10m, category enum); outdoor challenge generation; credit-saving in-memory cache hits; sliding-window rate limiting (429 Too Many Requests); Backboard provider mock tests (JSON parsing, markdown codefence extraction, 401 unauthorized handling, 429 quota exhaustion handling, malformed responses); Tinker credit-protection safety (disabled by default); CLI client availability checks; failover to curated offline fallbacks when backend is unreachable. |

---

## 3. Test Suite Execution Results

Running `npm test` (`vitest run`) produces:

```text
✓ tests/session.test.ts (4 tests)
✓ tests/config.test.ts (3 tests)
✓ tests/challenge.test.ts (11 tests | 1 skipped)
✓ tests/server.test.ts (4 tests)
✓ tests/hosted-backend.test.ts (18 tests)
✓ tests/git-gate.test.ts (4 tests)

Test Files  6 passed (6)
     Tests  43 passed | 1 skipped (44)
  Duration  6.11s
```

- **43 automated tests passed** without requiring external services or local model downloads.
- **1 opt-in test skipped:** `tests/challenge.test.ts > performs real local inference through local Ollama API if TEST_REAL_OLLAMA=1`. (To execute live inference tests against a running local Ollama instance with `gemma3:1b`, run `$env:TEST_REAL_OLLAMA="1"; npm test`).

---

## 4. End-to-End Manual Verification Protocol

For full manual verification with a mobile device on the same local Wi-Fi:

1. **Initialize a test repository:**
   ```bash
   mkdir test-grass-repo && cd test-grass-repo
   git init
   git-grass init
   ```
2. **Configure a short test interval (for demonstration):**
   ```bash
   git-grass config interval 10
   git-grass config duration 10
   # Set last break to 15 minutes ago to simulate an expired window
   git-grass config resetLastBreak
   ```
3. **Stage a change:**
   ```bash
   echo "hello outdoor world" > sample.txt
   git add sample.txt
   ```
4. **Trigger the commit gate:**
   ```bash
   git commit -m "feat: test outdoor commit"
   ```
5. **Verify the terminal gate:**
   - Observe the ASCII banner: `🌱 git-grass — Your AI can write the code. It can't touch grass.`
   - Observe the ANSI QR code displayed directly in the terminal.
   - Note the session URL: `http://192.168.x.x:4242/?session=...&token=...`
6. **Scan on mobile device:**
   - Connect mobile phone to the same Wi-Fi network.
   - Scan the terminal QR code.
   - Confirm the project name, domain category, and challenge instructions load.
7. **Initiate the walk:**
   - Click "Start Break & Step Outside 🌲".
   - Confirm the timer initiates and the UI advises locking the phone.
   - Lock the phone screen.
8. **Complete check-in:**
   - Return after the break period.
   - Submit reflection and enter commit message: `"feat: sample commit after outdoor break"`.
   - Submit the form.
9. **Verify terminal release:**
   - Observe the local workstation completing the Git commit atomically.
   - Run `git log -n 1` to confirm the commit was recorded with the message submitted from the phone.
   - Staged changes are cleanly cleared into the new commit.

# Security Policy & Threat Model — git-grass

**git-grass** is designed with security, privacy, and workflow safety at its core. This document details the threat model, technical boundaries, and defensive countermeasures implemented in the codebase.

---

## 1. Threat Model & Security Boundaries

```
[ Local Workstation / Laptop ]
  ├── Git Repository (.git/)
  │     ├── pre-commit hook (runs git-grass check)
  │     └── index (staged changes)
  │
  ├── Local Server (Node/Express :4242)
  │     └── Binds to LAN interface (e.g. 192.168.1.50:4242)
  │           ▲
  │           │ Authenticated HTTP with 48-char random token
  │           ▼
[ Developer Mobile Phone (LAN WiFi) ]
```

### Assets Protected:
1. **Source Code & Staged Integrity:** Preventing loss, corruption, or unintended commit of staged changes.
2. **Local Workstation Protection:** Preventing unauthorized remote code execution (RCE) or shell injection via network requests.
3. **Privacy:** Ensuring proprietary codebases and sensitive tokens are never transmitted to external clouds or unauthenticated devices.

---

## 2. Defensive Controls & Countermeasures

### 2.1 Safe Process Execution
All Git commands in `src/git/executor.ts` and `src/git/commit-flow.ts` use `node:child_process.execFile` or `spawn` with explicit argument arrays:
```ts
// Safe: Arguments passed as discrete array elements; shell: false
execFileAsync('git', ['commit', '-m', commitMessage], { cwd, env });
```
- **Zero Shell Concatenation:** Arbitrary user strings (such as commit messages or reflections entered on the phone) cannot escape into shell commands.

### 2.2 Local LAN Exposure & Session Tokens
- **No Public Cloud Tunnels:** The server never opens ngrok, cloudflare tunnels, or public WAN endpoints. It operates strictly across the local Wi-Fi / hotspot network.
- **Cryptographic Tokens:** Sessions are protected with 24-byte cryptographically secure random tokens (`crypto.randomBytes(24).toString('hex')`).
- **Timing Attack Prevention:** Incoming tokens are evaluated against session state using constant-time comparison via `crypto.timingSafeEqual`:
```ts
crypto.timingSafeEqual(Buffer.from(token), Buffer.from(session.sessionToken));
```
- **Sanitized Responses:** Session responses sent over HTTP completely strip the `sessionToken` and `stagedTreeHash` fields to prevent leakage.

### 2.3 Request Validation & Resource Bounds
- **Body Size Caps:** JSON request body size is capped at `50kb` via Express middleware to eliminate denial-of-service memory pressure.
- **Strict Zod Schemas:** Configuration files, session state, and AI model outputs are validated through runtime Zod schemas before being processed.

### 2.4 Staged Change Fingerprinting
When an outdoor break is initiated, `git write-tree` computes the SHA-1/SHA-256 tree object of the current index:
```ts
const stagedHash = await getStagedTreeHash(repoRoot);
```
Before committing from the mobile device, `verifyStagedIntegrity` verifies that the current staging index matches the original tree. If files were added, deleted, or altered while the developer was outside, the commit halts immediately to prevent committing unexpected changes.

### 2.5 Infinite Recursion Prevention
When git-grass triggers an internal commit from the server, Git invokes `.git/hooks/pre-commit`. To prevent an infinite loop through the break gate, an internal bypass environment token (`GIT_GRASS_BYPASS_TOKEN`) is passed to child Git processes. The hook detects this marker and permits the commit to complete without triggering another session.

### 2.6 Privacy & LLM Data Bounding
- **No Source Code Uploads:** When extracting project context for AI challenges (`src/challenge/context.ts`), git-grass inspects only the repository directory name, a single excerpt sentence from the README, and keyword tags.
- **Local AI Preference:** Inference is targeted at a deployed Render Web Service, local Ollama instances (`http://127.0.0.1:11434`), or offline curated JSON datasets.

### 2.7 Hosted AI Backend Security & Secret Isolation
- **No Secrets in Client Code:** The local CLI and client packages contain zero AI provider secrets or API keys. All keys (`BACKBOARD_API_KEY`) reside exclusively in server-side environment variables on Render.
- **Error Redaction:** The hosted backend explicitly catches upstream provider exceptions and redacts error outputs to guarantee that API keys, auth headers, or upstream provider URLs are never leaked in HTTP response bodies or status messages.
- **Credit & Abuse Protection:** An in-memory sliding-window rate limiter limits requests to 15 per minute per IP, and an in-memory 1-hour TTL cache (up to 1,000 entries) prevents duplicate inference calls and credit exhaustion attacks.
- **Minimal Metadata Transmission:** Calls from the CLI to the hosted backend transmit only the repository name, broad category (`web`, `systems`, etc.), duration, and bounded keywords. No source files, diffs, branch names, commit hashes, or author information are ever transmitted.

---

## 3. Important Limitations (Workflow Gate vs. Security Boundary)

> [!WARNING]
> **git-grass is a self-imposed developer wellness workflow gate, not an operating system security sandbox.**
> - Developers with terminal access can bypass pre-commit hooks at any time using `git commit --no-verify` or by unsetting the hook.
> - git-grass is intended to provide positive habit enforcement and mindful friction for developers who choose to use it, not enterprise surveillance.

---

## 4. Reporting Security Concerns

If you discover a potential vulnerability in git-grass, please report it privately via GitHub Security Advisories or by emailing `snehatiwari474@gmail.com`.

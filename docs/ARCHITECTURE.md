# System Architecture & Technical Design — git-grass

**git-grass** is an editor-independent developer utility composed of a TypeScript CLI, native Git hook wrapper, local HTTP server, mobile web application, and contextual challenge generator.

---

## 1. High-Level Architecture Diagram

```mermaid
graph TD
    Dev["Developer"] -->|git commit| Hook[".git/hooks/pre-commit"]
    Hook -->|git-grass check| Gate{"Break Due?"}
    
    Gate -->|No / Within Window| Allowed["Exit 0: Commit Proceeds"]
    Gate -->|Yes / Interval Expired| CLI["git-grass CLI Core"]
    
    CLI --> Storage[".git-grass/ Storage Engine"]
    CLI --> AI["AI Challenge Generator (Ollama / Fallback)"]
    CLI --> Srv["Local HTTP Server (Express LAN:4242)"]
    CLI --> QR["Terminal ANSI QR Generator"]
    
    QR --> Phone["Developer Mobile Browser"]
    Phone -->|HTTP / LAN WiFi| Srv
    
    subgraph Mobile Experience
        Phone --> S1["Lock Screen & Outdoor Walk"]
        S1 --> S2["Timer Elapsed Check"]
        S2 --> S3["Reflection & Commit Message"]
    end
    
    S3 -->|POST /session/:id/commit| Srv
    Srv --> GitExec["Native Git Executor (Safe Exec)"]
    GitExec --> Bypass["GIT_GRASS_BYPASS_TOKEN"]
    Bypass --> Done["Atomic Git Commit & Optional Push"]
```

---

## 2. Component & Module Responsibilities

| Module | Source Path | Primary Responsibility |
|---|---|---|
| **CLI Dispatcher** | `src/cli/index.ts` | Commander.js commands: `init`, `status`, `check`, `start`, `verify`, `config`, `uninstall`. |
| **Git Repository** | `src/git/repository.ts` | Discovers Git root, validates git availability, queries remotes/branches. |
| **Git Executor** | `src/git/executor.ts` | Executes git commands with argument arrays via `child_process.execFile` (zero shell interpolation). |
| **Hook Manager** | `src/git/hooks.ts` | Injects and uninstalls pre-commit wrapper while cleanly preserving existing hooks. |
| **Staged Integrity** | `src/git/staged-state.ts` | Fingerprints staged index tree SHA via `git write-tree` to guard against modifications. |
| **Commit Pipeline** | `src/git/commit-flow.ts` | Performs atomic commits and optional remote pushes with environment bypass markers. |
| **Session Manager** | `src/session/manager.ts` | Coordinates session lifecycles, timers, and challenge associations. |
| **Session Storage** | `src/session/storage.ts` | Atomic JSON read/write persistence for config and active session state. |
| **Validation Engine**| `src/session/validation.ts`| Enforces 10-minute minimums, constant-time token verification, and state transitions. |
| **Context Extractor**| `src/challenge/context.ts`| Summarizes repository name, README excerpt, and package keywords boundedly. |
| **AI Provider** | `src/challenge/ollama.ts` | Queries local Ollama endpoint (`gemma:2b` / `gemma2`) with strict timeouts. |
| **Fallback Engine** | `src/challenge/fallback.ts`| Loads and matches curated domain-aware challenges offline. |
| **Local Web App** | `src/server/` & `web/` | Express HTTP server and high-contrast, offline-resilient mobile web client. |

---

## 3. End-to-End Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer
    participant Git as Git Pre-Commit Hook
    participant CLI as git-grass CLI
    participant Server as Local HTTP Server
    participant Phone as Mobile Web Client
    participant Ollama as Ollama / Gemma AI

    Dev->>Git: git commit -m "feat: my work"
    Git->>CLI: git-grass check
    CLI->>CLI: Inspect .git-grass/config.json
    alt Interval Not Due (< 60 mins)
        CLI-->>Git: Exit code 0
        Git-->>Dev: Commit succeeds normally
    else Break Required (>= 60 mins)
        CLI->>Ollama: Request contextual outdoor walk
        alt Ollama Available
            Ollama-->>CLI: Structured Challenge JSON
        else Ollama Unavailable / Timeout
            CLI->>CLI: Load curated domain fallback challenge
        end
        CLI->>CLI: Fingerprint staged tree SHA
        CLI->>Server: Start LAN HTTP server (:4242)
        CLI->>Dev: Render Terminal QR & Gate Banner
        Dev->>Phone: Scans QR code
        Phone->>Server: GET /api/session/:id?token=...
        Server-->>Phone: Challenge details & instructions
        Dev->>Phone: Clicks "Start Break & Step Outside"
        Phone->>Server: POST /api/session/:id/start
        Server-->>Phone: Break timer started (authoritative)
        Dev->>Phone: Locks phone in pocket & walks outside (>= 10 min)
        Note over Dev, Phone: Screen-free physical outdoor break
        Dev->>Phone: Returns inside, answers reflection prompt
        Phone->>Server: POST /api/session/:id/complete
        Server-->>Phone: Verified
        Dev->>Phone: Inputs commit message & clicks Submit
        Phone->>Server: POST /api/session/:id/commit
        Server->>Server: Verify staged tree SHA unchanged
        Server->>Git: git commit -m "..." (with bypass token)
        Git-->>Server: Commit created (Hash: abc1234)
        Server-->>Phone: Commit Receipt
        CLI-->>Git: Exit code 0
        Git-->>Dev: Git commit finished!
    end
```

---

## 4. Session State Machine

```mermaid
stateDiagram-v2
    [*] --> IDLE
    IDLE --> BREAK_REQUIRED: Interval expired
    BREAK_REQUIRED --> SESSION_CREATED: git grass check / start
    SESSION_CREATED --> CHALLENGE_READY: Challenge extracted
    CHALLENGE_READY --> BREAK_IN_PROGRESS: User starts walk
    BREAK_IN_PROGRESS --> AWAITING_COMPLETION: Min 10m elapsed on server
    AWAITING_COMPLETION --> COMPLETED: Reflection submitted
    COMPLETED --> COMMITTING: Commit message received
    COMMITTING --> COMMITTED: git commit succeeds
    COMMITTED --> PUSHED: Optional git push succeeds
    COMMITTED --> PUSH_FAILED: Optional git push fails
    PUSHED --> IDLE: Ready for next cycle
    PUSH_FAILED --> IDLE: Ready for next cycle
```

---

## 5. Security & Boundary Architecture

1. **Local Network Boundary:** Server binds to local LAN interfaces or loopback. It never requires public tunneling services (e.g. ngrok) or internet proxies.
2. **Session Authentication:** Every request requires a cryptographically random token (`crypto.randomBytes(24)`). Constant-time comparison (`crypto.timingSafeEqual`) prevents timing attacks.
3. **Command Execution Safety:** All internal Git commands execute via `execFile` or `spawn` with explicitly isolated argument arrays. Shell concatenation is strictly prohibited.
4. **Staged Changes Immutability:** Staged files are fingerprinted via `git write-tree` when the break session begins. If an index change occurs while the developer is outside, the commit operation halts with an integrity error.
5. **No Source Exfiltration:** Only bounded metadata (repository name, short README sentence, dependency keyword list) is passed to the AI generator. Source code files are never uploaded or transmitted.

---

## 6. HTTP API Specification

| Endpoint | Method | Auth | Payload | Description |
|---|---|---|---|---|
| `/api/session/:id` | `GET` | Bearer Token / Query | None | Retrieves sanitized session details and challenge. |
| `/api/session/:id/status` | `GET` | Bearer Token / Query | None | Polls current session state, server time, and elapsed minutes. |
| `/api/session/:id/start` | `POST` | Bearer Token / Body | None | Marks authoritative break start timestamp. |
| `/api/session/:id/complete` | `POST` | Bearer Token / Body | `{ reflection: string }` | Validates server elapsed time (>= 10m) and records reflection. |
| `/api/session/:id/commit` | `POST` | Bearer Token / Body | `{ commitMessage: string }` | Verifies index integrity and executes local Git commit. |
| `/` or `/session/:id` | `GET` | None | None | Serves responsive mobile web application. |

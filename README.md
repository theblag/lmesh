<p align="center">
  <img src="packages/web/public/lmesh-logo.png" width="600" height="200" alt="LMESH Logo" style="border-radius: 16px;" />
</p>

<!-- <h1 align="center">LMESH</h1> -->

<p align="center">
  <strong>Live Multi-user Execution Shell</strong><br />
  Real-time, low-latency collaborative terminal streaming and pair programming over secure WebSockets.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6.svg?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Next.js-16-black.svg?logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/node--pty-Virtual_Terminal-green.svg" alt="node-pty" />
  <img src="https://img.shields.io/badge/WebSocket-TLS_1.3-orange.svg" alt="WebSocket" />
</p>

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#key-capabilities">Key Capabilities</a> •
  <a href="#system-architecture">System Architecture</a> •
  <a href="#monorepo-structure">Monorepo Structure</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#cli-usage">CLI Usage</a> •
  <a href="#security-model">Security Model</a>
</p>

---

## Overview

**LMESH** functions like *tmux* or *tmate* modernised for the web. A host starts a session from their local terminal, and remote teammates can join instantly via an encrypted URL in any modern browser without installing software, configuring SSH keys, or opening inbound firewall ports.

LMESH ensures strict host sovereignty through a **single-token write mutex**: remote users can watch in real time with 60 FPS WebGL terminal rendering, while control handover requires host permission and can be preempted immediately by the host's physical keyboard.

---

## Key Capabilities

- **Zero Inbound Port Configuration**: Uses outbound-only TLS 1.3 WebSocket pipes (`wss://`). Traverses NATs, corporate firewalls, and VPNs seamlessly.
- **Single-Token Concurrency Mutex**: Strict token gating ensures only one participant holds write access at any time, eliminating keystroke race conditions.
- **Physical Host Preemption Guard**: The host retains root authority. Any local physical keystroke immediately revokes remote write tokens.
- **Dual Terminal Synchronization**: Synchronizes raw PTY buffer dimensions and `SIGWINCH` resize signals between OS pseudo-terminals (`ConPTY` on Windows, `POSIX OpenPTY` on Linux/macOS) and remote `xterm.js` viewports.
- **Private Mode (Ctrl+S)**: In-session hotkey that dynamically redacts sensitive environment variables, passwords, and API credentials from the persistent audit trail.
- **Horizontal Relay Scalability**: Redis Pub/Sub cluster layer handles cross-instance broadcast and multi-node relay synchronization with instance deduplication.
- **GitHub Device Authorization**: Secure login via GitHub OAuth Device Flow on the CLI and standard OAuth 2.0 on the web interface.

---

## System Architecture

LMESH is divided into three tiers: **Host Environment (`packages/cli`)**, **Edge Relay Cluster (`packages/server`)**, and **Collaborator Viewport (`packages/web`)**.

```mermaid
flowchart TD
    classDef host fill:#101726,stroke:#3b82f6,stroke-width:1.5px,color:#f8fafc;
    classDef daemon fill:#0f2038,stroke:#60a5fa,stroke-width:1.5px,color:#f8fafc;
    classDef relay fill:#1a1429,stroke:#a855f7,stroke-width:1.5px,color:#f8fafc;
    classDef storage fill:#261221,stroke:#ec4899,stroke-width:1.5px,color:#f8fafc;
    classDef client fill:#0c221a,stroke:#10b981,stroke-width:1.5px,color:#f8fafc;
    classDef active fill:#1e293b,stroke:#f59e0b,stroke-width:2px,color:#f8fafc;

    subgraph HOST ["Host Environment (packages/cli)"]
        direction TB
        HostShell["Host Shell<br/><code>bash / zsh / pwsh</code>"]:::host
        PtyEngine["Virtual PTY Engine<br/><code>node-pty (ConPTY / OpenPTY)</code>"]:::host
        CliDaemon["LMESH CLI Daemon<br/><code>Outbound WSS Client</code>"]:::daemon
        PreemptLock["Preemption Guard<br/><code>Physical Keypress Priority</code>"]:::daemon

        HostShell <-->|"Raw IO / SIGWINCH"| PtyEngine
        PtyEngine <-->|"stdio byte stream"| CliDaemon
        PreemptLock -.->|"Preempts remote token"| PtyEngine
    end

    subgraph RELAY ["LMESH Relay Cluster (packages/server)"]
        direction TB
        IngressGw["Ingress Gateway<br/><code>Port 443 • TLS 1.3 WSS</code>"]:::relay
        TokenMutex["Single-Token Mutex<br/><code>Write Lock Engine</code>"]:::relay
        SessionCoord["Session Coordinator<br/><code>JWT Auth & Participant State</code>"]:::relay

        subgraph BACKEND ["State & Clustering Layer"]
            direction LR
            RedisPubSub[("Redis Pub/Sub<br/><code>lmesh:session:* Fanout</code>")]:::storage
            PostgresDB[("PostgreSQL<br/><code>Redacted Audit Logs</code>")]:::storage
        end

        IngressGw <-->|"Control Frames"| TokenMutex
        IngressGw <-->|"Session State"| SessionCoord
        SessionCoord <-->|"Multi-Node Broadcast"| RedisPubSub
        SessionCoord -.->|"Async Persist"| PostgresDB
    end

    subgraph CLIENTS ["Collaborator Viewports (packages/web)"]
        direction TB
        ViewerA["Collaborator A (Viewer)<br/><code>xterm.js WebGL Canvas</code>"]:::client
        ViewerB["Collaborator B (Controller)<br/><code>Active Write Token Holder</code>"]:::active
        WebClient["Browser WebSocket Client<br/><code>Reconnect & Frame Multiplexer</code>"]:::client

        WebClient -->|"Fanout Output"| ViewerA
        WebClient <-->|"Token-Gated Stdin"| ViewerB
    end

    CliDaemon <==>|"Outbound TLS 1.3 WSS<br/>(Zero Inbound NAT Ports)"| IngressGw
    IngressGw <==>|"Multiplexed WSS<br/>(Binary Chunks & Control)"| WebClient
```

<!-- <p align="center">
  <img src="packages/web/public/data-flow-diagram.png" width="850" alt="LMESH Data Flow Architecture Diagram" style="border-radius: 8px;" />
</p> -->

---

## Monorepo Structure

```
lmesh/
├── packages/
│   ├── cli/       # Host CLI Daemon (node-pty, Commander.js, WebSocket client)
│   ├── server/    # WebSocket Relay Cluster (Express, ws, Redis Pub/Sub, PostgreSQL)
│   └── web/       # Next.js 16 Client (xterm.js WebGL, Tailwind CSS, Auth UI)
└── package.json   # Root workspace orchestration
```

### Subsystem Responsibilities

- **`packages/cli`**: Hooks into the local terminal via `node-pty`, buffers raw stdout escape sequences, monitors physical input for preemption and hotkeys, and streams frames over an outbound TLS WebSocket.
- **`packages/server`**: Stateful relay cluster. Manages active WebSocket connections, enforces password protection, coordinates the single-token write mutex, persists audit logs, and handles multi-server fanout via Redis Pub/Sub.
- **`packages/web`**: Next.js client interface. Renders terminal output through WebGL-accelerated `xterm.js`, provides a host dashboard, and handles GitHub OAuth authorization.

---

## Quick Start

### Prerequisites

- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher
- **PostgreSQL**: PostgreSQL database (e.g. Neon serverless)
- **Redis**: Redis instance (required for multi-node clustering)
- **GitHub OAuth App**: Client ID & Client Secret (Device Flow + Web OAuth)

### 1. Clone & Install

```bash
git clone https://github.com/theblag/lmesh.git
cd lmesh
```

### 2. Configure & Run the Relay Server

```bash
cd packages/server
npm install
cp .env.example .env
```

Configure `.env`:
```env
PORT=3001
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
JWT_SECRET=your_super_secret_jwt_key
DATABASE_URL=postgresql://user:password@host/neondb?sslmode=require
REDIS_URL=redis://default:password@host:port
WEB_CLIENT_URL=http://localhost:3000
```

Start the relay server:
```bash
npm run dev
```

### 3. Configure & Run the Web Interface

In a separate terminal:
```bash
cd packages/web
npm install
npm run dev
```

The web dashboard is now accessible at `http://localhost:3000`.

### 4. Build & Link the CLI

In a separate terminal:
```bash
cd packages/cli
npm install
npm run build
npm link
```

---

## CLI Usage

### 1. Authenticate with GitHub

Run the device authorization login flow:
```bash
lmesh login
```
Follow the prompt to authorize on GitHub. Verify your profile:
```bash
lmesh whoami
```

### 2. Share Your Shell

Start sharing your terminal session:
```bash
lmesh share
```

Share with password protection:
```bash
lmesh share -w mySecretPassword
```

Share in read-only mode (collaborators cannot request control):
```bash
lmesh share --readonly
```

Connect to a remote production relay:
```bash
lmesh share -u wss://relay.yourdomain.com
```

### 3. In-Session Hotkeys

| Hotkey | Action | Description |
| :--- | :--- | :--- |
| `Ctrl+]` or `exit` | **Terminate Session** | Instantly closes the session and disconnects all collaborators. |
| `Ctrl+S` | **Private Mode** | Toggles audit-log redaction for passwords, API tokens, and secrets. |
| `y` / `n` | **Control Approval** | Responds to incoming remote write-token handover requests. |
| *Any physical key* | **Host Preemption** | Immediately revokes collaborator input and restores exclusive host control. |

---

## Security Model

1. **Outbound-Only Connectivity**: The CLI never opens an inbound listening socket. Attacks targeting local open ports are completely bypassed.
2. **Strict Single-Token Concurrency**: The relay server enforces token-gated input. Unapproved keystrokes sent from unauthorized web sockets are rejected.
3. **Physical Host Sovereignty**: The host retains ultimate authority over their shell. Remote participants can never lock out the host.
4. **Audit Trail Redaction**: When Private Mode (`Ctrl+S`) is active, commands executed in the session are redacted before being persisted to the database.
5. **Anti-Nesting Lock**: Recursive `lmesh share` execution inside an active session is detected and blocked via environment guards (`LMESH_SESSION`).

---

## Production Deployment

### Frontend (Vercel)
1. Import repository on [Vercel](https://vercel.com) and set the Root Directory to `packages/web`.
2. Add environment variable:
   - `NEXT_PUBLIC_SERVER_URL`: `https://relay.yourdomain.com`

### Relay Server (Docker / VPS / Render)
Deploy `packages/server` as a persistent container or Node.js web service (stateless HTTP serverless is not compatible with stateful WebSockets). Ensure port 443 is SSL-terminated.

---

## License

Distributed under the **MIT License**. See `LICENSE` for details.

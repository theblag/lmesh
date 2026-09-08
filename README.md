# LMESH (Live Multi-user Execution Shell)

LMESH is a real-time collaborative terminal sharing platform. It allows developers to share their local shell session with remote collaborators directly through the browser. Collaborators can view output in real time or request control to execute commands on the host machine under strict, token-gated access control.

---

## Overview

LMESH functions like tmux over WebSockets. A host runs the CLI on their local machine, and collaborators open a generated link in any modern browser without needing to install client software.

### Key Capabilities

- Real-Time Terminal Streaming: Keystrokes, terminal escape sequences, and screen redraws stream with low latency using raw WebSockets and xterm.js.
- Role-Based Access Control: The host decides whether a collaborator is a viewer or has active terminal control. Only one user holds the control token at any given moment.
- Safety Mode: Built-in secret protection toggle (Ctrl+S) that dynamically redacts sensitive environment variables, tokens, and credentials from audit logs.
- Dual Terminal Synchronization: Screen dimensions and buffer state stay synchronized between the host operating system pseudo-terminal (ConPTY / POSIX PTY) and the remote browser viewport.
- Command Audit Logging: Full attribution of executed commands with timestamps, user handles, and persistent storage.
- Multi-Instance Relay Coordination: Redis Pub/Sub backend with instance deduplication enables horizontal scaling across multiple relay servers.
- Host Authentication: GitHub Device Authorization Flow for CLI users and standard GitHub OAuth for browser users.

---

## Architecture

LMESH is structured as a TypeScript monorepo containing three core packages:

```
lmesh/
├── packages/
│   ├── cli/      # Host CLI tool (node-pty, ws, commander)
│   ├── server/   # WebSocket relay backend (Express, ws, Redis, Neon Postgres)
│   └── web/      # Next.js frontend and terminal renderer (xterm.js, Tailwind CSS)
```

### Data Flow

```
Host Terminal (node-pty)
         ^
         | WebSocket (ws:// / wss://)
         v
Relay Server (Node.js + ws) <=====> Redis Pub/Sub (State & Sync)
         ^
         | WebSocket (ws:// / wss://)
         v
Collaborator Browser (xterm.js)
```

---

## Repository Structure

- `packages/cli`: Spawns the local shell process using `node-pty`, bridges standard input/output over WebSocket to the relay server, handles terminal resizing events, and listens for control toggles.
- `packages/server`: State relay and session coordinator. Manages active WebSocket connections, enforces password protection, validates JWT tokens, records session history to PostgreSQL, and coordinates multi-server broadcasts via Redis.
- `packages/web`: Next.js frontend application featuring the web terminal viewer (`xterm.js`), the host session management dashboard, and GitHub authentication views.

---

## Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- PostgreSQL database (e.g., Neon serverless)
- Redis instance (optional for single-instance development; required for multi-server production)
- GitHub OAuth Application (for authentication)

---

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/theblag/lmesh.git
cd lmesh
```

### 2. Configure the Relay Server

Navigate to `packages/server` and install dependencies:

```bash
cd packages/server
npm install
```

Create a `.env` file based on `.env.example`:

```env
PORT=3001
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
JWT_SECRET=your_jwt_secret_key
DATABASE_URL=postgresql://user:password@endpoint.neon.tech/neondb?sslmode=require
REDIS_URL=redis://default:password@host:port
WEB_CLIENT_URL=http://localhost:3000
```

Start the server in development mode:

```bash
npm run dev
```

### 3. Configure the Web Frontend

In a separate terminal, navigate to `packages/web` and install dependencies:

```bash
cd packages/web
npm install
```

Create a `.env.local` file (optional for local development, as it defaults to localhost):

```env
NEXT_PUBLIC_SERVER_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

Start the Next.js development server:

```bash
npm run dev
```

The web interface is accessible at `http://localhost:3000`.

### 4. Build and Run the CLI

In a separate terminal, navigate to `packages/cli`:

```bash
cd packages/cli
npm install
npm run build
npm link
```

---

## CLI Usage

### Authentication

Authenticate the CLI with your GitHub account using the OAuth Device Flow:

```bash
lmesh login
```

Check your current authenticated status:

```bash
lmesh whoami
```

To log out:

```bash
lmesh logout
```

### Sharing a Terminal Session

Start sharing your active terminal:

```bash
lmesh share
```

#### CLI Options

- `-p, --port <number>`: Relay server port (default: `3001` or `LMESH_RELAY_PORT`).
- `-h, --host <string>`: Relay server host (default: `localhost` or `LMESH_RELAY_HOST`).
- `-u, --url <string>`: Direct WebSocket URL (e.g., `wss://relay.example.com`).
- `-w, --password <string>`: Set a password required for collaborators to join.
- `-r, --readonly`: Start session in read-only mode (collaborators cannot request control).

#### In-Session Controls

- `Ctrl+]` or `exit`: End the active session and disconnect all collaborators.
- `Ctrl+S`: Toggle Safety Mode (redacts sensitive tokens, API keys, and passwords from logs).

---

## Production Deployment

### Frontend (Vercel)

1. Import the repository into Vercel and set the Root Directory to `packages/web`.
2. Configure the following environment variable:
   - `NEXT_PUBLIC_SERVER_URL`: URL of your deployed relay server (e.g., `https://relay.yourdomain.com`).
   *(The client automatically derives `wss://` for WebSocket streaming).*

### Relay Server (Render, Railway, or VPS)

The relay server requires a platform that supports persistent, stateful WebSocket connections. Serverless platforms without WebSocket support are not suitable.

1. Deploy `packages/server` as a Web Service / Container.
2. Configure the environment variables:
   - `PORT`: Automatically assigned by the host.
   - `WEB_CLIENT_URL`: `https://your-frontend.vercel.app`
   - `GITHUB_CLIENT_ID`: Production GitHub OAuth client ID.
   - `GITHUB_CLIENT_SECRET`: Production GitHub OAuth client secret.
   - `JWT_SECRET`: Secure random string.
   - `DATABASE_URL`: Connection string for PostgreSQL database.
   - `REDIS_URL`: Connection string for Redis instance.
3. In your GitHub OAuth application settings, configure the Authorization callback URL to:
   `https://relay.yourdomain.com/api/auth/github/callback`

---

## Security Model

- Explicit Sharing: The host explicitly runs `lmesh share` from their machine and maintains full authority over the process.
- Single Token Control: At any point, only one user (the host or an approved collaborator) holds the active write token.
- Immediate Revocation: The host can revoke remote typing access or terminate the session at any time.
- Nested Session Guard: Recursive session spawning is blocked by environment guards to prevent infinite execution loops.

---

## License

This project is licensed under the MIT License.

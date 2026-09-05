# Project: LMESH (Live Multi-user Execution SHell)

LMESH is a collaborative terminal sharing platform where a host developer shares their local shell session with collaborators who join via a browser. Think of it as tmux over the internet, or sshx with role-based access control.

## Core concept:

Host runs a CLI tool (lmesh share) on their local machine
CLI connects to a relay server via WebSocket and exposes their local bash session
Collaborators open a browser link (lmesh.dev/x7k2m9p) and see the host's terminal live via xterm.js
Collaborators can request control — host approves/denies — and type commands that execute on the host's actual machine
All collaborators see output simultaneously in real time

## Architecture — three packages in a monorepo:

```
lmesh/
├── packages/
│   ├── cli/      # npm package, runs on host's PC
│   ├── server/   # relay backend, deploys to GCP Cloud Run
│   └── web/      # Next.js frontend, collaborator browser UI
```

## Data flow:

```
Host's bash (node-pty)
    ↕ 
CLI (WebSocket client)
    ↕
Relay Server (WebSocket server + Redis for session management)
    ↕
Browser (WebSocket client + xterm.js renderer)
```

## Tech stack:

CLI: Node.js, node-pty, ws, commander.js, TypeScript
Server: Node.js, Express, ws, Redis, JWT, TypeScript
Web: Next.js, xterm.js, TypeScript

## Key features to build:

Session creation with unique short ID (e.g. x7k2m9p)
Real-time terminal output streaming to all connected collaborators
Role-based access control — host, collaborator (can request control), viewer (read only)
Token-based control passing — only one user has control at a time, host can revoke anytime
Collaborator identity via display name on join (no account needed)
Host auth via GitHub OAuth (JWT stored in ~/.lmesh/config.json)
Command logging with user attribution and timestamp
Password protected sessions (optional, host decides)
Session ends when host disconnects (Ctrl+C)

## Security model:

Host explicitly shares their real terminal — they are responsible for their machine
Host controls who gets the session link
Only user with active control token can execute commands
Host can revoke control or end session instantly
Commands flagged as destructive require host approval before execution

## Server's role:
The server is purely a relay — it routes WebSocket messages between the host CLI and collaborator browsers. It never executes commands itself. Session state stored in Redis (session ID → host connection mapping, collaborator list, control token holder).

## Build order:

Server — WebSocket relay, session management, Redis integration
CLI — node-pty bash spawning, WebSocket connection to server, lmesh share/join commands
Web — Next.js session page, xterm.js terminal renderer, WebSocket connection, control UI

## What we are NOT doing:

No Docker sandboxing — commands execute on host's real machine by design
No Socket.io — raw WebSockets only
No database for sessions — Redis TTL handles cleanup
No collaborator accounts — display name only
No command blacklisting — security is trust-based, host controls access

## Current status:
Planning phase complete. No code written yet. Starting with server package first.
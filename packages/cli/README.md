# LMESH

> **Live Multi-User Execution Shell**
> Share and collaborate on live terminal sessions over encrypted WebSockets. Allows remote participants to view and interact with your shell directly in the browser with strict host-governed input permissions. Optimal for remote pair programming and live debugging with token-gated write control, zero inbound port configuration, and dynamic credential redaction.


[![npm version](https://img.shields.io/npm/v/lmesh-cli.svg)](https://www.npmjs.com/package/lmesh-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

## Installation

Run directly with `npx`:

```bash
npx lmesh-cli login
npx lmesh-cli share
```

Or install globally via `npm`:

```bash
npm install -g lmesh-cli
```

*(Once installed globally, you can simply run `lmesh share` or `lmesh login`)*.

---

## Quickstart

### 1. Authenticate with GitHub
Log in to your developer profile via GitHub Device Flow:

```bash
lmesh login
```

### 2. Share Your Terminal
Instantly share your current native shell (PowerShell/CMD on Windows, Bash/Zsh on macOS/Linux):

```bash
lmesh share
```

Output:
```text
Authenticated as @yourusername
Connecting to relay server at wss://lmesh.onrender.com...
Session created successfully!
Host: @yourusername
Share this link with collaborators:
https://lmesh.vercel.app/x7k2m9p
(Type 'exit' or press Ctrl+] to end session • Ctrl+S for Private Mode)
```

Collaborators open the link in any browser to watch your terminal at 60 FPS or request keyboard control.

---

## Commands & Options

### `lmesh login`
Initiates GitHub Device Authorization. Prints a one-time code and opens the verification page.

### `lmesh whoami`
Displays your currently authenticated user profile and token status.

### `lmesh logout`
Clears your local authentication credentials.

### `lmesh share [options]`
Starts a live terminal sharing session.

| Option | Description |
| :--- | :--- |
| `-w, --password <string>` | Protect the session with a password |
| `-r, --readonly` | Force read-only mode (collaborators cannot request control) |
| `-u, --url <string>` | Custom relay WebSocket URL (for local self-hosted relays) |
| `-h, --help` | Display command help |

---

## In-Session Hotkeys

While inside an active `lmesh share` session:

* **`Ctrl+]`** or **`exit`**: Instantly terminates the session and disconnects all collaborators.
* **`Ctrl+S`**: Toggles **Private Mode** (temporarily redacts sensitive commands from audit logs).
* **`y` / `n`**: Approves or denies remote control requests from collaborators.
* **Any physical key**: Host sovereignty preemption — pressing any key instantly reclaims write control back to the host.

---

## Security Model

* **Outbound-Only TLS 1.3**: The CLI never opens an inbound listening port. It punches cleanly through NATs, firewalls, and VPNs.
* **Single-Token Mutex**: Strictly one participant can type at a time, eliminating keystroke races.
* **Physical Host Sovereignty**: The host shell retains root authority. Any local keystroke preempts remote guests immediately.
* **Anti-Nesting Guard**: Detects and blocks recursive `lmesh share` calls within active sessions.

---

## License

[MIT](https://opensource.org/licenses/MIT) © [theblag](https://github.com/theblag/lmesh)

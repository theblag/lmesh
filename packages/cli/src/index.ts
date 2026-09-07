#!/usr/bin/env node

import { spawnPty, PtySession } from "./pty.js";
import { WebSocket } from "ws";
import { Command } from "commander";
import { loginCommand, logoutCommand, whoamiCommand } from "./auth.js";
import { readConfig } from "./config.js";

const program = new Command();

program
  .name("lmesh")
  .description("Live Multi-user Execution Shell CLI")
  .version("1.0.0");

// Subcommand: lmesh login
program
  .command("login")
  .description("Authenticate with GitHub using Device Flow")
  .action(async () => {
    await loginCommand();
  });

// Subcommand: lmesh logout
program
  .command("logout")
  .description("Logout and remove local authentication token")
  .action(() => {
    logoutCommand();
  });

// Subcommand: lmesh whoami
program
  .command("whoami")
  .description("Display currently authenticated user profile")
  .action(() => {
    whoamiCommand();
  });

// Subcommand: lmesh share
program
  .command("share")
  .description("Share your local terminal session")
  .option("-p, --port <number>", "Relay server port", "3001")
  .option("-h, --host <string>", "Relay server host", "localhost")
  .option("-w, --password <string>", "Password to protect the session")
  .option("-r, --readonly", "Make the session read-only (collaborators cannot request control)")
  .action((options) => {
    if(process.env.LMESH_SESSION){
      process.stderr.write(
        "\r\n\x1b[31m[lmesh] Error: You are already inside an active lmesh session.\x1b[0m\r\n" +
        "\x1b[90mNested session chaining is not allowed.\x1b[0m\r\n\r\n"
      );
      process.exit(1);
    }
    const userConfig = readConfig();

    // Enforce login requirement
    if (!userConfig) {
      console.log("\n\x1b[31m Error: You must be logged in to share a terminal session.\x1b[0m");
      console.log("Please run '\x1b[36mlmesh login\x1b[0m' to authenticate with GitHub first.\n");
      process.exit(1);
    }

    const wsUrl = `ws://${options.host}:${options.port}`;
    console.log(`Authenticated as \x1b[36m@${userConfig.user.username}\x1b[0m`);
    console.log(`Connecting to relay server at ${wsUrl}...`);

    const ws = new WebSocket(wsUrl);
    let ptySession: PtySession | null = null;

    let isPromptingForControl = false;
    let pendingGrantClientId: string | null = null;
    let currentCollaborators: { id: string; name: string }[] = [];

    // When a remote client resizes the PTY, conpty on Windows repaints the
    // screen buffer. We temporarily suppress stdout output on the host side
    // during the repaint to avoid extra blank lines, while still forwarding
    // the data to web clients.
    let suppressHostOutput = false;
    let suppressTimer: ReturnType<typeof setTimeout> | null = null;

    ws.on("open", () => {
      ws.send(
        JSON.stringify({
          type: "session_create",
          payload: {
            password: options.password,
            readOnly: !!options.readonly,
            token: userConfig.token,
          },
        })
      );
    });

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        switch (message.type) {
          case "session_created": {
            const { sessionId } = message.payload;
            console.log(`Session created successfully!`);
            console.log(`Host: @${userConfig.user.username}`);
            console.log(`Share this link with collaborators:`);
            console.log(`http://localhost:3000/${sessionId}`);
            console.log(`\x1b[90m(Type 'exit' or press Ctrl+] to end session • Ctrl+S for Safety Mode)\x1b[0m\n`);
            startSession(ws);
            break;
          }
          case "session_update": {
            const { collaborators } = message.payload;

            const notifications: string[] = [];
            for (const collab of collaborators) {
              const exists = currentCollaborators.some((c) => c.id === collab.id);
              if (!exists) {
                notifications.push(`\x1b[36m[lmesh] ● ${collab.name} joined\x1b[0m`);
              }
            }
            for (const oldCollab of currentCollaborators) {
              const exists = collaborators.some((c: any) => c.id === oldCollab.id);
              if (!exists) {
                notifications.push(`\x1b[36m[lmesh] ● ${oldCollab.name} left\x1b[0m`);
              }
            }
            currentCollaborators = collaborators;

            if (notifications.length > 0) {
              const msg = notifications.join("\r\n");
              process.stderr.write(`\r\n${msg}\r\n`);
              // Automatically refresh the shell prompt on a clean new line after any resize settling
              setTimeout(() => {
                if (ptySession) {
                  ptySession.write("\r");
                }
              }, 350);
            }
            break;
          }
          case "terminal_resize": {
            const { cols, rows } = message.payload || {};
            if (ptySession && cols && rows) {
              // Suppress host stdout during resize to avoid conpty repaint blank lines
              suppressHostOutput = true;
              if (suppressTimer) clearTimeout(suppressTimer);
              ptySession.resize(cols, rows);
              suppressTimer = setTimeout(() => {
                suppressHostOutput = false;
              }, 300);
            }
            break;
          }
          case "terminal_data": {
            if (ptySession && message.payload.data) {
              ptySession.write(message.payload.data);
            }
            break;
          }
          case "control_request": {
            const { clientId } = message.payload;
            const client = currentCollaborators.find((c) => c.id === clientId);
            const clientName = client ? client.name : `Guest-${clientId.slice(0, 4)}`;

            pendingGrantClientId = clientId;
            isPromptingForControl = true;
            process.stderr.write(
              `\n\x1b[36m[lmesh] ● ${clientName} requested control. Grant access? (y/n): \x1b[0m`
            );
            break;
          }
          case "error": {
            console.error(`\n\x1b[31m[LMESH Error] ${message.payload.message}\x1b[0m`);
            cleanup();
            process.exit(1);
          }
        }
      } catch (err) {
        console.error("Error parsing server message:", err);
      }
    });

    ws.on("close", () => {
      console.log("\nRelay server disconnected.");
      cleanup();
      process.exit(0);
    });

    ws.on("error", (err) => {
      console.error("\nWebSocket error:", err.message);
      cleanup();
      process.exit(1);
    });

    function startSession(socket: WebSocket) {
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.setEncoding("utf8");


      ptySession = spawnPty(
        (data) => {
          // Only write to host terminal if not suppressed (during remote resize repaint)
          if (!suppressHostOutput) {
            process.stdout.write(data);
          }
          // Always forward to web clients
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(
              JSON.stringify({
                type: "terminal_data",
                payload: { data },
              })
            );
          }
        },
        (exitCode) => {
          console.log(`\nLocal shell exited with code ${exitCode}. Ending session.`);
          cleanup();
          process.exit(exitCode);
        }
      );

      let hostCmdBuf = "";
      let isHostSafetyMode = false;

      process.stdin.on("data", (key: string) => {
        // Ctrl+] (\x1d) escape sequence to exit lmesh share session
        if (key === "\x1d") {
          process.stderr.write("\n\x1b[33m[lmesh] Exiting session via Ctrl+]...\x1b[0m\n");
          cleanup();
          process.exit(0);
        }

        // Ctrl+S (\x13) escape sequence to toggle Safety Mode (redacting audit logs)
        if (key === "\x13") {
          isHostSafetyMode = !isHostSafetyMode;
          if (isHostSafetyMode) {
            process.stderr.write("\r\n\x1b[33m[lmesh] Safety Mode: ON (Commands will be redacted in audit logs)\x1b[0m\r\n");
          } else {
            process.stderr.write("\r\n\x1b[32m[lmesh] Safety Mode: OFF (Normal audit logging)\x1b[0m\r\n");
          }
          return;
        }

        if (isPromptingForControl && pendingGrantClientId) {
          const char = key.toLowerCase();

          if (char === "y") {
            process.stderr.write(`\x1b[36my (Access granted)\x1b[0m\n`);
            socket.send(
              JSON.stringify({
                type: "control_grant",
                payload: { clientId: pendingGrantClientId },
              })
            );
            isPromptingForControl = false;
            pendingGrantClientId = null;
            if (ptySession) {
              ptySession.write("\r");
            }
          } else if (char === "n") {
            process.stderr.write(`\x1b[36mn (Access denied)\x1b[0m\n`);
            isPromptingForControl = false;
            pendingGrantClientId = null;
            if (ptySession) {
              ptySession.write("\r");
            }
          }
          return;
        }

        if (ptySession) {
          ptySession.write(key);
        }

        // Buffer host input to log clean host command
        if (key.includes("\r") || key.includes("\n")) {
          const cleanCmd = hostCmdBuf
            .replace(/\x1b\[[0-9;?]*[a-zA-Z]/g, "")
            .replace(/[\x00-\x1f\x7f-\x9f]/g, "")
            .trim();
          if (cleanCmd && socket.readyState === WebSocket.OPEN) {
            socket.send(
              JSON.stringify({
                type: "host_command",
                payload: { 
                  command: cleanCmd,
                  isSafetyMode: isHostSafetyMode
                },
              })
            );
          }
          hostCmdBuf = "";
        } else if (key === "\u007f" || key === "\b" || key === "\x08") {
          hostCmdBuf = hostCmdBuf.slice(0, -1);
        } else if (!key.startsWith("\x1b")) {
          // Append printable input characters (stripping non-printable control characters)
          const cleanKey = key.replace(/[\x00-\x1f\x7f-\x9f]/g, "");
          if (cleanKey) {
            hostCmdBuf += cleanKey;
          }
        }
      });

      process.stdout.on("resize", () => {
        const { columns, rows } = process.stdout;
        if (ptySession && columns && rows) {
          ptySession.resize(columns, rows);
        }
      });
    }

    function cleanup() {
      if (ptySession) {
        ptySession.kill();
      }
      process.stdin.setRawMode(false);
      process.stdin.pause();
    }
  });

program.parse(process.argv);

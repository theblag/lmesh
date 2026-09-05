import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import crypto from "crypto";
import { MemorySessionStore } from "./store.js";
import type { MessageEnvelope, Client } from "./types.js";
import { verifyToken } from "./auth.js";
import authRouter from "./routes/auth.js";
import dashboardRouter from "./routes/dashboard.js";
import { addParticipant, createDBSession, endDBSession, markParticipantLeft, updateParticipantRole, logCommand, cleanupOrphanedSessions } from "./db/index.js";
import { cleanAnsi } from "./utils.js";
import { pubClient, subClient, isRedisConnected } from "./redis.js";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const store = new MemorySessionStore();
const commandBuffers = new Map<string, string>();
const PORT = process.env.PORT || 3001;

// --- Redis Pub/Sub Message Listener ---
if (subClient) {
  subClient.on("message", async (channel, messageStr) => {
    if (channel.startsWith("lmesh:session:")) {
      const sessionId = channel.replace("lmesh:session:", "");
      try {
        const { message, excludeClientId } = JSON.parse(messageStr);
        const session = await store.getSession(sessionId);
        if (session) {
          const payloadStr = JSON.stringify(message);
          if (excludeClientId !== "host" && session.hostWs && session.hostWs.readyState === WebSocket.OPEN) {
            session.hostWs.send(payloadStr);
          }
          for (const [clientId, client] of session.clients.entries()) {
            if (clientId !== excludeClientId && client.ws.readyState === WebSocket.OPEN) {
              client.ws.send(payloadStr);
            }
          }
        }
      } catch (err) {
        console.error("[Redis Sub Handler Error]:", err);
      }
    }
  });
}

// --- Mount HTTP Routes ---
app.use("/api/auth", authRouter);
app.use("/api/dashboard", dashboardRouter);

// Public route to check if session exists and requires password
app.get("/api/sessions/:sessionCode/info", async (req, res) => {
  const { sessionCode } = req.params;
  const session = await store.getSession(sessionCode);
  if (!session) {
    return res.status(404).json({ error: "Session not found", exists: false });
  }
  res.json({
    exists: true,
    hasPassword: !!session.password,
    readOnly: !!session.readOnly,
    hostUserId: session.hostId,
  });
});

// --- Helper Utilities ---
function generateSessionId(): string {
  return crypto.randomBytes(6).toString("hex");
}
function generateClientId(): string {
  return crypto.randomBytes(8).toString("hex");
}
async function broadcastToSession(sessionId: string, message: MessageEnvelope, excludeClientId?: string) {
  const session = await store.getSession(sessionId);
  if (session) {
    const payloadStr = JSON.stringify(message);
    if (excludeClientId !== "host" && session.hostWs.readyState === WebSocket.OPEN) {
      session.hostWs.send(payloadStr);
    }
    for (const [clientId, client] of session.clients.entries()) {
      if (clientId !== excludeClientId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(payloadStr);
      }
    }
  }
  if (pubClient && isRedisConnected) {
    pubClient.publish(`lmesh:session:${sessionId}`, JSON.stringify({ message, excludeClientId })).catch(() => {});
  }
}

async function sendSessionUpdate(sessionId: string) {
  const session = await store.getSession(sessionId);
  if (!session) return;
  const collaborators = Array.from(session.clients.values()).map((c) => ({
    id: c.id,
    name: c.name,
    role: c.role,
    hasControl: session.controlHolderId === c.id,
  }));
  const updateMessage: MessageEnvelope = {
    type: "session_update",
    payload: {
      sessionId,
      controlHolderId: session.controlHolderId,
      collaborators,
    },
  };
  await broadcastToSession(sessionId, updateMessage);
}
// --- WebSocket Realtime Terminal Gateway ---

wss.on("connection", (ws: WebSocket) => {
  let currentSessionId: string | null = null;
  let currentClientId: string | null = null;
  let isHost = false;
  ws.on("message", async (data) => {
    try {
      const message: MessageEnvelope = JSON.parse(data.toString());
      switch (message.type) {
        case "session_create": {
          const sessionId = generateSessionId();
          const { password, readOnly, token } = message.payload || {};
          let hostUserId = "anonymous-host";
          let hostDbId: string | null = null;
          if (token) {
            const verified = verifyToken(token);
            if (verified) {
              hostUserId = verified.username;
              hostDbId = verified.id || null; //neon db uuid
            }
          }
          //In memory store
          await store.createSession(sessionId, hostUserId, ws, password, readOnly);
          //Neon DB Persistance
          await createDBSession(sessionId, hostDbId, !!readOnly, !!password);
          if (subClient) {
            subClient.subscribe(`lmesh:session:${sessionId}`).catch(() => {});
          }
          currentSessionId = sessionId;
          isHost = true;
          currentClientId = "host";
          ws.send(
            JSON.stringify({
              type: "session_created",
              payload: { sessionId },
            })
          );
          console.log(`Session created by @${hostUserId}: ${sessionId}`);
          break;
        }
        case "session_join": {
          const { sessionId, name, password } = message.payload || {};
          const session = await store.getSession(sessionId);
          if (!session) {
            ws.send(JSON.stringify({ type: "error", payload: { message: "Session not found" } }));
            return;
          }
          if (session.password && session.password !== password) {
            ws.send(JSON.stringify({ type: "error", payload: { message: "Invalid session password" } }));
            return;
          }
          if (subClient) {
            subClient.subscribe(`lmesh:session:${sessionId}`).catch(() => {});
          }
          const clientId = generateClientId();
          currentSessionId = sessionId;
          currentClientId = clientId;
          isHost = false;
          const newClient: Client = {
            id: clientId,
            ws,
            role: "viewer",
            name: name || `Guest-${clientId.slice(0, 4)}`,
          };
          await store.addClient(sessionId, newClient);
          await addParticipant(sessionId, newClient.name, null, 'viewer');
          ws.send(
            JSON.stringify({
              type: "session_joined",
              payload: { sessionId, clientId, role: newClient.role },
            })
          );
          console.log(`Client ${newClient.name} (${clientId}) joined session: ${sessionId}`);
          await sendSessionUpdate(sessionId);
          break;
        }
        case "terminal_resize": {
          if (!currentSessionId) return;
          const session = await store.getSession(currentSessionId);
          if (!session) return;
          const { cols, rows } = message.payload || {};
          if (cols && rows && session.hostWs.readyState === WebSocket.OPEN) {
            session.hostWs.send(
              JSON.stringify({
                type: "terminal_resize",
                payload: { cols, rows },
              })
            );
          }
          break;
        }
        case "host_command": {
          if (!currentSessionId) return;
          const { command } = message.payload || {};
          const cleaned = cleanAnsi(command);
          if (cleaned) {
            const session = await store.getSession(currentSessionId);
            const hostName = session?.hostId ? session.hostId.replace(/^@+/, '') : "Host";
            console.log(`[Server] Received host_command for session ${currentSessionId} from ${hostName}: "${cleaned}"`);
            logCommand(currentSessionId, hostName, cleaned)
              .then((success) => console.log(`[Server] DB log success: ${success}`))
              .catch((err) => console.error("[Server] DB log error:", err));
          }
          break;
        }

        case "terminal_data": {
          if (!currentSessionId || !currentClientId) return;
          const session = await store.getSession(currentSessionId);
          if (!session) return;

          const dataStr = message.payload?.data || "";

          // Only buffer command logging for collaborators (non-hosts), 
          // because isHost terminal_data is raw PTY stdout stream with ANSI codes.
          if (dataStr && !isHost) {
            const clientName = session.clients.get(currentClientId)?.name || "Collaborator";
            const currentBuf = commandBuffers.get(currentClientId) || "";
            if (dataStr.includes("\r") || dataStr.includes("\n")) {
              const rawCommand = (currentBuf + dataStr).replace(/[\r\n]+/g, "").trim();
              const fullCommand = cleanAnsi(rawCommand);
              if (fullCommand) {
                logCommand(currentSessionId, clientName, fullCommand).catch(console.error);
              }
              commandBuffers.set(currentClientId, "");
            } else if (dataStr === "\u007f" || dataStr === "\b") {
              commandBuffers.set(currentClientId, currentBuf.slice(0, -1));
            } else {
              commandBuffers.set(currentClientId, currentBuf + dataStr);
            }
          }

          if (isHost) {
            await broadcastToSession(
              currentSessionId,
              {
                type: "terminal_data",
                payload: message.payload,
              },
              "host"
            );
          } else {
            if (session.controlHolderId === currentClientId) {
              if (session.hostWs.readyState === WebSocket.OPEN) {
                session.hostWs.send(
                  JSON.stringify({
                    type: "terminal_data",
                    payload: {
                      clientId: currentClientId,
                      data: message.payload.data,
                    },
                  })
                );
              }
            }
          }
          break;
        }

        case "control_request": {
          if (isHost || !currentSessionId || !currentClientId) return;
          const session = await store.getSession(currentSessionId);
          if (!session) return;
          if (session.readOnly) {
            ws.send(
              JSON.stringify({
                type: "error",
                payload: { message: "Cannot request control. This session is read-only." },
              })
            );
            return;
          }
          if (session.hostWs.readyState === WebSocket.OPEN) {
            session.hostWs.send(
              JSON.stringify({
                type: "control_request",
                payload: { clientId: currentClientId },
              })
            );
          }
          break;
        }
        case "control_grant": {
          if (!isHost || !currentSessionId) return;
          const { clientId } = message.payload || {};
          const session = await store.getSession(currentSessionId);
          if (!session) return;
          if (session.clients.has(clientId)) {
            const client = session.clients.get(clientId)!;
            client.role = "collaborator";
            await store.setControlHolder(currentSessionId, clientId);
            await updateParticipantRole(currentSessionId, client.name, 'collaborator');
            console.log(`Control granted to ${client.name} (${clientId}) in session ${currentSessionId}`);
            await sendSessionUpdate(currentSessionId);
          }
          break;
        }
        case "control_revoke": {
          if (!currentSessionId) return;
          const session = await store.getSession(currentSessionId);
          if (!session) return;
          const isControlHolder = currentClientId && session.controlHolderId === currentClientId;
          if (!isHost && !isControlHolder) return;

          const oldHolderId = session.controlHolderId;
          if (oldHolderId && session.clients.has(oldHolderId)) {
            const client = session.clients.get(oldHolderId)!;
            await updateParticipantRole(currentSessionId, client.name, 'viewer');
          }
          await store.setControlHolder(currentSessionId, null);
          console.log(`Control released/revoked in session ${currentSessionId}`);
          await sendSessionUpdate(currentSessionId);
          break;
        }
        default:
          console.warn(`Unknown message type: ${message.type}`);
      }
    } catch (err) {
      console.error("Error handling message: ", err);
      ws.send(JSON.stringify({ type: "error", payload: { message: "Invalid payload" } }));
    }
  });
  ws.on("close", async () => {
    if (!currentSessionId) return;
    if (isHost) {
      console.log(`Host disconnected. Terminating session ${currentSessionId}`);
      await broadcastToSession(
        currentSessionId,
        {
          type: "error",
          payload: { message: "Host disconnected. Session ended." },
        },
        "host"
      );
      const session = await store.getSession(currentSessionId);
      if (session) {
        for (const client of session.clients.values()) {
          client.ws.close();
        }
      }
      await store.deleteSession(currentSessionId);

      //Mark session as ended in Neon DB
      await endDBSession(currentSessionId);

    } else if (currentClientId) {
      console.log(`Client ${currentClientId} disconnected from session ${currentSessionId}`);
      const session = await store.getSession(currentSessionId);
      if (session && session.clients.has(currentClientId)) {
        const client = session.clients.get(currentClientId)!;

        // Mark participant as left in Neon DB using their stored name
        await markParticipantLeft(currentSessionId, client.name);

        if (session.controlHolderId === currentClientId) {
          await store.setControlHolder(currentSessionId, null);
        }
        await store.removeClient(currentSessionId, currentClientId);
        await sendSessionUpdate(currentSessionId);
      }
    }


  });
});
server.listen(PORT, async () => {
  console.log(`LMESH Relay Server running on port ${PORT}`);
  await cleanupOrphanedSessions();
});
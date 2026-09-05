import type { Session, Client } from './types.js';

export interface SessionStore {
    createSession(id: string, hostId: string, hostWs: any, password?: string, readOnly?: boolean): Promise<Session>;

    getSession(id: string): Promise<Session | null>;
    deleteSession(id: string): Promise<boolean>;
    addClient(sessionId: string, client: Client): Promise<boolean>;
    removeClient(sessionId: string, clientId: string): Promise<boolean>;
    setControlHolder(sessionId: string, clientId: string | null): Promise<boolean>;
}

export class MemorySessionStore implements SessionStore {
    private sessions = new Map<string, Session>();
    async createSession(id: string, hostId: string, hostWs: any, password?: string, readOnly?: boolean): Promise<Session> {
        const session: Session = {
            id,
            hostId,
            hostWs,
            password,
            readOnly,
            clients: new Map<string, Client>(),
            controlHolderId: null,
        };
        this.sessions.set(id, session);
        return session;
    }

    async getSession(id: string): Promise<Session | null> {
        return this.sessions.get(id) || null;
    }
    async deleteSession(id: string): Promise<boolean> {
        return this.sessions.delete(id);
    }
    async addClient(sessionId: string, client: Client): Promise<boolean> {
        const session = this.sessions.get(sessionId);
        if (!session) return false;
        session.clients.set(client.id, client);
        return true;
    }
    async removeClient(sessionId: string, clientId: string): Promise<boolean> {
        const session = this.sessions.get(sessionId);
        if (!session) return false;
        return session.clients.delete(clientId);
    }
    async setControlHolder(sessionId: string, clientId: string | null): Promise<boolean> {
        const session = this.sessions.get(sessionId);
        if (!session) return false;
        session.controlHolderId = clientId;
        return true;
    }

}
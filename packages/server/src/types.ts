import { WebSocket } from 'ws';

export type Role = 'host' | 'collaborator' | 'viewer';

export interface Client {
  id: string;
  ws: WebSocket;
  role: Role;
  name: string;
}

export interface Session {
  id: string;
  hostId: string;
  hostWs: WebSocket;
  password?: string | undefined;
  readOnly?: boolean | undefined;
  clients: Map<string, Client>; // clientId -> Client
  controlHolderId: string | null; // clientId of current controller, or null (means host has it)
}

// WebSocket Message Types
export type MessageType =
  | 'session_create'
  | 'session_created'
  | 'session_join'
  | 'session_joined'
  | 'session_update'
  | 'terminal_data'
  | 'terminal_resize'
  | 'control_request'
  | 'control_grant'
  | 'control_deny'
  | 'control_revoke'
  | 'host_command'
  | 'error';
export interface MessageEnvelope {
  type: MessageType;
  payload: any;
}

export interface DBUserRow {
  id: string,
  github_id: string | number;
  username: string;
  name: string | null;
  avatar_url: string | "";
  email: string | null;
  created_at?: Date;
  updated_at?:Date;
}

export interface DBSessionRow {
  id: string;
  session_code: string;
  host_id: string | null;
  is_readonly: boolean;
  has_password: boolean;
  password_hash: string | null;
  status: 'active' | 'ended';
  created_at: Date;
  ended_at: Date | null;
}
export interface DBParticipantRow {
  id: string;
  session_id: string;
  user_id: string | null;
  display_name: string;
  role: 'host' | 'collaborator' | 'viewer';
  joined_at: Date;
  left_at: Date | null;
}
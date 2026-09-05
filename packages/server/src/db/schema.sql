CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_id BIGINT UNIQUE NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_code VARCHAR(32) UNIQUE NOT NULL, -- e.g. "x7k2m9p"
  host_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_readonly BOOLEAN DEFAULT FALSE,
  has_password BOOLEAN DEFAULT FALSE,
  password_hash VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'ended'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE session_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL if guest
  display_name VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'viewer', -- 'host', 'collaborator', 'viewer'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  left_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE command_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  executor_name VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL if guest
  command_text TEXT NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


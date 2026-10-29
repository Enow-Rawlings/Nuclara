-- =============================================================================
-- Migration 009: Live chat / customer support
-- =============================================================================

CREATE TYPE conversation_status AS ENUM ('open', 'pending', 'closed');

CREATE TABLE conversations (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id       UUID REFERENCES customers(id) ON DELETE SET NULL,
  assigned_agent_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  status            conversation_status NOT NULL DEFAULT 'open',
  -- Tags for triage (e.g. 'order', 'product', 'general')
  tags              TEXT[] NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conversations_customer ON conversations(customer_id);
CREATE INDEX idx_conversations_agent    ON conversations(assigned_agent_id);
CREATE INDEX idx_conversations_status   ON conversations(status, updated_at DESC);

CREATE TABLE messages (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id  UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id        UUID,   -- customer.id or admin_user.id depending on sender_type
  sender_type      TEXT NOT NULL CHECK (sender_type IN ('customer', 'admin', 'system')),
  content          TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  -- Internal notes are only visible to admin users
  is_internal      BOOLEAN NOT NULL DEFAULT FALSE,
  -- Abuse/moderation flag
  is_flagged       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);

-- Update conversation.updated_at when a new message arrives
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE conversations SET updated_at = NOW() WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_messages_update_conversation
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_timestamp();

COMMENT ON TABLE  conversations IS 'Support conversations. Support scripts must not offer medical advice or make unverified product claims.';
COMMENT ON COLUMN messages.is_internal IS 'TRUE = admin-only note, never visible to the customer.';

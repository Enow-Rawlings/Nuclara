-- =============================================================================
-- Migration 010: Audit log
-- Searchable record of sensitive admin actions.
-- Rows are immutable — never update or delete.
-- =============================================================================

CREATE TABLE audit_logs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Actor — who performed the action
  actor_id     UUID,          -- admin_users.id or customers.id
  actor_type   TEXT NOT NULL CHECK (actor_type IN ('admin', 'customer', 'system')),
  actor_email  CITEXT,        -- snapshot at time of action
  -- What happened
  action       TEXT NOT NULL CHECK (char_length(action) BETWEEN 1 AND 100),
  -- What was affected
  entity_type  TEXT CHECK (char_length(entity_type) <= 100),
  entity_id    TEXT CHECK (char_length(entity_id) <= 200),
  -- Safe additional context — NEVER log passwords, tokens, or secrets
  metadata     JSONB,
  -- Request tracing
  ip_address   INET,
  user_agent   TEXT CHECK (char_length(user_agent) <= 500),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_actor      ON audit_logs(actor_id, created_at DESC);
CREATE INDEX idx_audit_logs_entity     ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action     ON audit_logs(action, created_at DESC);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

COMMENT ON TABLE  audit_logs IS 'Immutable audit trail. Never update or delete rows. Never log passwords, tokens, or sensitive personal data.';
COMMENT ON COLUMN audit_logs.metadata IS 'Safe contextual data only. Reviewed against PII and secret logging policy before insertion.';

-- =============================================================================
-- Migration 003: Customer accounts
-- =============================================================================

CREATE TYPE customer_account_status AS ENUM (
  'active',
  'suspended',
  'pending_verification'
);

CREATE TABLE customers (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id     UUID NOT NULL UNIQUE,    -- references auth.users.id (Supabase Auth)
  email            CITEXT NOT NULL UNIQUE,
  name             TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  account_status   customer_account_status NOT NULL DEFAULT 'active',
  -- Contact preferences (nullable — only store what the customer consents to)
  phone            TEXT CHECK (char_length(phone) <= 30),
  -- Marketing consent — must be explicit, never assumed
  marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,
  marketing_consent_at TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_auth_user_id ON customers(auth_user_id);
CREATE INDEX idx_customers_email        ON customers(email);

COMMENT ON TABLE  customers IS 'Customer accounts. Collect only necessary personal data.';
COMMENT ON COLUMN customers.marketing_consent IS 'Explicit opt-in only. Never default to TRUE.';

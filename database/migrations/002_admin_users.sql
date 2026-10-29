-- =============================================================================
-- Migration 002: Admin users and roles
-- Must come before products/orders since those reference admin actor IDs.
-- =============================================================================

CREATE TYPE admin_role AS ENUM (
  'owner',
  'catalogue_manager',
  'order_manager',
  'support_agent',
  'seo_editor'
);

CREATE TABLE admin_users (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id     UUID NOT NULL UNIQUE,    -- references auth.users.id (Supabase Auth)
  email            CITEXT NOT NULL UNIQUE,
  name             TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  role             admin_role NOT NULL DEFAULT 'support_agent',
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  invited_by       UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_users_auth_user_id ON admin_users(auth_user_id);
CREATE INDEX idx_admin_users_email        ON admin_users(email);

COMMENT ON TABLE  admin_users IS 'Admin application users. auth_user_id links to Supabase Auth.';
COMMENT ON COLUMN admin_users.role IS 'Role determines which API endpoints and admin actions are permitted. Enforced server-side.';

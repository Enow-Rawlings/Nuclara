-- =============================================================================
-- Migration 011: Store settings
-- Key/value store for operational configuration.
-- Secrets must NEVER be stored here — use environment variables.
-- =============================================================================

CREATE TABLE store_settings (
  key          TEXT PRIMARY KEY CHECK (char_length(key) BETWEEN 1 AND 100),
  value        JSONB NOT NULL,
  description  TEXT,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by   UUID REFERENCES admin_users(id) ON DELETE SET NULL
);

-- Seed safe defaults
INSERT INTO store_settings (key, value, description) VALUES
  ('store_name',         '"Nuclara"',                        'Public store name'),
  ('store_currency',     '"EUR"',                            'Default display currency (ISO 4217)'),
  ('store_locale',       '"en-GB"',                         'Default locale for formatting'),
  ('support_email',      '"support@nuclara.com"',           'Customer-facing support email'),
  ('support_hours',      '"Monday – Friday, 9:00–17:00 UTC"', 'Published support availability'),
  ('order_request_open', 'true',                             'Whether the storefront accepts new order requests'),
  ('maintenance_mode',   'false',                            'When true, storefront shows maintenance notice');

COMMENT ON TABLE  store_settings IS 'Operational key/value settings. Secrets must never be stored here.';

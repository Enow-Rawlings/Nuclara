-- =============================================================================
-- Migration 005: Products — core table and state machine
-- =============================================================================

-- Product publication state machine:
--   draft → pending_review → approved → published
--   Any state → archived | blocked
--   blocked → pending_review (re-review required)
CREATE TYPE product_status AS ENUM (
  'draft',
  'pending_review',
  'approved',
  'published',
  'archived',
  'blocked'
);

-- Compliance review state — separate from publication status.
-- A product may be approved for publication only when this is 'approved'.
CREATE TYPE compliance_status AS ENUM (
  'not_submitted',
  'pending_review',
  'approved',
  'rejected',
  'expired',
  'requires_resubmission'
);

CREATE TABLE products (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                  TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 300),
  slug                  TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  sku                   TEXT NOT NULL UNIQUE CHECK (char_length(sku) BETWEEN 1 AND 100),

  -- Approved, client-reviewed descriptions only.
  -- long_description must not contain dosage, treatment, or human-use claims.
  short_description     TEXT CHECK (char_length(short_description) <= 500),
  long_description      TEXT CHECK (char_length(long_description) <= 10000),

  -- Internal compliance notes — NEVER exposed to the public API
  internal_notes        TEXT,

  price                 NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  currency              CHAR(3) NOT NULL DEFAULT 'EUR', -- ISO 4217

  status                product_status NOT NULL DEFAULT 'draft',
  compliance_status     compliance_status NOT NULL DEFAULT 'not_submitted',

  -- Inventory
  stock_quantity        INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  low_stock_threshold   INTEGER NOT NULL DEFAULT 5 CHECK (low_stock_threshold >= 0),

  -- Visibility override — even published products can be hidden from navigation
  is_visible            BOOLEAN NOT NULL DEFAULT FALSE,

  -- Compliance reviewer tracking
  compliance_reviewed_by  UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  compliance_reviewed_at  TIMESTAMPTZ,
  compliance_evidence_ref TEXT CHECK (char_length(compliance_evidence_ref) <= 500),

  -- Publishing audit
  published_by          UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  published_at          TIMESTAMPTZ,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX idx_products_slug             ON products(slug);
CREATE INDEX idx_products_sku              ON products(sku);
CREATE INDEX idx_products_status           ON products(status);
CREATE INDEX idx_products_compliance       ON products(compliance_status);
CREATE INDEX idx_products_published        ON products(status, is_visible) WHERE status = 'published';
-- Trigram index for name search
CREATE INDEX idx_products_name_trgm        ON products USING GIN (name gin_trgm_ops);

COMMENT ON TABLE  products IS 'Product catalogue. Status machine and compliance gate enforced here and at the API layer.';
COMMENT ON COLUMN products.internal_notes IS 'Admin-only. Must never be returned by public API endpoints.';
COMMENT ON COLUMN products.compliance_evidence_ref IS 'Reference to client-held compliance documentation. Store reference only, not the document.';

-- ─── Product ↔ Category (many-to-many) ────────────────────────────────────────

CREATE TABLE product_categories (
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

CREATE INDEX idx_product_categories_category ON product_categories(category_id);

-- ─── Product media ─────────────────────────────────────────────────────────────

CREATE TABLE product_media (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id            UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  cloudinary_public_id  TEXT NOT NULL,
  cloudinary_url        TEXT NOT NULL,
  alt_text              TEXT NOT NULL DEFAULT '' CHECK (char_length(alt_text) <= 200),
  display_order         SMALLINT NOT NULL DEFAULT 0,
  width                 INTEGER,
  height                INTEGER,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_media_product_id ON product_media(product_id, display_order);

COMMENT ON COLUMN product_media.alt_text IS 'Required for accessibility. Must describe the image without adding unsupported product claims.';

-- ─── Market eligibility rules ──────────────────────────────────────────────────

CREATE TYPE market_eligibility AS ENUM (
  'approved',
  'blocked',
  'pending_review',
  'not_applicable'
);

CREATE TABLE product_market_rules (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id        UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  market_code       TEXT NOT NULL CHECK (char_length(market_code) BETWEEN 2 AND 10),
  eligibility_status market_eligibility NOT NULL DEFAULT 'pending_review',
  reviewed_by       UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  reviewed_at       TIMESTAMPTZ,
  -- Reference to client-held compliance evidence — never store the document itself
  evidence_reference TEXT CHECK (char_length(evidence_reference) <= 500),
  expires_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (product_id, market_code)
);

CREATE INDEX idx_market_rules_product    ON product_market_rules(product_id);
CREATE INDEX idx_market_rules_market     ON product_market_rules(market_code, eligibility_status);

COMMENT ON TABLE  product_market_rules IS 'Per-market eligibility gate. A product is only visible/orderable for a market when eligibility_status = approved.';
COMMENT ON COLUMN product_market_rules.evidence_reference IS 'Reference key only — actual compliance documentation held by the client.';

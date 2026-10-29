-- =============================================================================
-- Migration 008: SEO records
-- One SEO record per entity (product, category, or static page).
-- =============================================================================

CREATE TABLE seo_records (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type       TEXT NOT NULL CHECK (entity_type IN ('product', 'category', 'page')),
  entity_id         UUID NOT NULL,
  seo_title         TEXT CHECK (char_length(seo_title) <= 70),
  meta_description  TEXT CHECK (char_length(meta_description) <= 160),
  -- Canonical URL override — if NULL, the API derives a canonical from the entity slug
  canonical_url     TEXT,
  -- 'index,follow' is the safe default; noindex must be intentional
  robots_directive  TEXT NOT NULL DEFAULT 'index,follow'
                    CHECK (robots_directive IN ('index,follow', 'noindex,follow', 'noindex,nofollow')),
  social_image_url  TEXT,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by        UUID REFERENCES admin_users(id) ON DELETE SET NULL,

  -- One SEO record per entity
  UNIQUE (entity_type, entity_id)
);

CREATE INDEX idx_seo_records_entity ON seo_records(entity_type, entity_id);

COMMENT ON TABLE  seo_records IS 'SEO metadata per entity. Robots directive defaults to index,follow; noindex requires explicit admin action.';
COMMENT ON COLUMN seo_records.canonical_url IS 'Leave NULL to auto-derive. Only set if a non-standard canonical is required.';

-- ─── Redirect manager ─────────────────────────────────────────────────────────

CREATE TABLE redirects (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_path     TEXT NOT NULL UNIQUE CHECK (char_length(from_path) BETWEEN 1 AND 500),
  to_path       TEXT NOT NULL CHECK (char_length(to_path) BETWEEN 1 AND 500),
  status_code   SMALLINT NOT NULL DEFAULT 301 CHECK (status_code IN (301, 302)),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_by    UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_redirects_from_path ON redirects(from_path) WHERE is_active = TRUE;

COMMENT ON TABLE redirects IS 'Slug redirect rules. Prevents redirect loops — application layer must validate before inserting.';

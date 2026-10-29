-- =============================================================================
-- Migration 004: Product categories
-- =============================================================================

CREATE TABLE categories (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  slug         TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description  TEXT CHECK (char_length(description) <= 2000),
  image_url    TEXT,
  parent_id    UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_visible   BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_slug      ON categories(slug);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_visible   ON categories(is_visible);

COMMENT ON TABLE categories IS 'Product categories. Supports a single level of nesting via parent_id.';
COMMENT ON COLUMN categories.slug IS 'URL-safe identifier. Pattern enforced: lowercase letters, digits, hyphens only.';

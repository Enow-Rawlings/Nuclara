-- =============================================================================
-- Migration 014: Content blocks
-- Editable site-wide text blocks managed via the admin Content page.
-- =============================================================================

CREATE TABLE IF NOT EXISTS content_blocks (
  id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  key         TEXT         NOT NULL UNIQUE,
  label       TEXT         NOT NULL,
  value       TEXT         NOT NULL DEFAULT '',
  type        TEXT         NOT NULL DEFAULT 'text'
                           CHECK (type IN ('text', 'richtext', 'url')),
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_by  UUID         REFERENCES admin_users(id) ON DELETE SET NULL
);

-- Seed with initial content blocks
INSERT INTO content_blocks (key, label, value, type) VALUES
  ('homepage_announcement', 'Homepage announcement bar',    '',                                           'text'),
  ('homepage_hero_eyebrow', 'Hero eyebrow label',           'Research Grade Peptides',                    'text'),
  ('homepage_hero_heading', 'Hero main heading',            'Precision peptides for serious research.',   'text'),
  ('homepage_hero_subtext', 'Hero subtext paragraph',       'Nuclara supplies synthetic peptides to qualified researchers and laboratories. Every product is clearly documented, compliance-gated, and supplied with full transparency.', 'richtext'),
  ('research_notice',       'Research-only disclaimer',     'All products on this website are supplied for research and laboratory use only. They are not intended for human or veterinary use.', 'richtext'),
  ('contact_intro',         'Contact page intro text',      'Have a product question, need compliance guidance, or need help with an order? We''re here.', 'text')
ON CONFLICT (key) DO NOTHING;

-- Updated_at trigger
CREATE TRIGGER set_content_blocks_updated_at
  BEFORE UPDATE ON content_blocks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS: service role only (admin API uses service role key)
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON content_blocks
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- =============================================================================
-- Migration 015: Blog posts
-- Supports research-focused articles, news, and compliance updates.
-- =============================================================================

CREATE TYPE blog_post_status AS ENUM ('draft', 'published', 'archived');

CREATE TABLE blog_posts (
  id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug            TEXT         NOT NULL UNIQUE CHECK (char_length(slug) BETWEEN 1 AND 250),
  title           TEXT         NOT NULL CHECK (char_length(title) BETWEEN 1 AND 300),
  excerpt         TEXT         CHECK (char_length(excerpt) <= 500),
  content         TEXT         NOT NULL DEFAULT '',
  cover_image_url TEXT,
  tags            TEXT[]       NOT NULL DEFAULT '{}',
  status          blog_post_status NOT NULL DEFAULT 'draft',
  -- SEO
  seo_title       TEXT         CHECK (char_length(seo_title) <= 70),
  seo_description TEXT         CHECK (char_length(seo_description) <= 160),
  -- Authorship
  author_id       UUID         REFERENCES admin_users(id) ON DELETE SET NULL,
  author_name     TEXT,
  -- Timestamps
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_blog_posts_status       ON blog_posts(status);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX idx_blog_posts_slug         ON blog_posts(slug);

-- Updated_at trigger
CREATE TRIGGER set_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS: public can read published posts; service role has full access
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published posts" ON blog_posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Service role full access" ON blog_posts
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

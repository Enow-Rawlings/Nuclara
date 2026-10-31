-- =============================================================================
-- Migration 017: RLS policies for seo_records and blog_posts
-- These tables were created before migration 016 added service_role
-- write policies, so they need their own policies.
-- =============================================================================

-- seo_records: public read, service role full access
ALTER TABLE seo_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_seo_records"
  ON seo_records FOR SELECT
  USING (true);

CREATE POLICY "service_role_full_access_seo_records"
  ON seo_records FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- blog_posts: public read for published posts (already handled in 015),
-- service role full access for admin operations
CREATE POLICY "service_role_full_access_blog_posts"
  ON blog_posts FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- redirects: service role full access
ALTER TABLE redirects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_full_access_redirects"
  ON redirects FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

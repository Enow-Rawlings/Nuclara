-- =============================================================================
-- Seed 001: Demo categories
-- DEVELOPMENT ONLY — never run against production.
-- =============================================================================

INSERT INTO categories (id, name, slug, description, is_visible, sort_order) VALUES
  (
    'b1000000-0000-0000-0000-000000000001',
    'Research Peptides',
    'research-peptides',
    'Synthetic peptides supplied for laboratory and research purposes. Not intended for human use.',
    TRUE, 1
  ),
  (
    'b1000000-0000-0000-0000-000000000002',
    'Growth Factor Peptides',
    'growth-factor-peptides',
    'Peptides associated with cellular growth and differentiation research.',
    TRUE, 2
  ),
  (
    'b1000000-0000-0000-0000-000000000003',
    'Cosmetic Peptides',
    'cosmetic-peptides',
    'Peptides used in cosmetic formulation research and development.',
    TRUE, 3
  ),
  (
    'b1000000-0000-0000-0000-000000000004',
    'Nootropic Peptides',
    'nootropic-peptides',
    'Peptides researched in the context of cognitive neuroscience.',
    TRUE, 4
  ),
  (
    'b1000000-0000-0000-0000-000000000005',
    'Analgesic Peptides',
    'analgesic-peptides',
    'Peptides studied for pain-pathway research in laboratory settings.',
    TRUE, 5
  )
ON CONFLICT (slug) DO NOTHING;

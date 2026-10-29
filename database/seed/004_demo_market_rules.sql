-- =============================================================================
-- Seed 004: Market eligibility rules for demo products
-- DEVELOPMENT ONLY
--
-- EU: most products 'approved' so local dev has data to render.
-- DE/AU/CA: all 'pending_review' — requires specialist review before enabling.
-- Dermorphin (a0120000-...): 'blocked' everywhere — demonstrates the block gate.
--
-- ⚠️  These 'approved' EU records are demo-only.
--     Reset to 'pending_review' before any production deployment.
-- =============================================================================

-- ─── EU ───────────────────────────────────────────────────────────────────────
INSERT INTO product_market_rules (product_id, market_code, eligibility_status) VALUES
  ('a0010000-0000-0000-0000-000000000001', 'EU', 'approved'),
  ('a0020000-0000-0000-0000-000000000002', 'EU', 'approved'),
  ('a0030000-0000-0000-0000-000000000003', 'EU', 'approved'),
  ('a0040000-0000-0000-0000-000000000004', 'EU', 'approved'),
  ('a0050000-0000-0000-0000-000000000005', 'EU', 'approved'),
  ('a0060000-0000-0000-0000-000000000006', 'EU', 'approved'),
  ('a0070000-0000-0000-0000-000000000007', 'EU', 'approved'),
  ('a0080000-0000-0000-0000-000000000008', 'EU', 'approved'),
  ('a0090000-0000-0000-0000-000000000009', 'EU', 'approved'),
  ('a00a0000-0000-0000-0000-00000000000a', 'EU', 'approved'),
  ('a00b0000-0000-0000-0000-00000000000b', 'EU', 'approved'),
  ('a00c0000-0000-0000-0000-00000000000c', 'EU', 'approved'),
  ('a00d0000-0000-0000-0000-00000000000d', 'EU', 'approved'),
  ('a00e0000-0000-0000-0000-00000000000e', 'EU', 'approved'),
  ('a00f0000-0000-0000-0000-00000000000f', 'EU', 'approved'),
  ('a0100000-0000-0000-0000-000000000010', 'EU', 'approved'),
  ('a0110000-0000-0000-0000-000000000011', 'EU', 'pending_review'),
  ('a0120000-0000-0000-0000-000000000012', 'EU', 'blocked'),
  ('a0130000-0000-0000-0000-000000000013', 'EU', 'approved'),
  ('a0140000-0000-0000-0000-000000000014', 'EU', 'approved')
ON CONFLICT (product_id, market_code) DO NOTHING;

-- ─── DE (Germany — all pending specialist review) ─────────────────────────────
INSERT INTO product_market_rules (product_id, market_code, eligibility_status) VALUES
  ('a0010000-0000-0000-0000-000000000001', 'DE', 'pending_review'),
  ('a0020000-0000-0000-0000-000000000002', 'DE', 'pending_review'),
  ('a0030000-0000-0000-0000-000000000003', 'DE', 'pending_review'),
  ('a0040000-0000-0000-0000-000000000004', 'DE', 'pending_review'),
  ('a0050000-0000-0000-0000-000000000005', 'DE', 'pending_review'),
  ('a0060000-0000-0000-0000-000000000006', 'DE', 'pending_review'),
  ('a0070000-0000-0000-0000-000000000007', 'DE', 'pending_review'),
  ('a0080000-0000-0000-0000-000000000008', 'DE', 'pending_review'),
  ('a0090000-0000-0000-0000-000000000009', 'DE', 'pending_review'),
  ('a00a0000-0000-0000-0000-00000000000a', 'DE', 'pending_review'),
  ('a00b0000-0000-0000-0000-00000000000b', 'DE', 'pending_review'),
  ('a00c0000-0000-0000-0000-00000000000c', 'DE', 'pending_review'),
  ('a00d0000-0000-0000-0000-00000000000d', 'DE', 'pending_review'),
  ('a00e0000-0000-0000-0000-00000000000e', 'DE', 'pending_review'),
  ('a00f0000-0000-0000-0000-00000000000f', 'DE', 'pending_review'),
  ('a0100000-0000-0000-0000-000000000010', 'DE', 'pending_review'),
  ('a0110000-0000-0000-0000-000000000011', 'DE', 'blocked'),
  ('a0120000-0000-0000-0000-000000000012', 'DE', 'blocked'),
  ('a0130000-0000-0000-0000-000000000013', 'DE', 'pending_review'),
  ('a0140000-0000-0000-0000-000000000014', 'DE', 'pending_review')
ON CONFLICT (product_id, market_code) DO NOTHING;

-- ─── AU (Australia — all pending specialist review) ───────────────────────────
INSERT INTO product_market_rules (product_id, market_code, eligibility_status) VALUES
  ('a0010000-0000-0000-0000-000000000001', 'AU', 'pending_review'),
  ('a0020000-0000-0000-0000-000000000002', 'AU', 'pending_review'),
  ('a0030000-0000-0000-0000-000000000003', 'AU', 'pending_review'),
  ('a0040000-0000-0000-0000-000000000004', 'AU', 'pending_review'),
  ('a0050000-0000-0000-0000-000000000005', 'AU', 'pending_review'),
  ('a0060000-0000-0000-0000-000000000006', 'AU', 'pending_review'),
  ('a0070000-0000-0000-0000-000000000007', 'AU', 'pending_review'),
  ('a0080000-0000-0000-0000-000000000008', 'AU', 'pending_review'),
  ('a0090000-0000-0000-0000-000000000009', 'AU', 'pending_review'),
  ('a00a0000-0000-0000-0000-00000000000a', 'AU', 'pending_review'),
  ('a00b0000-0000-0000-0000-00000000000b', 'AU', 'pending_review'),
  ('a00c0000-0000-0000-0000-00000000000c', 'AU', 'pending_review'),
  ('a00d0000-0000-0000-0000-00000000000d', 'AU', 'pending_review'),
  ('a00e0000-0000-0000-0000-00000000000e', 'AU', 'pending_review'),
  ('a00f0000-0000-0000-0000-00000000000f', 'AU', 'pending_review'),
  ('a0100000-0000-0000-0000-000000000010', 'AU', 'pending_review'),
  ('a0110000-0000-0000-0000-000000000011', 'AU', 'blocked'),
  ('a0120000-0000-0000-0000-000000000012', 'AU', 'blocked'),
  ('a0130000-0000-0000-0000-000000000013', 'AU', 'pending_review'),
  ('a0140000-0000-0000-0000-000000000014', 'AU', 'pending_review')
ON CONFLICT (product_id, market_code) DO NOTHING;

-- ─── CA (Canada — all pending specialist review) ──────────────────────────────
INSERT INTO product_market_rules (product_id, market_code, eligibility_status) VALUES
  ('a0010000-0000-0000-0000-000000000001', 'CA', 'pending_review'),
  ('a0020000-0000-0000-0000-000000000002', 'CA', 'pending_review'),
  ('a0030000-0000-0000-0000-000000000003', 'CA', 'pending_review'),
  ('a0040000-0000-0000-0000-000000000004', 'CA', 'pending_review'),
  ('a0050000-0000-0000-0000-000000000005', 'CA', 'pending_review'),
  ('a0060000-0000-0000-0000-000000000006', 'CA', 'pending_review'),
  ('a0070000-0000-0000-0000-000000000007', 'CA', 'pending_review'),
  ('a0080000-0000-0000-0000-000000000008', 'CA', 'pending_review'),
  ('a0090000-0000-0000-0000-000000000009', 'CA', 'pending_review'),
  ('a00a0000-0000-0000-0000-00000000000a', 'CA', 'pending_review'),
  ('a00b0000-0000-0000-0000-00000000000b', 'CA', 'pending_review'),
  ('a00c0000-0000-0000-0000-00000000000c', 'CA', 'pending_review'),
  ('a00d0000-0000-0000-0000-00000000000d', 'CA', 'pending_review'),
  ('a00e0000-0000-0000-0000-00000000000e', 'CA', 'pending_review'),
  ('a00f0000-0000-0000-0000-00000000000f', 'CA', 'pending_review'),
  ('a0100000-0000-0000-0000-000000000010', 'CA', 'pending_review'),
  ('a0110000-0000-0000-0000-000000000011', 'CA', 'blocked'),
  ('a0120000-0000-0000-0000-000000000012', 'CA', 'blocked'),
  ('a0130000-0000-0000-0000-000000000013', 'CA', 'pending_review'),
  ('a0140000-0000-0000-0000-000000000014', 'CA', 'pending_review')
ON CONFLICT (product_id, market_code) DO NOTHING;

-- =============================================================================
-- Migration 013: Row Level Security (RLS) policies
-- These are a defence-in-depth layer. Primary access control is enforced
-- by API middleware — RLS prevents accidental data leaks at the DB level.
-- =============================================================================

-- Enable RLS on all sensitive tables
ALTER TABLE admin_users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers            ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders               ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items          ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_events  ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages             ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements  ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings       ENABLE ROW LEVEL SECURITY;

-- ─── Service role bypass ──────────────────────────────────────────────────────
-- The API uses the Supabase service role key which bypasses RLS.
-- These policies protect against accidental anon/authenticated role access.

-- Products: public read for published+approved, full access for service role
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_published_products"
  ON products FOR SELECT
  USING (status = 'published' AND is_visible = TRUE);

-- Categories: public read for visible
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_visible_categories"
  ON categories FOR SELECT
  USING (is_visible = TRUE);

-- Product media: readable if product is published
ALTER TABLE product_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_product_media"
  ON product_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_media.product_id
        AND p.status = 'published'
        AND p.is_visible = TRUE
    )
  );

-- Market rules: not directly readable by anon (API enforces the gate)
ALTER TABLE product_market_rules ENABLE ROW LEVEL SECURITY;
-- No SELECT policy = anon role cannot read directly

-- ─── Customer self-access policies ───────────────────────────────────────────
-- These apply when the storefront uses the anon/authenticated Supabase client
-- (not the service role). In practice the API uses service role, but these
-- are correct belt-and-suspenders policies.

CREATE POLICY "customers_own_row"
  ON customers FOR ALL
  USING (auth.uid() = auth_user_id);

CREATE POLICY "orders_own_rows"
  ON orders FOR SELECT
  USING (customer_id IN (
    SELECT id FROM customers WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "order_items_own_orders"
  ON order_items FOR SELECT
  USING (order_id IN (
    SELECT o.id FROM orders o
    JOIN customers c ON o.customer_id = c.id
    WHERE c.auth_user_id = auth.uid()
  ));

CREATE POLICY "conversations_own"
  ON conversations FOR ALL
  USING (customer_id IN (
    SELECT id FROM customers WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "messages_own_conversations"
  ON messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT cv.id FROM conversations cv
      JOIN customers c ON cv.customer_id = c.id
      WHERE c.auth_user_id = auth.uid()
    )
    AND is_internal = FALSE  -- customers never see internal notes
  );

COMMENT ON SCHEMA public IS 'RLS enabled. Service role bypasses all policies. Anon/authenticated roles are restricted to their own data.';

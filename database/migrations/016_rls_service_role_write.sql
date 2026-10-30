-- =============================================================================
-- Migration 016: Add service role write policies to RLS-protected tables
--
-- Migration 013 enabled RLS on products/categories/etc but only defined
-- public SELECT policies. The service role normally bypasses RLS in Supabase,
-- but this explicit policy ensures writes work even in edge cases where the
-- client role is not correctly detected as service_role.
-- =============================================================================

-- Products: service role full access (SELECT already exists for public)
CREATE POLICY "service_role_full_access_products"
  ON products FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Categories: service role full access
CREATE POLICY "service_role_full_access_categories"
  ON categories FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Product media: service role full access
CREATE POLICY "service_role_full_access_product_media"
  ON product_media FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Product market rules: service role full access
CREATE POLICY "service_role_full_access_market_rules"
  ON product_market_rules FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Admin users: service role full access
CREATE POLICY "service_role_full_access_admin_users"
  ON admin_users FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Customers: service role full access (customer self-access policy also exists)
CREATE POLICY "service_role_full_access_customers"
  ON customers FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Orders: service role full access
CREATE POLICY "service_role_full_access_orders"
  ON orders FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Order items: service role full access
CREATE POLICY "service_role_full_access_order_items"
  ON order_items FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Order status events: service role full access
CREATE POLICY "service_role_full_access_order_status_events"
  ON order_status_events FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Conversations: service role full access
CREATE POLICY "service_role_full_access_conversations"
  ON conversations FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Messages: service role full access
CREATE POLICY "service_role_full_access_messages"
  ON messages FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Audit logs: service role full access
CREATE POLICY "service_role_full_access_audit_logs"
  ON audit_logs FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Store settings: service role full access
CREATE POLICY "service_role_full_access_store_settings"
  ON store_settings FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Inventory movements: service role full access
CREATE POLICY "service_role_full_access_inventory_movements"
  ON inventory_movements FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- =============================================================================
-- Migration 006: Inventory movement log
-- Every stock change must be traceable — no silent mutations.
-- =============================================================================

CREATE TYPE inventory_movement_reason AS ENUM (
  'initial_stock',
  'restock',
  'order_reserved',
  'order_released',
  'manual_adjustment',
  'damaged',
  'returned'
);

CREATE TABLE inventory_movements (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  -- Signed delta: positive = stock added, negative = stock removed
  quantity_delta INTEGER NOT NULL,
  reason        inventory_movement_reason NOT NULL,
  -- Actor tracking — one of these will be set, not both
  admin_actor_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  -- Linked order if movement was triggered by an order
  order_id      UUID,  -- FK added after orders table is created (migration 007)
  note          TEXT CHECK (char_length(note) <= 500),
  -- Stock snapshot at time of movement for audit purposes
  stock_before  INTEGER NOT NULL,
  stock_after   INTEGER NOT NULL CHECK (stock_after >= 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inventory_movements_product ON inventory_movements(product_id, created_at DESC);
CREATE INDEX idx_inventory_movements_order   ON inventory_movements(order_id) WHERE order_id IS NOT NULL;

COMMENT ON TABLE  inventory_movements IS 'Immutable audit log of all stock changes. Never update or delete rows.';
COMMENT ON COLUMN inventory_movements.quantity_delta IS 'Signed integer. Positive = added to stock, negative = removed.';
COMMENT ON COLUMN inventory_movements.stock_before IS 'Snapshot of stock_quantity before this movement for full auditability.';

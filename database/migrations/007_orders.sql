-- =============================================================================
-- Migration 007: Orders and order workflow
-- =============================================================================

-- Order workflow states — see spec section 9.4 for rationale
CREATE TYPE order_status AS ENUM (
  'pending_review',
  'under_review',
  'awaiting_payment',
  'processing',
  'fulfilled',
  'completed',
  'cancelled',
  'rejected'
);

-- Payment status is intentionally limited in Phase 1.
-- 'not_configured' is the ONLY valid value until a payment provider is integrated.
-- NEVER set to 'confirmed' without a verified payment workflow.
CREATE TYPE payment_status AS ENUM (
  'not_configured',
  'pending',
  'confirmed',
  'failed',
  'refunded'
);

CREATE TABLE orders (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Non-sequential, non-guessable public reference shown to customers
  public_reference  TEXT NOT NULL UNIQUE,
  -- Customer link — nullable to support future guest orders
  customer_id       UUID REFERENCES customers(id) ON DELETE SET NULL,

  -- Contact snapshot (captured at submission; customer may later change their profile)
  contact_name      TEXT NOT NULL CHECK (char_length(contact_name) BETWEEN 1 AND 200),
  contact_email     CITEXT NOT NULL,

  -- Shipping address snapshot stored as JSONB to preserve historical accuracy
  shipping_address  JSONB NOT NULL,
  market_code       TEXT NOT NULL CHECK (char_length(market_code) BETWEEN 2 AND 10),

  status            order_status   NOT NULL DEFAULT 'pending_review',
  payment_status    payment_status NOT NULL DEFAULT 'not_configured',

  currency          CHAR(3) NOT NULL,
  subtotal          NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
  -- Shipping and tax deferred — will be NULL until confirmed by the business
  shipping_total    NUMERIC(12, 2),
  tax_total         NUMERIC(12, 2),

  customer_notes    TEXT CHECK (char_length(customer_notes) <= 1000),
  -- Internal admin notes — never exposed to customers
  internal_notes    TEXT,

  -- Assignment
  assigned_to       UUID REFERENCES admin_users(id) ON DELETE SET NULL,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_public_reference ON orders(public_reference);
CREATE INDEX idx_orders_customer_id      ON orders(customer_id);
CREATE INDEX idx_orders_status           ON orders(status, created_at DESC);
CREATE INDEX idx_orders_contact_email    ON orders(contact_email);

COMMENT ON TABLE  orders IS 'Order requests. Payment is deferred — payment_status must remain not_configured until a verified payment workflow is implemented.';
COMMENT ON COLUMN orders.shipping_address IS 'JSONB snapshot of address at time of order. Preserves accuracy even if customer updates their address later.';
COMMENT ON COLUMN orders.internal_notes IS 'Admin-only. Must never be returned to customers.';

-- ─── Order line items ──────────────────────────────────────────────────────────

CREATE TABLE order_items (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id         UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  -- product_id is nullable: product may be archived/deleted long after the order
  product_id       UUID REFERENCES products(id) ON DELETE SET NULL,
  -- Full snapshot at time of order — immutable after creation
  sku_snapshot     TEXT NOT NULL,
  name_snapshot    TEXT NOT NULL,
  price_snapshot   NUMERIC(12, 2) NOT NULL CHECK (price_snapshot >= 0),
  currency_snapshot CHAR(3) NOT NULL,
  quantity         INTEGER NOT NULL CHECK (quantity >= 1),
  line_total       NUMERIC(12, 2) NOT NULL CHECK (line_total >= 0)
);

CREATE INDEX idx_order_items_order_id   ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id) WHERE product_id IS NOT NULL;

COMMENT ON TABLE  order_items IS 'Line items. Price, SKU, and name are snapshots and must not be updated after order creation.';

-- ─── Order status audit trail ─────────────────────────────────────────────────

CREATE TABLE order_status_events (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id     UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  old_status   order_status,   -- NULL for the initial creation event
  new_status   order_status NOT NULL,
  actor_id     UUID,           -- admin_user.id or customer.id depending on actor_type
  actor_type   TEXT NOT NULL CHECK (actor_type IN ('customer', 'admin', 'system')),
  note         TEXT CHECK (char_length(note) <= 500),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_status_events_order ON order_status_events(order_id, created_at);

COMMENT ON TABLE  order_status_events IS 'Immutable audit trail of every order status transition. Never update or delete rows.';

-- ─── Back-fill FK from inventory_movements to orders ─────────────────────────

ALTER TABLE inventory_movements
  ADD CONSTRAINT fk_inventory_movements_order
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;

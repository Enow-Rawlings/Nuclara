/**
 * Shared enums used across API, storefront, and admin.
 * Keep these as plain string literal unions — no runtime enum overhead.
 */

// ─── Product ──────────────────────────────────────────────────────────────────

export type ProductStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'published'
  | 'archived'
  | 'blocked'

export type ComplianceStatus =
  | 'not_submitted'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'expired'
  | 'requires_resubmission'

export type MarketEligibility = 'approved' | 'blocked' | 'pending_review' | 'not_applicable'

// ─── Order ────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending_review'
  | 'under_review'
  | 'awaiting_payment'
  | 'processing'
  | 'fulfilled'
  | 'completed'
  | 'cancelled'
  | 'rejected'

/**
 * Payment status is deliberately limited in Phase 1.
 * 'not_configured' is the only valid state until a payment
 * provider is integrated and approved.
 */
export type PaymentStatus = 'not_configured' | 'pending' | 'confirmed' | 'failed' | 'refunded'

// ─── Admin roles ──────────────────────────────────────────────────────────────

export type AdminRole =
  | 'owner'
  | 'catalogue_manager'
  | 'order_manager'
  | 'support_agent'
  | 'seo_editor'

// ─── Chat / Support ───────────────────────────────────────────────────────────

export type ConversationStatus = 'open' | 'pending' | 'closed'

export type SenderType = 'customer' | 'admin' | 'system'

// ─── Inventory ────────────────────────────────────────────────────────────────

export type InventoryMovementReason =
  | 'initial_stock'
  | 'restock'
  | 'order_reserved'
  | 'order_released'
  | 'manual_adjustment'
  | 'damaged'
  | 'returned'

// ─── SEO ──────────────────────────────────────────────────────────────────────

export type RobotsDirective = 'index,follow' | 'noindex,follow' | 'noindex,nofollow'

export type SeoEntityType = 'product' | 'category' | 'page'

// ─── Markets ─────────────────────────────────────────────────────────────────

/**
 * Supported market codes. These align with product_market_rules.market_code.
 * Expand as the business confirms new market eligibility.
 */
export type MarketCode = 'EU' | 'DE' | 'AU' | 'CA' | 'GB' | 'US'

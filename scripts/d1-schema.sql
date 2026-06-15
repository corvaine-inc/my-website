-- =============================================================================
-- Cloudflare D1 Schema for Payment/Order System
-- =============================================================================
-- 
-- Run this script to initialize the D1 database:
-- wrangler d1 execute <DB_NAME> --file=./scripts/d1-schema.sql
--
-- =============================================================================

-- =============================================================================
-- INVENTORY TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS inventory (
  product_id TEXT PRIMARY KEY,
  available_quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  
  -- Constraints
  CHECK (available_quantity >= 0),
  CHECK (reserved_quantity >= 0)
);

-- Index for inventory updates
CREATE INDEX IF NOT EXISTS idx_inventory_updated ON inventory(updated_at);

-- =============================================================================
-- PAYMENT SESSIONS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS payment_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  distributor_id TEXT NOT NULL,
  amount_expected INTEGER NOT NULL,  -- Stored in cents
  currency TEXT NOT NULL DEFAULT 'CAD',
  status TEXT NOT NULL DEFAULT 'pending',
  items TEXT NOT NULL,  -- JSON array of PaymentSessionItem
  helcim_session_id TEXT UNIQUE,
  helcim_transaction_id TEXT UNIQUE,
  order_id TEXT UNIQUE,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  expires_at INTEGER NOT NULL,
  
  -- Constraints
  CHECK (status IN ('pending', 'paid', 'expired', 'failed')),
  CHECK (amount_expected > 0)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_sessions_user ON payment_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON payment_sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON payment_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_helcim_session ON payment_sessions(helcim_session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_helcim_transaction ON payment_sessions(helcim_transaction_id);

-- =============================================================================
-- ORDERS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  distributor_id TEXT NOT NULL,
  payment_session_id TEXT NOT NULL UNIQUE,
  helcim_transaction_id TEXT NOT NULL UNIQUE,
  total_amount INTEGER NOT NULL,  -- Stored in cents
  currency TEXT NOT NULL DEFAULT 'CAD',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  
  -- Constraints
  CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  CHECK (total_amount > 0)
);

-- Indexes for order queries
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_payment_session ON orders(payment_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_transaction ON orders(helcim_transaction_id);

-- =============================================================================
-- ORDER ITEMS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  sku TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price_per_unit INTEGER NOT NULL,  -- Stored in cents
  line_total INTEGER NOT NULL,      -- Stored in cents
  
  -- Foreign key
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  
  -- Constraints
  CHECK (quantity > 0),
  CHECK (price_per_unit >= 0),
  CHECK (line_total >= 0)
);

-- Index for order items lookup
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- =============================================================================
-- SEED DATA (Development Only)
-- =============================================================================

-- Sample inventory
INSERT OR IGNORE INTO inventory (product_id, available_quantity, reserved_quantity) VALUES
  ('prod_1', 100, 0),
  ('prod_2', 50, 0),
  ('prod_3', 25, 0);

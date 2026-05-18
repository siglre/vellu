import pool from './pool.js';

const SQL = `
-- =============================================
-- VELLU · Database Schema
-- =============================================

-- Расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Пользователи
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(255) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  role       VARCHAR(20)  NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- =============================================
-- Категории
-- =============================================
CREATE TABLE IF NOT EXISTS categories (
  id         SERIAL       PRIMARY KEY,
  name       VARCHAR(100) NOT NULL UNIQUE,
  emoji      VARCHAR(10),
  bg_color   VARCHAR(20),
  sort_order INT          NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- =============================================
-- Товары
-- =============================================
CREATE TABLE IF NOT EXISTS products (
  id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  price       NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  category_id INT          REFERENCES categories(id) ON DELETE SET NULL,
  tag         VARCHAR(50),
  image_url   TEXT,
  sizes       TEXT[]       DEFAULT '{}',
  stock       INT          NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- =============================================
-- Корзины
-- =============================================
CREATE TABLE IF NOT EXISTS carts (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS cart_items (
  id         UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id    UUID         NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID         NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size       VARCHAR(50)  NOT NULL DEFAULT '',
  qty        INT          NOT NULL DEFAULT 1 CHECK (qty > 0),
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE(cart_id, product_id, size)
);

-- =============================================
-- Избранное
-- =============================================
CREATE TABLE IF NOT EXISTS wishlist_items (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- =============================================
-- Заказы
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
  id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status          VARCHAR(50)  NOT NULL DEFAULT 'new'
                  CHECK (status IN ('new','paid','processing','shipped','delivered','cancelled','refund')),
  total           NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_name   VARCHAR(200),
  shipping_phone  VARCHAR(30),
  shipping_address TEXT,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id         UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id   UUID          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID          REFERENCES products(id) ON DELETE SET NULL,
  name       VARCHAR(255)  NOT NULL,
  price      NUMERIC(10,2) NOT NULL,
  size       VARCHAR(50)   NOT NULL DEFAULT '',
  qty        INT           NOT NULL DEFAULT 1,
  image_url  TEXT
);

-- =============================================
-- Контент (баннеры, настройки)
-- =============================================
CREATE TABLE IF NOT EXISTS settings (
  key        VARCHAR(100) PRIMARY KEY,
  value      TEXT,
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- =============================================
-- Функция автообновления updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'users_updated_at') THEN
    CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'products_updated_at') THEN
    CREATE TRIGGER products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'orders_updated_at') THEN
    CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

-- Индексы
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active    ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart    ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order  ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_user        ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user      ON wishlist_items(user_id);
`;

async function migrate() {
  console.log('🔄 Running migrations...');
  try {
    await pool.query(SQL);
    console.log('✅ Migrations complete');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();

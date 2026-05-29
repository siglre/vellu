import { Router } from 'express';
import pool from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Получить или создать корзину пользователя
async function getOrCreateCart(userId, client) {
  let { rows } = await client.query(
    `SELECT id FROM carts WHERE user_id=$1`, [userId]
  );
  if (!rows[0]) {
    const res = await client.query(
      `INSERT INTO carts (user_id) VALUES ($1) RETURNING id`, [userId]
    );
    rows = res.rows;
  }
  return rows[0].id;
}

function getSizePrice(sizes, sizeName) {
  if (!sizeName || !sizes?.length) return null;
  for (const s of sizes) {
    if (!s) continue;
    let obj = s;
    if (typeof s === 'string') {
      try { obj = JSON.parse(s); } catch { if (s === sizeName) return null; continue; }
    }
    if (obj?.name === sizeName && obj?.price) return parseFloat(obj.price);
  }
  return null;
}

// Получить корзину с товарами
async function fetchCart(userId, client) {
  const cartId = await getOrCreateCart(userId, client);
  const { rows } = await client.query(`
    SELECT
      ci.id, ci.qty, ci.size,
      p.id AS product_id, p.name, p.image_url, p.stock, p.price AS base_price, p.sizes,
      c.name AS category
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE ci.cart_id = $1
    ORDER BY ci.created_at ASC
  `, [cartId]);

  const items = rows.map(({ sizes, base_price, ...row }) => ({
    ...row,
    price: getSizePrice(sizes, row.size) ?? parseFloat(base_price),
  }));

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  return { items, total: parseFloat(total.toFixed(2)), cartId };
}

// GET /api/cart
router.get('/', requireAuth, async (req, res, next) => {
  const client = await pool.connect();
  try {
    res.json(await fetchCart(req.user.id, client));
  } catch (err) { next(err); } finally { client.release(); }
});

// POST /api/cart — добавить товар
router.post('/', requireAuth, async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { product_id, size = '', qty = 1 } = req.body;
    if (!product_id) return res.status(400).json({ error: 'product_id обязателен' });

    // Проверяем наличие товара
    const { rows: pRows } = await client.query(
      `SELECT stock FROM products WHERE id=$1 AND is_active=TRUE`, [product_id]
    );
    if (!pRows[0]) return res.status(404).json({ error: 'Товар не найден' });

    await client.query('BEGIN');
    const cartId = await getOrCreateCart(req.user.id, client);

    await client.query(`
      INSERT INTO cart_items (cart_id, product_id, size, qty)
      VALUES ($1,$2,$3,$4)
      ON CONFLICT (cart_id, product_id, size)
      DO UPDATE SET qty = cart_items.qty + $4
    `, [cartId, product_id, size, qty]);

    await client.query('COMMIT');
    res.json(await fetchCart(req.user.id, client));
  } catch (err) { await client.query('ROLLBACK'); next(err); } finally { client.release(); }
});

// PATCH /api/cart/:itemId — изменить количество
router.patch('/:itemId', requireAuth, async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { qty } = req.body;
    if (typeof qty !== 'number' || qty < 0) {
      return res.status(400).json({ error: 'Некорректное количество' });
    }
    await client.query('BEGIN');
    if (qty === 0) {
      await client.query(`DELETE FROM cart_items WHERE id=$1`, [req.params.itemId]);
    } else {
      await client.query(`UPDATE cart_items SET qty=$1 WHERE id=$2`, [qty, req.params.itemId]);
    }
    await client.query('COMMIT');
    res.json(await fetchCart(req.user.id, client));
  } catch (err) { await client.query('ROLLBACK'); next(err); } finally { client.release(); }
});

// DELETE /api/cart/:itemId — удалить позицию
router.delete('/:itemId', requireAuth, async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query(`DELETE FROM cart_items WHERE id=$1`, [req.params.itemId]);
    res.json(await fetchCart(req.user.id, client));
  } catch (err) { next(err); } finally { client.release(); }
});

// DELETE /api/cart — очистить корзину
router.delete('/', requireAuth, async (req, res, next) => {
  const client = await pool.connect();
  try {
    const cartId = await getOrCreateCart(req.user.id, client);
    await client.query(`DELETE FROM cart_items WHERE cart_id=$1`, [cartId]);
    res.json({ items: [], total: 0, cartId });
  } catch (err) { next(err); } finally { client.release(); }
});

export default router;

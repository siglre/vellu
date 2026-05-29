import { Router } from 'express';
import pool from '../db/pool.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// GET /api/orders  — мои заказы
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        o.id, o.status, o.total, o.created_at,
        o.shipping_name, o.shipping_address,
        json_agg(json_build_object(
          'id', oi.id, 'name', oi.name, 'price', oi.price,
          'qty', oi.qty, 'size', oi.size, 'image_url', oi.image_url
        )) AS items
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `, [req.user.id]);
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/orders/:id
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT o.*, json_agg(json_build_object(
        'id', oi.id, 'name', oi.name, 'price', oi.price,
        'qty', oi.qty, 'size', oi.size, 'image_url', oi.image_url
      )) AS items
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      WHERE o.id=$1 AND o.user_id=$2
      GROUP BY o.id
    `, [req.params.id, req.user.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Заказ не найден' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// POST /api/orders — оформить заказ из корзины
router.post('/', requireAuth, async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { shipping_name, shipping_phone, shipping_address } = req.body;

    await client.query('BEGIN');

    // Берём товары из корзины
    const { rows: cartRows } = await client.query(`
      SELECT ci.qty, ci.size, ci.product_id,
             p.name, p.price, p.image_url, p.stock
      FROM carts ca
      JOIN cart_items ci ON ci.cart_id = ca.id
      JOIN products p ON p.id = ci.product_id
      WHERE ca.user_id=$1
    `, [req.user.id]);

    if (!cartRows.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Корзина пуста' });
    }

    const total = cartRows.reduce((s, i) => s + Number(i.price) * i.qty, 0);

    // Создаём заказ
    const { rows: orderRows } = await client.query(`
      INSERT INTO orders (user_id, total, shipping_name, shipping_phone, shipping_address)
      VALUES ($1,$2,$3,$4,$5) RETURNING id
    `, [req.user.id, total.toFixed(2), shipping_name, shipping_phone, shipping_address]);

    const orderId = orderRows[0].id;

    // Позиции заказа
    for (const item of cartRows) {
      await client.query(`
        INSERT INTO order_items (order_id, product_id, name, price, size, qty, image_url)
        VALUES ($1,$2,$3,$4,$5,$6,$7)
      `, [orderId, item.product_id, item.name, item.price, item.size, item.qty, item.image_url]);

      // Уменьшаем остаток
      await client.query(
        `UPDATE products SET stock = GREATEST(stock - $1, 0) WHERE id=$2`,
        [item.qty, item.product_id]
      );
    }

    // Очищаем корзину
    await client.query(`
      DELETE FROM cart_items WHERE cart_id=(SELECT id FROM carts WHERE user_id=$1)
    `, [req.user.id]);

    await client.query('COMMIT');
    res.status(201).json({ orderId, total: parseFloat(total.toFixed(2)) });
  } catch (err) { await client.query('ROLLBACK'); next(err); } finally { client.release(); }
});

// ---- Admin ----

// GET /api/orders/admin/all  (admin)
router.get('/admin/all', requireAdmin, async (req, res, next) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    let where = [];
    const params = [];
    let i = 1;
    if (status) { where.push(`o.status=$${i++}`); params.push(status); }
    params.push(parseInt(limit), parseInt(offset));
    const { rows } = await pool.query(`
      SELECT o.id, o.status, o.total, o.created_at,
             u.name AS customer_name, u.email AS customer_email,
             o.shipping_address
      FROM orders o
      JOIN users u ON u.id = o.user_id
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY o.created_at DESC
      LIMIT $${i++} OFFSET $${i}
    `, params);
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/orders/admin/:id  (admin) — полный заказ с позициями
router.get('/admin/:id', requireAdmin, async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        o.id, o.status, o.total, o.created_at,
        o.shipping_name, o.shipping_phone, o.shipping_address,
        u.name AS customer_name, u.email AS customer_email,
        json_agg(json_build_object(
          'id', oi.id, 'name', oi.name, 'price', oi.price,
          'qty', oi.qty, 'size', oi.size, 'image_url', oi.image_url
        ) ORDER BY oi.id) AS items
      FROM orders o
      JOIN users u ON u.id = o.user_id
      JOIN order_items oi ON oi.order_id = o.id
      WHERE o.id = $1
      GROUP BY o.id, u.name, u.email
    `, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Заказ не найден' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// PATCH /api/orders/admin/:id/status  (admin)
router.patch('/admin/:id/status', requireAdmin, async (req, res, next) => {
  try {
    const { status } = req.body;
    const { rows } = await pool.query(
      `UPDATE orders SET status=$1 WHERE id=$2 RETURNING *`,
      [status, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Заказ не найден' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

export default router;

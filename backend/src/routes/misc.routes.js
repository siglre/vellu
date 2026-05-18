import { Router } from 'express';
import { readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../db/pool.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const IMAGES_DIR = path.join(__dirname, '../../../frontend/public/images/products');

// =============================================
// CATEGORIES
// =============================================
export const categoriesRouter = Router();

categoriesRouter.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.id, c.name, c.emoji, c.bg_color,
             COUNT(p.id) FILTER (WHERE p.is_active) AS product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id
      ORDER BY c.sort_order ASC
    `);
    res.json(rows);
  } catch (err) { next(err); }
});

categoriesRouter.post('/', requireAdmin, async (req, res, next) => {
  try {
    const { name, emoji } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Нужно название' });
    const { rows } = await pool.query(
      `INSERT INTO categories (name, emoji) VALUES ($1, $2) RETURNING *`,
      [name.trim(), emoji || '📦']
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

categoriesRouter.patch('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { name, emoji } = req.body;
    const { rows } = await pool.query(
      `UPDATE categories SET
         name  = COALESCE($1, name),
         emoji = COALESCE($2, emoji)
       WHERE id = $3 RETURNING *`,
      [name?.trim() || null, emoji || null, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Категория не найдена' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

categoriesRouter.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT COUNT(*) FROM products WHERE category_id = $1`,
      [req.params.id]
    );
    if (parseInt(rows[0].count) > 0)
      return res.status(400).json({ error: 'Нельзя удалить категорию с товарами' });
    await pool.query(`DELETE FROM categories WHERE id = $1`, [req.params.id]);
    res.json({ message: 'Удалено' });
  } catch (err) { next(err); }
});

// =============================================
// IMAGES — список файлов из public/images/products
// =============================================
export const imagesRouter = Router();

imagesRouter.get('/', requireAdmin, (_req, res) => {
  try {
    const files = readdirSync(IMAGES_DIR)
      .filter(f => /\.(jpe?g|png|webp|gif)$/i.test(f))
      .sort()
      .map(f => `/images/products/${f}`);
    res.json(files);
  } catch {
    res.json([]);
  }
});

// =============================================
// WISHLIST
// =============================================
export const wishlistRouter = Router();

wishlistRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.id, p.name, p.price, p.image_url, p.tag, c.name AS category
      FROM wishlist_items w
      JOIN products p ON p.id = w.product_id
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE w.user_id=$1
      ORDER BY w.created_at DESC
    `, [req.user.id]);
    res.json(rows);
  } catch (err) { next(err); }
});

wishlistRouter.post('/:productId', requireAuth, async (req, res, next) => {
  try {
    await pool.query(
      `INSERT INTO wishlist_items (user_id, product_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
      [req.user.id, req.params.productId]
    );
    res.json({ message: 'Добавлено в избранное' });
  } catch (err) { next(err); }
});

wishlistRouter.delete('/:productId', requireAuth, async (req, res, next) => {
  try {
    await pool.query(
      `DELETE FROM wishlist_items WHERE user_id=$1 AND product_id=$2`,
      [req.user.id, req.params.productId]
    );
    res.json({ message: 'Удалено из избранного' });
  } catch (err) { next(err); }
});

// =============================================
// ADMIN — статистика
// =============================================
export const adminRouter = Router();

adminRouter.get('/stats', requireAdmin, async (req, res, next) => {
  try {
    const [revenue, orders, users, topProducts] = await Promise.all([
      pool.query(`SELECT COALESCE(SUM(total),0) AS total FROM orders WHERE status NOT IN ('cancelled','refund')`),
      pool.query(`SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='new') AS new_count FROM orders`),
      pool.query(`SELECT COUNT(*) AS total FROM users WHERE role='user'`),
      pool.query(`
        SELECT p.name, SUM(oi.qty) AS sold, SUM(oi.price*oi.qty) AS revenue
        FROM order_items oi JOIN products p ON p.id=oi.product_id
        GROUP BY p.id, p.name ORDER BY sold DESC LIMIT 5
      `),
    ]);
    res.json({
      revenue:     parseFloat(revenue.rows[0].total),
      orders:      parseInt(orders.rows[0].total),
      newOrders:   parseInt(orders.rows[0].new_count),
      users:       parseInt(users.rows[0].total),
      topProducts: topProducts.rows,
    });
  } catch (err) { next(err); }
});

adminRouter.get('/settings', requireAdmin, async (req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT key, value FROM settings`);
    const settings = Object.fromEntries(rows.map(r => [r.key, r.value]));
    res.json(settings);
  } catch (err) { next(err); }
});

adminRouter.patch('/settings', requireAdmin, async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const [key, value] of Object.entries(req.body)) {
      await client.query(
        `INSERT INTO settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=$2, updated_at=NOW()`,
        [key, String(value)]
      );
    }
    await client.query('COMMIT');
    res.json({ message: 'Настройки обновлены' });
  } catch (err) { await client.query('ROLLBACK'); next(err); } finally { client.release(); }
});

adminRouter.get('/users', requireAdmin, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) { next(err); }
});

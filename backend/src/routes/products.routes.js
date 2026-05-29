import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import pool from '../db/pool.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

function calcMinPrice(basePrice, sizes) {
  const prices = (sizes || []).map(s => parseFloat(s.price)).filter(p => !isNaN(p) && p > 0);
  return prices.length ? Math.min(basePrice, ...prices) : basePrice;
}

function normalizeImages(image_url, images) {
  const list = Array.isArray(images) ? images.filter(Boolean) : [];
  if (image_url) list.unshift(image_url);
  return [...new Set(list)];
}

// Конвертирует JS-массив в строку PostgreSQL-литерала text[]
// Обходит pg-сериализацию, которая ломается на пустых массивах и массивах объектов
function toPgTextArray(arr) {
  if (!arr || arr.length === 0) return null;
  const items = arr.map(el => {
    const s = typeof el === 'string' ? el : JSON.stringify(el);
    return '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
  });
  return `{${items.join(',')}}`;
}

// GET /api/products
router.get('/', [
  query('category').optional().isString(),
  query('tag').optional().isString(),
  query('search').optional().isString(),
  query('sort').optional().isIn(['price_asc','price_desc','name','newest']),
  query('price_min').optional().isFloat({ min: 0 }),
  query('price_max').optional().isFloat({ min: 0 }),
  query('in_stock').optional().isBoolean(),
  query('include_inactive').optional().isBoolean(),
  query('limit').optional().isInt({ min:1, max:100 }),
  query('offset').optional().isInt({ min:0 }),
], async (req, res, next) => {
  try {
    const { category, tag, search, sort = 'newest', limit = 20, offset = 0,
            price_min, price_max, in_stock, include_inactive } = req.query;

    let where = include_inactive === 'true' ? ['TRUE'] : ['p.is_active = TRUE'];
    const params = [];
    let i = 1;

    if (category)  { where.push(`c.name = $${i++}`); params.push(category); }
    if (tag)       { where.push(`p.tag = $${i++}`);  params.push(tag); }
    if (search)    { where.push(`p.name ILIKE $${i++}`); params.push(`%${search}%`); }
    if (price_min) { where.push(`p.price >= $${i++}`); params.push(parseFloat(price_min)); }
    if (price_max) { where.push(`p.price <= $${i++}`); params.push(parseFloat(price_max)); }
    if (in_stock === 'true') { where.push(`p.stock > 0`); }

    const orderMap = {
      price_asc:  'p.price ASC',
      price_desc: 'p.price DESC',
      name:       'p.name ASC',
      newest:     'p.created_at DESC',
    };

    params.push(parseInt(limit), parseInt(offset));

    const sql = `
      SELECT
        p.id, p.name, p.description, p.price, p.tag,
        p.image_url, COALESCE(p.images, ARRAY[]::text[]) AS images, p.sizes, p.stock, p.is_active, p.created_at,
        p.category_id, c.name AS category, c.emoji AS category_emoji
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE ${where.join(' AND ')}
      ORDER BY ${orderMap[sort]}
      LIMIT $${i++} OFFSET $${i}
    `;

    const countSql = `
      SELECT COUNT(*) FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE ${where.join(' AND ')}
    `;

    const [data, count] = await Promise.all([
      pool.query(sql, params),
      pool.query(countSql, params.slice(0, -2)),
    ]);

    res.json({
      products: data.rows,
      total:    parseInt(count.rows[0].count),
      limit:    parseInt(limit),
      offset:   parseInt(offset),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        p.id, p.name, p.description, p.price, p.tag,
        p.image_url, COALESCE(p.images, ARRAY[]::text[]) AS images, p.sizes, p.stock, p.is_active, p.created_at,
        c.name AS category, c.emoji AS category_emoji
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.id = $1
    `, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Товар не найден' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/products  (admin)
router.post('/', requireAdmin, [
  body('name').trim().notEmpty(),
  body('price').isFloat({ min: 0 }),
  body('category_id').notEmpty(),
  body('images').optional().isArray(),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { name, description, price, category_id, tag, image_url, images = [], sizes = [], stock = 0 } = req.body;
    const normalizedImages = normalizeImages(image_url, images);
    const effectivePrice = calcMinPrice(price, sizes);
    const primaryImageUrl = image_url || normalizedImages[0] || null;
    const { rows } = await pool.query(`
      INSERT INTO products (name, description, price, category_id, tag, image_url, images, sizes, stock)
      VALUES ($1,$2,$3,$4,$5,$6,$7::text[],$8::text[],$9) RETURNING *
    `, [name, description, effectivePrice, category_id, tag, primaryImageUrl,
        toPgTextArray(normalizedImages), toPgTextArray(sizes), stock]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/products/:id  (admin)
router.patch('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { name, description, price, category_id, tag, image_url, images, sizes, stock, is_active } = req.body;
    const normalizedImages = images != null ? normalizeImages(image_url, images) : null;
    const effectivePrice = (price != null && sizes != null) ? calcMinPrice(price, sizes) : price;
    const { rows } = await pool.query(`
      UPDATE products SET
        name        = COALESCE($1, name),
        description = COALESCE($2, description),
        price       = COALESCE($3, price),
        category_id = COALESCE($4, category_id),
        tag         = COALESCE($5, tag),
        image_url   = COALESCE($6, image_url),
        images      = COALESCE($7::text[], images),
        sizes       = COALESCE($8::text[], sizes),
        stock       = COALESCE($9, stock),
        is_active   = COALESCE($10, is_active)
      WHERE id = $11 RETURNING *
    `, [name, description, effectivePrice, category_id, tag, image_url,
        toPgTextArray(normalizedImages), toPgTextArray(sizes),
        stock, is_active, req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Товар не найден' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/products/:id  (admin — soft delete)
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    await pool.query(`UPDATE products SET is_active=FALSE WHERE id=$1`, [req.params.id]);
    res.json({ message: 'Товар скрыт' });
  } catch (err) {
    next(err);
  }
});

export default router;

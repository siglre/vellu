import pool from './pool.js';

const res = await pool.query(`
  SELECT c.name, c.emoji, COUNT(p.id) as count
  FROM categories c
  LEFT JOIN products p ON p.category_id = c.id
  GROUP BY c.id, c.name, c.emoji
  ORDER BY count DESC
`);
res.rows.forEach(r => console.log(`${r.emoji} ${r.name}: ${r.count} товаров`));
await pool.end();

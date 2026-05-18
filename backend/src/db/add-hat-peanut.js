import pool from './pool.js';

const client = await pool.connect();
try {
  await client.query('BEGIN');

  const cat = await client.query("SELECT id FROM categories WHERE name = 'Забавные'");
  const catId = cat.rows[0].id;

  await client.query(`
    INSERT INTO products (name, description, price, category_id, tag, image_url, images, sizes, stock)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT DO NOTHING
  `, [
    'Арахис в шляпе',
    'Стильный арахис в элегантной шляпе — настоящий джентльмен мягкого мира!',
    2100, catId, 'Новый',
    '/images/products/hat-peanut.jpg',
    ['/images/products/hat-peanut.jpg'],
    ['Маленький', 'Средний'], 22
  ]);
  console.log('added: Арахис в шляпе');

  await client.query(
    "UPDATE products SET image_url=$1, images=$2 WHERE name='Арахис в очках'",
    ['/images/products/cool-peanut.jpg', ['/images/products/cool-peanut.jpg']]
  );
  console.log('updated: Арахис в очках');

  await client.query('COMMIT');
  console.log('done');
} finally {
  client.release();
  await pool.end();
}

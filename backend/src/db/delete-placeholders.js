import pool from './pool.js';

const client = await pool.connect();
try {
  await client.query('BEGIN');

  const res = await client.query(
    `SELECT id, name FROM products WHERE image_url = '/images/products/placeholder.jpg'`
  );
  console.log(`Found ${res.rows.length} products with placeholder:`);
  res.rows.forEach(r => console.log(`  - ${r.name} (id=${r.id})`));

  const { rowCount } = await client.query(
    `DELETE FROM products WHERE image_url = '/images/products/placeholder.jpg'`
  );
  console.log(`\nDeleted ${rowCount} products`);

  await client.query('COMMIT');
  console.log('✅ Done');
} catch (err) {
  await client.query('ROLLBACK');
  console.error('❌', err.message);
} finally {
  client.release();
  await pool.end();
}

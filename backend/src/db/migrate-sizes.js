import pool from './pool.js';

const client = await pool.connect();
try {
  // Check current column type
  const { rows } = await client.query(`
    SELECT data_type FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'sizes'
  `);
  const colType = rows[0]?.data_type;
  console.log(`Current sizes column type: ${colType}`);

  if (colType === 'jsonb' || colType === 'json') {
    console.log('Already JSONB — skipping migration');
    process.exit(0);
  }

  await client.query('BEGIN');

  // Step 1: add new JSONB column
  await client.query(`ALTER TABLE products ADD COLUMN sizes_new JSONB DEFAULT '[]'`);

  // Step 2: populate from TEXT[]
  await client.query(`
    UPDATE products
    SET sizes_new = (
      SELECT jsonb_agg(jsonb_build_object('name', s))
      FROM unnest(sizes) AS s
    )
    WHERE sizes IS NOT NULL AND cardinality(sizes) > 0
  `);

  // Step 3: set empty array where null
  await client.query(`UPDATE products SET sizes_new = '[]' WHERE sizes_new IS NULL`);

  // Step 4: swap columns
  await client.query(`ALTER TABLE products DROP COLUMN sizes`);
  await client.query(`ALTER TABLE products RENAME COLUMN sizes_new TO sizes`);
  await client.query(`ALTER TABLE products ALTER COLUMN sizes SET DEFAULT '[]'`);

  await client.query('COMMIT');
  console.log('✅ Migration complete: sizes TEXT[] → JSONB');

  // Verify
  const check = await client.query(`SELECT name, sizes FROM products LIMIT 3`);
  check.rows.forEach(r => console.log(`  ${r.name}: ${JSON.stringify(r.sizes)}`));
} catch (err) {
  await client.query('ROLLBACK');
  console.error('❌', err.message);
} finally {
  client.release();
  await pool.end();
}

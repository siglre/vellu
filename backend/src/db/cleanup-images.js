import pool from './pool.js';

// Old Unsplash -2 files that are gone from disk — remove from DB images arrays
const unsplashDuplicates = [
  'avocado-2.jpg', 'cream-bunny-2.jpg', 'elephant-2.jpg', 'fox-2.jpg',
  'gray-bunny-2.jpg', 'lamb-2.jpg', 'mushroom-2.jpg', 'octopus-2.jpg',
  'peach-2.jpg', 'pink-bunny-2.jpg', 'tomato-2.jpg',
  // ufo.jpg has placeholder content; НЛО now points to placeholder.jpg
  'ufo.jpg',
  // floral-bunny.jpg has placeholder content; Зайчик now points to placeholder.jpg
  'floral-bunny.jpg',
];

const client = await pool.connect();
try {
  await client.query('BEGIN');

  // Find all products whose images array contains any of the dead files
  const res = await client.query(
    `SELECT id, name, image_url, images FROM products
     WHERE images && $1::text[]`,
    [unsplashDuplicates.map(f => `/images/products/${f}`)]
  );

  console.log(`Found ${res.rows.length} products to update`);

  for (const row of res.rows) {
    const deadSet = new Set(unsplashDuplicates.map(f => `/images/products/${f}`));
    const cleaned = row.images.filter(img => !deadSet.has(img));

    // If primary image_url was one of the dead files, fix it too
    let primaryUrl = row.image_url;
    if (deadSet.has(primaryUrl) && cleaned.length > 0) {
      primaryUrl = cleaned[0];
    }

    await client.query(
      'UPDATE products SET image_url=$1, images=$2 WHERE id=$3',
      [primaryUrl, cleaned, row.id]
    );
    console.log(`✓ ${row.name}: [${row.images.join(', ')}] → [${cleaned.join(', ')}]`);
  }

  await client.query('COMMIT');
  console.log('\n✅ Done');
} catch (err) {
  await client.query('ROLLBACK');
  console.error('❌', err.message);
} finally {
  client.release();
  await pool.end();
}

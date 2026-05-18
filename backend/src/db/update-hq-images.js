import pool from './pool.js';

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Update images arrays for products that got new angles
    const imageUpdates = [
      { name: 'Медведь-моряк',
        img: '/images/products/sailor-bear.jpg',
        images: ['/images/products/sailor-bear.jpg', '/images/products/sailor-bear-2.jpg'] },
      { name: 'Розовый скат',
        img: '/images/products/pink-ray.jpg',
        images: ['/images/products/pink-ray.jpg', '/images/products/pink-ray-2.jpg'] },
      { name: 'Арахис в очках',
        img: '/images/products/cool-peanut.jpg',
        images: ['/images/products/cool-peanut.jpg'] },
      { name: 'Зефирки',
        img: '/images/products/marshmallow.jpg',
        images: ['/images/products/marshmallow.jpg', '/images/products/marshmallow-2.jpg', '/images/products/marshmallow-3.jpg'] },
      // Update existing original products with HQ images
      { name: 'Забавное солнышко',
        img: '/images/products/sunshine.jpg',
        images: ['/images/products/sunshine.jpg'] },
    ];

    for (const u of imageUpdates) {
      const { rowCount } = await client.query(
        `UPDATE products SET image_url = $1, images = $2 WHERE name = $3`,
        [u.img, u.images, u.name]
      );
      console.log(rowCount > 0 ? `✓ ${u.name}` : `✗ NOT FOUND: ${u.name}`);
    }

    // Add Pelican as a new product
    const catRes = await client.query(`SELECT id FROM categories WHERE name = 'Дикие'`);
    const catId = catRes.rows[0]?.id;
    if (catId) {
      await client.query(`
        INSERT INTO products (name, description, price, category_id, tag, image_url, images, sizes, stock)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        ON CONFLICT DO NOTHING
      `, [
        'Пеликан',
        'Пышный пеликан с огромным клювом и доброй улыбкой. Самый большеротый дружок в коллекции!',
        2800,
        catId,
        'Новый',
        '/images/products/pelican.jpg',
        ['/images/products/pelican.jpg'],
        ['Маленький', 'Средний', 'Большой'],
        18
      ]);
      console.log('✓ Пеликан added');
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
}

run();

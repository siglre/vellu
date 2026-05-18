import pool from './pool.js';

const updates = [
  // Зефирки: убираем marshmallow-3.jpg (A6MPW, неизвестный контент), оставляем две проверенные
  { name: 'Зефирки',
    img: '/images/products/marshmallow.jpg',
    images: ['/images/products/marshmallow.jpg', '/images/products/marshmallow-2.jpg'] },
  // Арахис в очках: теперь cool-peanut.jpg содержит правильное фото
  { name: 'Арахис в очках',
    img: '/images/products/cool-peanut.jpg',
    images: ['/images/products/cool-peanut.jpg'] },
  // НЛО: пока placeholder, нет правильного фото
  { name: 'НЛО',
    img: '/images/products/placeholder.jpg',
    images: ['/images/products/placeholder.jpg'] },
  // Зайчик с цветочными ушками: пока placeholder
  { name: 'Зайчик с цветочными ушками',
    img: '/images/products/placeholder.jpg',
    images: ['/images/products/placeholder.jpg'] },
];

const client = await pool.connect();
try {
  await client.query('BEGIN');
  for (const u of updates) {
    const { rowCount } = await client.query(
      'UPDATE products SET image_url=$1, images=$2 WHERE name=$3',
      [u.img, u.images, u.name]
    );
    console.log(rowCount > 0 ? `✓ ${u.name}` : `✗ not found: ${u.name}`);
  }
  await client.query('COMMIT');
  console.log('done');
} finally {
  client.release();
  await pool.end();
}

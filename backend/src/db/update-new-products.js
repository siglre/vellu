import pool from './pool.js';

const updates = [
  // Зайцы
  { name: 'Зайчик с цветочными ушками',
    img: '/images/products/floral-bunny.jpg',
    images: ['/images/products/floral-bunny.jpg'] },
  { name: 'Зайчик Астрид со звёздочкой',
    img: '/images/products/star-bunny.jpg',
    images: ['/images/products/star-bunny.jpg', '/images/products/star-bunny-2.jpg'] },
  { name: 'Зайчик с суккулентом',
    img: '/images/products/succulent-bunny.jpg',
    images: ['/images/products/succulent-bunny.jpg', '/images/products/succulent-bunny-2.jpg'] },

  // Забавные
  { name: 'Фисташка',
    img: '/images/products/pistachio.jpg',
    images: ['/images/products/pistachio.jpg'] },
  { name: 'Круассан',
    img: '/images/products/croissant.jpg',
    images: ['/images/products/croissant.jpg'] },
  { name: 'Зефирки',
    img: '/images/products/marshmallow.jpg',
    images: ['/images/products/marshmallow.jpg', '/images/products/marshmallow-2.jpg'] },
  { name: 'Плющ в горшке',
    img: '/images/products/ivy-plant.jpg',
    images: ['/images/products/ivy-plant.jpg'] },
  { name: 'Лампочка',
    img: '/images/products/lightbulb.jpg',
    images: ['/images/products/lightbulb.jpg'] },
  { name: 'Арахис в очках',
    img: '/images/products/cool-peanut.jpg',
    images: ['/images/products/cool-peanut.jpg'] },
  { name: 'Гортензия',
    img: '/images/products/hydrangea.jpg',
    images: ['/images/products/hydrangea.jpg'] },
  { name: 'Яйцо-учёный',
    img: '/images/products/egg-scientist.jpg',
    images: ['/images/products/egg-scientist.jpg'] },
  { name: 'Инопланетянин',
    img: '/images/products/alien.jpg',
    images: ['/images/products/alien.jpg'] },
  { name: 'Злой шарик',
    img: '/images/products/angry-ball.jpg',
    images: ['/images/products/angry-ball.jpg', '/images/products/angry-ball-2.jpg'] },
  { name: 'НЛО',
    img: '/images/products/ufo.jpg',
    images: ['/images/products/ufo.jpg'] },
  { name: 'Арахис',
    img: '/images/products/peanut.jpg',
    images: ['/images/products/peanut.jpg', '/images/products/peanut-2.jpg'] },
  { name: 'Именинный торт',
    img: '/images/products/birthday-cake.jpg',
    images: ['/images/products/birthday-cake.jpg', '/images/products/birthday-cake-2.jpg'] },

  // Океан
  { name: 'Розовый скат',
    img: '/images/products/pink-ray.jpg',
    images: ['/images/products/pink-ray.jpg'] },
  { name: 'Краб оранжевый',
    img: '/images/products/orange-crab.jpg',
    images: ['/images/products/orange-crab.jpg'] },
  { name: 'Красный омар',
    img: '/images/products/red-lobster.jpg',
    images: ['/images/products/red-lobster.jpg'] },

  // Дикие
  { name: 'Лягушка',
    img: '/images/products/frog.jpg',
    images: ['/images/products/frog.jpg', '/images/products/frog-2.jpg'] },
  { name: 'Бегемотик',
    img: '/images/products/hippo.jpg',
    images: ['/images/products/hippo.jpg'] },

  // Медведи
  { name: 'Медведь Гарри в свитере',
    img: '/images/products/harry-bear.jpg',
    images: ['/images/products/harry-bear.jpg', '/images/products/harry-bear-2.jpg'] },
  { name: 'Медведь Наоми',
    img: '/images/products/naomi-bear.jpg',
    images: ['/images/products/naomi-bear.jpg', '/images/products/naomi-bear-2.jpg'] },
  { name: 'Медведь Алекс',
    img: '/images/products/alex-bear.jpg',
    images: ['/images/products/alex-bear.jpg', '/images/products/alex-bear-2.jpg'] },
  { name: 'Медведь-моряк',
    img: '/images/products/sailor-bear.jpg',
    images: ['/images/products/sailor-bear.jpg'] },
  { name: 'Маленький медведь',
    img: '/images/products/small-bear.jpg',
    images: ['/images/products/small-bear.jpg', '/images/products/small-bear-2.jpg'] },

  // Космос
  { name: 'Собака-космонавт',
    img: '/images/products/space-dog.jpg',
    images: ['/images/products/space-dog.jpg'] },
  { name: 'Комета',
    img: '/images/products/comet.jpg',
    images: ['/images/products/comet.jpg'] },
];

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    let updated = 0;
    for (const u of updates) {
      const { rowCount } = await client.query(
        `UPDATE products SET image_url = $1, images = $2 WHERE name = $3`,
        [u.img, u.images, u.name]
      );
      if (rowCount > 0) { updated++; console.log(`✓ ${u.name}`); }
      else { console.warn(`✗ NOT FOUND: ${u.name}`); }
    }
    await client.query('COMMIT');
    console.log(`\n✅ Updated ${updated} products`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

run();

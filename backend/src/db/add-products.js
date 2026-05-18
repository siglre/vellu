import pool from './pool.js';

async function addProducts() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // New categories
    const newCats = await client.query(`
      INSERT INTO categories (name, emoji, bg_color, sort_order) VALUES
        ('Медведи', '🐻', '#fde8d8', 7),
        ('Космос',  '🚀', '#e3e8f5', 8)
      ON CONFLICT (name) DO UPDATE SET emoji = EXCLUDED.emoji, bg_color = EXCLUDED.bg_color
      RETURNING id, name
    `);

    // Also fetch existing categories
    const allCats = await client.query('SELECT id, name FROM categories');
    const catMap = Object.fromEntries(allCats.rows.map(r => [r.name, r.id]));
    console.log('Categories:', Object.keys(catMap));

    const products = [
      // ── Зайцы ─────────────────────────────────────────────────────────────
      {
        name: 'Зайчик с цветочными ушками',
        price: 2400, cat: 'Зайцы', tag: 'Новый',
        sizes: ['Маленький', 'Средний', 'Большой'], stock: 20,
        img: '/images/products/floral-bunny.jpg',
        images: ['/images/products/floral-bunny.jpg'],
        desc: 'Нежный зайчик с ушками, украшенными цветочным принтом. Настоящий весенний подарок!',
      },
      {
        name: 'Зайчик Астрид со звёздочкой',
        price: 2600, cat: 'Зайцы', tag: 'Хит',
        sizes: ['Маленький', 'Средний', 'Большой'], stock: 18,
        img: '/images/products/star-bunny.jpg',
        images: ['/images/products/star-bunny.jpg', '/images/products/star-bunny-2.jpg'],
        desc: 'Мягкий зайчик Астрид со звёздочкой на груди — мечтательный и нежный.',
      },
      {
        name: 'Зайчик с суккулентом',
        price: 2500, cat: 'Зайцы', tag: 'Новый',
        sizes: ['Маленький', 'Средний'], stock: 15,
        img: '/images/products/succulent-bunny.jpg',
        images: ['/images/products/succulent-bunny.jpg'],
        desc: 'Зайчик, держащий крошечный суккулент — для тех, кто любит природу.',
      },

      // ── Забавные ──────────────────────────────────────────────────────────
      {
        name: 'Фисташка',
        price: 1900, cat: 'Забавные', tag: 'Новый',
        sizes: ['Маленький', 'Средний'], stock: 30,
        img: '/images/products/pistachio.jpg',
        images: ['/images/products/pistachio.jpg'],
        desc: 'Пухлая зелёная фисташка с улыбкой — такая мягкая, что не оторваться!',
      },
      {
        name: 'Круассан',
        price: 2100, cat: 'Забавные', tag: 'Хит',
        sizes: ['Маленький', 'Средний'], stock: 25,
        img: '/images/products/croissant.jpg',
        images: ['/images/products/croissant.jpg'],
        desc: 'Хрустящий снаружи и мягкий внутри — ну почти как настоящий! Не для еды.',
      },
      {
        name: 'Зефирки',
        price: 2200, cat: 'Забавные', tag: 'Новый',
        sizes: ['Маленький', 'Средний'], stock: 22,
        img: '/images/products/marshmallow.jpg',
        images: ['/images/products/marshmallow.jpg'],
        desc: 'Розовая и белая зефирки-подружки. Мягкие, как настоящий зефир!',
      },
      {
        name: 'Плющ в горшке',
        price: 2300, cat: 'Забавные', tag: 'Новый',
        sizes: ['Маленький', 'Средний'], stock: 18,
        img: '/images/products/ivy-plant.jpg',
        images: ['/images/products/ivy-plant.jpg'],
        desc: 'Пушистый плющ в горшке — не нужно поливать, зато очень мило!',
      },
      {
        name: 'Лампочка',
        price: 2000, cat: 'Забавные', tag: 'Новый',
        sizes: ['Маленький', 'Средний'], stock: 28,
        img: '/images/products/lightbulb.jpg',
        images: ['/images/products/lightbulb.jpg'],
        desc: 'Озарит любую комнату своим светом — ну, почти. Зато очень уютная!',
      },
      {
        name: 'Арахис в очках',
        price: 2100, cat: 'Забавные', tag: 'Популярный',
        sizes: ['Маленький', 'Средний'], stock: 24,
        img: '/images/products/cool-peanut.jpg',
        images: ['/images/products/cool-peanut.jpg'],
        desc: 'Стильный арахис в солнечных очках — самый крутой персонаж коллекции.',
      },
      {
        name: 'Гортензия',
        price: 2400, cat: 'Забавные', tag: 'Новый',
        sizes: ['Маленький', 'Средний'], stock: 16,
        img: '/images/products/hydrangea.jpg',
        images: ['/images/products/hydrangea.jpg'],
        desc: 'Пышная голубая гортензия — мягкий цветок для самых нежных объятий.',
      },
      {
        name: 'Яйцо-учёный',
        price: 2200, cat: 'Забавные', tag: 'Новый',
        sizes: ['Маленький', 'Средний'], stock: 20,
        img: '/images/products/egg-scientist.jpg',
        images: ['/images/products/egg-scientist.jpg'],
        desc: 'Умное яйцо в халате и очках. Готово открывать великие тайны вселенной!',
      },
      {
        name: 'Инопланетянин',
        price: 2300, cat: 'Забавные', tag: 'Новый',
        sizes: ['Маленький', 'Средний'], stock: 19,
        img: '/images/products/alien.jpg',
        images: ['/images/products/alien.jpg'],
        desc: 'Дружелюбный зелёный пришелец с большими глазами. Прилетел за объятиями!',
      },
      {
        name: 'Злой шарик',
        price: 1800, cat: 'Забавные', tag: 'Хит',
        sizes: ['Маленький', 'Средний', 'Большой'], stock: 35,
        img: '/images/products/angry-ball.jpg',
        images: ['/images/products/angry-ball.jpg'],
        desc: 'Оранжевый шарик с нахмуренными бровями. Такой сердитый и такой милый!',
      },
      {
        name: 'НЛО',
        price: 2500, cat: 'Забавные', tag: 'Новый',
        sizes: ['Маленький', 'Средний'], stock: 14,
        img: '/images/products/ufo.jpg',
        images: ['/images/products/ufo.jpg'],
        desc: 'Загадочное НЛО приземлилось прямо к вам в руки. Мягкое и совершенно безопасное!',
      },
      {
        name: 'Арахис',
        price: 1900, cat: 'Забавные', tag: 'Популярный',
        sizes: ['Крошечный', 'Маленький', 'Средний'], stock: 32,
        img: '/images/products/peanut.jpg',
        images: ['/images/products/peanut.jpg'],
        desc: 'Классический арахис — без очков, зато с душой. Идеальный маленький дружок.',
      },
      {
        name: 'Именинный торт',
        price: 2700, cat: 'Забавные', tag: 'Хит',
        sizes: ['Маленький', 'Средний', 'Большой'], stock: 21,
        img: '/images/products/birthday-cake.jpg',
        images: ['/images/products/birthday-cake.jpg', '/images/products/birthday-cake-2.jpg'],
        desc: 'Праздничный торт со свечками! Лучший подарок на день рождения.',
      },

      // ── Океан ─────────────────────────────────────────────────────────────
      {
        name: 'Розовый скат',
        price: 2800, cat: 'Океан', tag: 'Новый',
        sizes: ['Маленький', 'Средний', 'Большой'], stock: 17,
        img: '/images/products/pink-ray.jpg',
        images: ['/images/products/pink-ray.jpg'],
        desc: 'Нежный розовый скат с бархатистой кожей. Плавно скользит прямо в объятия!',
      },
      {
        name: 'Краб оранжевый',
        price: 2400, cat: 'Океан', tag: 'Популярный',
        sizes: ['Маленький', 'Средний'], stock: 23,
        img: '/images/products/orange-crab.jpg',
        images: ['/images/products/orange-crab.jpg'],
        desc: 'Весёлый оранжевый краб с восемью ножками. Щекочет воображение!',
      },
      {
        name: 'Красный омар',
        price: 3100, cat: 'Океан', tag: 'Новый',
        sizes: ['Маленький', 'Средний', 'Большой'], stock: 13,
        img: '/images/products/red-lobster.jpg',
        images: ['/images/products/red-lobster.jpg'],
        desc: 'Элегантный красный омар с длинными усиками. Король морских глубин!',
      },

      // ── Дикие ─────────────────────────────────────────────────────────────
      {
        name: 'Лягушка',
        price: 2100, cat: 'Дикие', tag: 'Новый',
        sizes: ['Маленький', 'Средний', 'Большой'], stock: 26,
        img: '/images/products/frog.jpg',
        images: ['/images/products/frog.jpg', '/images/products/frog-2.jpg'],
        desc: 'Зелёная лягушка с широкой улыбкой — позитивная и очень мягкая!',
      },
      {
        name: 'Бегемотик',
        price: 2600, cat: 'Дикие', tag: 'Новый',
        sizes: ['Маленький', 'Средний', 'Большой'], stock: 15,
        img: '/images/products/hippo.jpg',
        images: ['/images/products/hippo.jpg'],
        desc: 'Серый бегемотик с пухлыми щёчками — добродушный великан в миниатюре.',
      },

      // ── Медведи ───────────────────────────────────────────────────────────
      {
        name: 'Медведь Гарри в свитере',
        price: 3200, cat: 'Медведи', tag: 'Хит',
        sizes: ['Маленький', 'Средний', 'Большой'], stock: 18,
        img: '/images/products/harry-bear.jpg',
        images: ['/images/products/harry-bear.jpg', '/images/products/harry-bear-2.jpg'],
        desc: 'Тёплый медведь Гарри в уютном свитере. Готов к осени и объятиям!',
      },
      {
        name: 'Медведь Наоми',
        price: 2900, cat: 'Медведи', tag: null,
        sizes: ['Маленький', 'Средний', 'Большой'], stock: 20,
        img: '/images/products/naomi-bear.jpg',
        images: ['/images/products/naomi-bear.jpg', '/images/products/naomi-bear-2.jpg'],
        desc: 'Нежная медведица Наоми с шелковистым мехом и добрым взглядом.',
      },
      {
        name: 'Медведь Алекс',
        price: 2800, cat: 'Медведи', tag: null,
        sizes: ['Маленький', 'Средний', 'Большой'], stock: 22,
        img: '/images/products/alex-bear.jpg',
        images: ['/images/products/alex-bear.jpg', '/images/products/alex-bear-2.jpg'],
        desc: 'Классический медведь Алекс с пушистым брюшком — любимец всех поколений.',
      },
      {
        name: 'Медведь-моряк',
        price: 3000, cat: 'Медведи', tag: 'Хит',
        sizes: ['Маленький', 'Средний', 'Большой'], stock: 16,
        img: '/images/products/sailor-bear.jpg',
        images: ['/images/products/sailor-bear.jpg', '/images/products/sailor-bear-2.jpg'],
        desc: 'Бравый медведь-моряк в морской форме. Бороздит моря и сердца!',
      },
      {
        name: 'Маленький медведь',
        price: 1800, cat: 'Медведи', tag: 'Популярный',
        sizes: ['Крошечный', 'Маленький'], stock: 40,
        img: '/images/products/small-bear.jpg',
        images: ['/images/products/small-bear.jpg'],
        desc: 'Крошечный медведь — помещается в ладони. Идеален как брелок или подарок.',
      },

      // ── Космос ────────────────────────────────────────────────────────────
      {
        name: 'Собака-космонавт',
        price: 3400, cat: 'Космос', tag: 'Новый',
        sizes: ['Маленький', 'Средний', 'Большой'], stock: 12,
        img: '/images/products/space-dog.jpg',
        images: ['/images/products/space-dog.jpg'],
        desc: 'Отважная собака в скафандре. Готова покорять звёзды вместе с вами!',
      },
      {
        name: 'Комета',
        price: 2600, cat: 'Космос', tag: 'Новый',
        sizes: ['Маленький', 'Средний'], stock: 19,
        img: '/images/products/comet.jpg',
        images: ['/images/products/comet.jpg'],
        desc: 'Яркая комета с огненным хвостом. Промчится через вашу комнату со скоростью света!',
      },
    ];

    let inserted = 0;
    for (const p of products) {
      const catId = catMap[p.cat];
      if (!catId) { console.warn(`Unknown category: ${p.cat}`); continue; }
      await client.query(`
        INSERT INTO products (name, description, price, category_id, tag, image_url, images, sizes, stock)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        ON CONFLICT DO NOTHING
      `, [p.name, p.desc, p.price, catId, p.tag, p.img, p.images, p.sizes, p.stock]);
      inserted++;
    }

    await client.query('COMMIT');
    console.log(`✅ Done: ${inserted} products processed`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

addProducts();

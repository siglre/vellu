import pool from './pool.js';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding database...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // ---- Категории ----
    const cats = await client.query(`
      INSERT INTO categories (name, emoji, bg_color, sort_order) VALUES
        ('Зайцы',    '🐰', '#f3e8ff', 1),
        ('Забавные', '🌿', '#e8f5ea', 2),
        ('Океан',    '🐙', '#e3eeff', 3),
        ('Дикие',    '🦊', '#fff8e3', 4),
        ('Ферма',    '🐑', '#f3e5ff', 5),
        ('Слоны',    '🐘', '#eae8f6', 6)
      ON CONFLICT (name) DO NOTHING
      RETURNING id, name
    `);
    const catMap = Object.fromEntries(cats.rows.map(r => [r.name, r.id]));
    console.log('  ✓ Categories');

    // ---- Пользователи ----
    const passwordUser  = await bcrypt.hash('123456',   10);
    const passwordAdmin = await bcrypt.hash('admin123', 10);

    await client.query(`
      INSERT INTO users (name, email, password, role) VALUES
        ('Мария',          'user@vellu.ru',  $1, 'user'),
        ('Администратор',  'admin@vellu.ru', $2, 'admin')
      ON CONFLICT (email) DO NOTHING
    `, [passwordUser, passwordAdmin]);
    console.log('  ✓ Users');

    // ---- Товары ----
    const products = [
      { name: 'Серый зайчик Bashful',   price: 2200, cat: 'Зайцы',    tag: 'Хит',        sizes: ['Маленький','Средний','Большой'],            stock: 42, img: '/images/products/gray-bunny.jpg',   desc: 'С мягкими ушами и шелковистым тельцем, серый зайчик готов к объятиям.' },
      { name: 'Забавный авокадо',        price: 2000, cat: 'Забавные', tag: 'Новый',      sizes: ['Маленький','Средний'],                       stock: 28, img: '/images/products/avocado.jpg',       desc: 'Зелёный мех и пухлый кремовый животик. Весёлый дружок!' },
      { name: 'Розовый зайчик Bashful',  price: 2200, cat: 'Зайцы',    tag: null,         sizes: ['Маленький','Средний','Большой'],            stock: 17, img: '/images/products/pink-bunny.jpg',    desc: 'Розовый зайчик с мягкими ушами и нежным мехом.' },
      { name: 'Забавный гриб',           price: 1900, cat: 'Забавные', tag: 'Популярный', sizes: ['Маленький','Средний'],                       stock: 35, img: '/images/products/mushroom.jpg',      desc: 'Пухлая шляпка и коротенькие ножки. Настоящий весельчак!' },
      { name: 'Слон Fuddlewuddle',       price: 2500, cat: 'Слоны',    tag: null,         sizes: ['Маленький','Средний','Большой','XL'],       stock: 12, img: '/images/products/elephant.jpg',      desc: 'Большой синий красавец с мягкими ушами и бархатистым хоботом.' },
      { name: 'Забавное солнышко',       price: 1800, cat: 'Забавные', tag: 'Новый',      sizes: ['Маленький','Средний'],                       stock: 50, img: '/images/products/sunshine.jpg',      desc: 'Яркое и лучезарное, несёт радость везде.' },
      { name: 'Кремовый зайчик Bashful', price: 2200, cat: 'Зайцы',    tag: null,         sizes: ['Крошечный','Маленький','Средний','Большой'], stock: 22, img: '/images/products/cream-bunny.jpg',   desc: 'Мягкий кремовый мех и длинные ушки. Идеально для новорождённых.' },
      { name: 'Лиса Cordy Roy',          price: 2600, cat: 'Дикие',    tag: 'Хит',        sizes: ['Маленький','Средний'],                       stock: 19, img: '/images/products/fox.jpg',           desc: 'В рыжем вельвете с большим пушистым хвостом.' },
      { name: 'Забавная клементинка',        price: 1800, cat: 'Забавные', tag: 'Новый',      sizes: ['Маленький','Средний'],                       stock: 44, img: '/images/products/tomato.jpg',        desc: 'Маленькая и ароматная — мягкая клементинка, которую так и хочется обнять!' },
      { name: 'Осьминог Odell',          price: 3000, cat: 'Океан',    tag: 'Новый',      sizes: ['Маленький','Средний','Большой'],            stock: 15, img: '/images/products/octopus.jpg',       desc: 'Восемь щупалец и широкая улыбка!' },
      { name: 'Забавный персик',         price: 1900, cat: 'Забавные', tag: 'Новый',      sizes: ['Маленький','Средний'],                       stock: 31, img: '/images/products/peach.jpg',         desc: 'Нежно-розовый бархатный персик — просто не оторваться!' },
      { name: 'Ягнёнок Lottie',          price: 2300, cat: 'Ферма',    tag: 'Новый',      sizes: ['Маленький','Средний'],                       stock: 26, img: '/images/products/lamb.jpg',          desc: 'Пушистый ягнёнок с кудрявым кремовым мехом.' },
    ];

    for (const p of products) {
      await client.query(`
        INSERT INTO products (name, description, price, category_id, tag, image_url, sizes, stock)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        ON CONFLICT DO NOTHING
      `, [p.name, p.desc, p.price, catMap[p.cat], p.tag, p.img, p.sizes, p.stock]);
    }
    console.log('  ✓ Products');

    // ---- Настройки ----
    await client.query(`
      INSERT INTO settings (key, value) VALUES
        ('announce_bar',   'БЕСПЛАТНАЯ ДОСТАВКА ОТ ₽5 000 · БАРХАТНАЯ НЕЖНОСТЬ В КАЖДОЙ ИГРУШКЕ'),
        ('free_delivery',  '5000'),
        ('newsletter_on',  'true'),
        ('hero_slides',    '3')
      ON CONFLICT (key) DO NOTHING
    `);
    console.log('  ✓ Settings');

    await client.query('COMMIT');
    console.log('✅ Seed complete');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();

import pool from './pool.js';

const updates = [
  { name: 'Серый зайчик Bashful',   img: '/images/products/gray-bunny.jpg'  },
  { name: 'Забавный авокадо',        img: '/images/products/avocado.jpg'    },
  { name: 'Розовый зайчик Bashful',  img: '/images/products/pink-bunny.jpg' },
  { name: 'Забавный гриб',           img: '/images/products/mushroom.jpg'   },
  { name: 'Слон Fuddlewuddle',       img: '/images/products/elephant.jpg'   },
  { name: 'Забавное солнышко',       img: '/images/products/sunshine.jpg'     },
  { name: 'Кремовый зайчик Bashful', img: '/images/products/cream-bunny.jpg' },
  { name: 'Лиса Cordy Roy',          img: '/images/products/fox.jpg'         },
  { name: 'Забавный помидор',        img: '/images/products/tomato.jpg'       },
  { name: 'Осьминог Odell',          img: '/images/products/octopus.jpg'      },
  { name: 'Забавный персик',         img: '/images/products/peach.jpg'        },
  { name: 'Ягнёнок Lottie',          img: '/images/products/lamb.jpg'         },
];

const client = await pool.connect();
try {
  for (const { name, img } of updates) {
    const { rowCount } = await client.query(
      'UPDATE products SET image_url = $1 WHERE name = $2',
      [img, name]
    );
    console.log(rowCount ? `✓ ${name}` : `✗ не найден: ${name}`);
  }
  console.log('✅ Done');
} finally {
  client.release();
  await pool.end();
}

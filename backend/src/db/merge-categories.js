import pool from './pool.js';

const client = await pool.connect();
try {
  await client.query('BEGIN');

  // 1. Создаём Животные (Зайцы + Медведи + Слоны + Дикие)
  await client.query(`
    INSERT INTO categories (name, emoji)
    VALUES ('Животные', '🐾')
    ON CONFLICT (name) DO NOTHING
  `);
  const { rows: [animalsRow] } = await client.query(`SELECT id FROM categories WHERE name = 'Животные'`);

  const toAnimals = ['Зайцы', 'Медведи', 'Слоны', 'Дикие'];
  for (const cat of toAnimals) {
    const { rowCount } = await client.query(
      `UPDATE products SET category_id = $1
       WHERE category_id = (SELECT id FROM categories WHERE name = $2)`,
      [animalsRow.id, cat]
    );
    console.log(`✓ ${cat} → Животные (${rowCount} товаров)`);
  }

  // 2. Создаём Остальные (Космос + Ферма)
  await client.query(`
    INSERT INTO categories (name, emoji)
    VALUES ('Остальные', '✨')
    ON CONFLICT (name) DO NOTHING
  `);
  const { rows: [othersRow] } = await client.query(`SELECT id FROM categories WHERE name = 'Остальные'`);

  const toOthers = ['Космос', 'Ферма'];
  for (const cat of toOthers) {
    const { rowCount } = await client.query(
      `UPDATE products SET category_id = $1
       WHERE category_id = (SELECT id FROM categories WHERE name = $2)`,
      [othersRow.id, cat]
    );
    console.log(`✓ ${cat} → Остальные (${rowCount} товаров)`);
  }

  // 3. Удаляем старые пустые категории
  const oldCats = [...toAnimals, ...toOthers];
  for (const cat of oldCats) {
    await client.query(`DELETE FROM categories WHERE name = $1`, [cat]);
    console.log(`🗑 удалена категория: ${cat}`);
  }

  await client.query('COMMIT');

  // Итог
  const res = await client.query(`
    SELECT c.name, c.emoji, COUNT(p.id) as count
    FROM categories c
    LEFT JOIN products p ON p.category_id = c.id
    GROUP BY c.id, c.name, c.emoji
    ORDER BY count DESC
  `);
  console.log('\nИтог:');
  res.rows.forEach(r => console.log(`  ${r.emoji} ${r.name}: ${r.count} товаров`));
  console.log('\n✅ Done');
} catch (err) {
  await client.query('ROLLBACK');
  console.error('❌', err.message);
} finally {
  client.release();
  await pool.end();
}

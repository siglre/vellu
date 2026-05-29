export function errorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] ERROR:`, err.message);

  // PostgreSQL unique violation
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Запись уже существует' });
  }
  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Связанная запись не найдена' });
  }

  const status = err.status || 500;
  const message = err.message;

  res.status(status).json({ error: message });
}

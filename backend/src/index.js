import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

import authRoutes     from './routes/auth.routes.js';
import productRoutes  from './routes/products.routes.js';
import cartRoutes     from './routes/cart.routes.js';
import orderRoutes    from './routes/orders.routes.js';
import uploadRoutes   from './routes/upload.routes.js';
import { categoriesRouter, wishlistRouter, adminRouter, imagesRouter } from './routes/misc.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '../uploads');
mkdirSync(uploadsDir, { recursive: true });

const app  = express();
const PORT = process.env.PORT || 4000;

// ---- Middleware ----
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Логирование запросов в dev
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// ---- Static uploads ----
app.use('/uploads', express.static(uploadsDir));

// ---- Routes ----
app.use('/api/auth',       authRoutes);
app.use('/api/upload',     uploadRoutes);
app.use('/api/products',   productRoutes);
app.use('/api/categories', categoriesRouter);
app.use('/api/cart',       cartRoutes);
app.use('/api/orders',     orderRoutes);
app.use('/api/wishlist',   wishlistRouter);
app.use('/api/images',    imagesRouter);
app.use('/api/admin',      adminRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 Vellu API запущен на http://localhost:${PORT}`);
  console.log(`   Среда: ${process.env.NODE_ENV || 'development'}\n`);
});

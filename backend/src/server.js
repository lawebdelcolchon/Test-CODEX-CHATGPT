import express from 'express';
import cors from 'cors';
import imageRoutes from './routes/imageRoutes.js';
import productRoutes from './routes/productRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/products', productRoutes);
app.use('/api/images', imageRoutes);

app.use((err, _req, res, _next) => {
  console.error(err); // eslint-disable-line no-console
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`); // eslint-disable-line no-console
});

import { Router } from 'express';
import { getProducts, saveProducts } from '../utils/dataStore.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const products = await getProducts();
    res.json(products);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const products = await getProducts();
    const product = {
      id: `p-${Date.now()}`,
      name: req.body.name,
      description: req.body.description,
      price: Number(req.body.price) || 0,
      imageId: req.body.imageId ?? null
    };
    products.push(product);
    await saveProducts(products);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const products = await getProducts();
    const index = products.findIndex((p) => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const updated = { ...products[index], ...req.body };
    products[index] = updated;
    await saveProducts(products);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    let products = await getProducts();
    const before = products.length;
    products = products.filter((p) => p.id !== req.params.id);
    if (products.length === before) {
      return res.status(404).json({ message: 'Product not found' });
    }
    await saveProducts(products);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;

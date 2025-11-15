import { Router } from 'express';
import { getImages, saveImages } from '../utils/dataStore.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const images = await getImages();
    res.json(images);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const images = await getImages();
    const image = {
      id: `img-${Date.now()}`,
      title: req.body.title ?? 'Untitled',
      url: req.body.url
    };
    if (!image.url) {
      return res.status(400).json({ message: 'Image url is required' });
    }
    images.push(image);
    await saveImages(images);
    res.status(201).json(image);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    let images = await getImages();
    const before = images.length;
    images = images.filter((img) => img.id !== req.params.id);
    if (images.length === before) {
      return res.status(404).json({ message: 'Image not found' });
    }
    await saveImages(images);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;

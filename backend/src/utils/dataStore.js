import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const dataDir = resolve(process.cwd(), 'src', 'data');

const cache = new Map();

async function readJson(filename) {
  if (cache.has(filename)) {
    return cache.get(filename);
  }
  const file = resolve(dataDir, filename);
  const raw = await readFile(file, 'utf8');
  const parsed = JSON.parse(raw);
  cache.set(filename, parsed);
  return parsed;
}

async function writeJson(filename, data) {
  const file = resolve(dataDir, filename);
  await writeFile(file, JSON.stringify(data, null, 2));
  cache.set(filename, data);
  return data;
}

export async function getProducts() {
  return readJson('products.json');
}

export async function saveProducts(products) {
  return writeJson('products.json', products);
}

export async function getImages() {
  return readJson('images.json');
}

export async function saveImages(images) {
  return writeJson('images.json', images);
}

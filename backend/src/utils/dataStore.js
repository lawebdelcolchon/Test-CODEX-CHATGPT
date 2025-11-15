import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(__dirname, '../data');

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

export const getProducts = () => readJson('products.json');
export const saveProducts = (products) => writeJson('products.json', products);
export const getImages = () => readJson('images.json');
export const saveImages = (images) => writeJson('images.json', images);

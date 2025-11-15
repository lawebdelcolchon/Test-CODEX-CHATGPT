import http from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getImages, getProducts, saveImages, saveProducts } from './utils/dataStore.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const frontendDir = resolve(__dirname, '../../frontend');
const PORT = Number(process.env.PORT || 5000);
const HOST = process.env.HOST || '0.0.0.0';

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify(payload));
}

async function readBody(req) {
  return new Promise((resolveBody, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        resolveBody(data ? JSON.parse(data) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

async function handleProducts(req, res) {
  if (req.method === 'GET') {
    const products = await getProducts();
    return sendJson(res, 200, products);
  }

  if (req.method === 'POST') {
    try {
      const body = await readBody(req);
      if (!body.name || !body.description || typeof body.price !== 'number') {
        return sendJson(res, 400, { message: 'Datos incompletos' });
      }
      const products = await getProducts();
      const newProduct = {
        id: randomUUID(),
        name: body.name,
        description: body.description,
        price: Number(body.price),
        image: body.image || 'https://placehold.co/400x300/png',
      };
      products.push(newProduct);
      await saveProducts(products);
      return sendJson(res, 201, newProduct);
    } catch (error) {
      return sendJson(res, 400, { message: error.message });
    }
  }

  if (req.method === 'PUT') {
    try {
      const id = req.url.split('/').pop();
      const body = await readBody(req);
      const products = await getProducts();
      const index = products.findIndex((product) => product.id === id);
      if (index === -1) {
        return sendJson(res, 404, { message: 'Producto no encontrado' });
      }
      products[index] = { ...products[index], ...body, id };
      await saveProducts(products);
      return sendJson(res, 200, products[index]);
    } catch (error) {
      return sendJson(res, 400, { message: error.message });
    }
  }

  if (req.method === 'DELETE') {
    const id = req.url.split('/').pop();
    const products = await getProducts();
    const filtered = products.filter((product) => product.id !== id);
    if (filtered.length === products.length) {
      return sendJson(res, 404, { message: 'Producto no encontrado' });
    }
    await saveProducts(filtered);
    return sendJson(res, 204, {});
  }

  return sendJson(res, 405, { message: 'Método no permitido' });
}

async function handleImages(req, res) {
  if (req.method === 'GET') {
    const images = await getImages();
    return sendJson(res, 200, images);
  }

  if (req.method === 'POST') {
    try {
      const body = await readBody(req);
      if (!body.url || !body.alt) {
        return sendJson(res, 400, { message: 'Datos incompletos' });
      }
      const images = await getImages();
      const newImage = { id: randomUUID(), url: body.url, alt: body.alt };
      images.push(newImage);
      await saveImages(images);
      return sendJson(res, 201, newImage);
    } catch (error) {
      return sendJson(res, 400, { message: error.message });
    }
  }

  if (req.method === 'DELETE') {
    const id = req.url.split('/').pop();
    const images = await getImages();
    const filtered = images.filter((image) => image.id !== id);
    if (filtered.length === images.length) {
      return sendJson(res, 404, { message: 'Imagen no encontrada' });
    }
    await saveImages(filtered);
    return sendJson(res, 204, {});
  }

  return sendJson(res, 405, { message: 'Método no permitido' });
}

async function serveStatic(req, res, pathname) {
  let relativePath = pathname === '/' ? 'index.html' : pathname.slice(1);
  relativePath = normalize(relativePath);
  if (relativePath.startsWith('..')) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Acceso denegado');
    return null;
  }
  const filePath = join(frontendDir, relativePath);

  try {
    const fileInfo = await stat(filePath);
    if (fileInfo.isDirectory()) {
      return serveStatic(req, res, `${pathname.replace(/\/$/, '')}/index.html`);
    }
    const ext = extname(filePath) || '.html';
    res.writeHead(200, {
      'Content-Type': mimeTypes[ext] || 'text/plain',
      'Access-Control-Allow-Origin': '*',
    });
    createReadStream(filePath).pipe(res);
    return null;
  } catch (error) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Recurso no encontrado');
    return null;
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (url.pathname.startsWith('/api/products')) {
    return handleProducts(req, res);
  }
  if (url.pathname.startsWith('/api/images')) {
    return handleImages(req, res);
  }
  if (url.pathname === '/api/health') {
    return sendJson(res, 200, { status: 'ok', timestamp: new Date().toISOString() });
  }

  return serveStatic(req, res, url.pathname);
});

server.listen(PORT, HOST, () => {
  console.log(`Servidor disponible en http://${HOST}:${PORT}`); // eslint-disable-line no-console
});

# Lumen Store – Ecommerce full-stack demo

Proyecto full-stack que incluye:

- **Frontend React (Vite)** con catálogo, carrito y panel de administración de imágenes.
- **Backend Node/Express** con endpoints REST para productos e imágenes persistidos en JSON.

## Requisitos

- Node.js 18+
- npm 9+

## Instalación

```bash
npm install # instala prettier para el formateo opcional
(cd backend && npm install)
(cd frontend && npm install)
```

## Ejecutar backend

```bash
cd backend
npm run dev # servidor en http://localhost:5000
```

## Ejecutar frontend

```bash
cd frontend
npm run dev # Vite expone http://localhost:5173 con proxy a /api
```

## Endpoints disponibles

| Método | Ruta             | Descripción                              |
| ------ | ---------------- | ---------------------------------------- |
| GET    | `/api/products`  | Lista todo el catálogo                   |
| POST   | `/api/products`  | Crea un producto                         |
| PUT    | `/api/products/:id` | Actualiza un producto existente      |
| DELETE | `/api/products/:id` | Elimina un producto                   |
| GET    | `/api/images`    | Lista las imágenes disponibles           |
| POST   | `/api/images`    | Agrega una imagen nueva                  |
| DELETE | `/api/images/:id` | Elimina una imagen                      |

Los datos se guardan en `backend/src/data/*.json`. Para un entorno real sustituye el almacenaje por una base de datos.

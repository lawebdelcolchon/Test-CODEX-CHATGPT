# Lumen Store – Ecommerce sin dependencias externas

Proyecto full-stack listo para ejecutarse sin descargar paquetes de Internet. El servidor HTTP escrito con Node expone la API REST y también entrega el frontend estático, por lo que basta con tener Node 18+ para iniciar todo.

## Características

- **Frontend** en HTML + módulos JavaScript que replica la experiencia React: catálogo dinámico, carrito interactivo y panel de administración para productos e imágenes.
- **Backend** Node puro que gestiona productos e imágenes en archivos JSON y sirve los assets del frontend.
- **APIs REST** para CRUD de productos e imágenes, además de un endpoint de salud.

## Requisitos

- Node.js 18+

No se necesita `npm install` ni gestores de paquetes.

## Ejecutar

```bash
cd backend
node src/server.js
```

El servidor quedará disponible en `http://localhost:5000`. Se sirven las rutas de la API y el frontend:

| Método | Ruta                   | Descripción                        |
| ------ | ---------------------- | ---------------------------------- |
| GET    | `/api/products`        | Listado del catálogo               |
| POST   | `/api/products`        | Crear producto                     |
| PUT    | `/api/products/:id`    | Actualizar producto                |
| DELETE | `/api/products/:id`    | Eliminar producto                  |
| GET    | `/api/images`          | Listado de imágenes                |
| POST   | `/api/images`          | Crear registro de imagen           |
| DELETE | `/api/images/:id`      | Borrar imagen                      |
| GET    | `/api/health`          | Estado del servidor                |

Los datos se almacenan en `backend/src/data/*.json`. Puedes personalizarlos directamente o mediante el panel administrativo del frontend.

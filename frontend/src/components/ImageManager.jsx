import { useState } from 'react';

export default function ImageManager({ images, onCreate, onDelete, products, onProductCreate }) {
  const [form, setForm] = useState({ title: '', url: '' });
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', imageId: '' });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.url) return;
    await onCreate(form);
    setForm({ title: '', url: '' });
  }

  async function handleProductSubmit(e) {
    e.preventDefault();
    if (!productForm.name || !productForm.price) return;
    await onProductCreate({
      name: productForm.name,
      description: productForm.description,
      price: Number(productForm.price),
      imageId: productForm.imageId || null
    });
    setProductForm({ name: '', description: '', price: '', imageId: '' });
  }

  return (
    <div className="panel image-manager">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Recursos visuales</p>
          <h2>Administrador de imágenes</h2>
        </div>
        <span className="badge">{images.length} imágenes</span>
      </div>

      <section className="image-grid">
        {images.map((image) => (
          <figure key={image.id}>
            <img src={image.url} alt={image.title} />
            <figcaption>
              <strong>{image.title}</strong>
              <button className="ghost" onClick={() => onDelete(image.id)}>
                Eliminar
              </button>
            </figcaption>
          </figure>
        ))}
      </section>

      <div className="forms">
        <form onSubmit={handleSubmit} className="form-card">
          <h3>Agregar imagen</h3>
          <label>
            Título
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </label>
          <label>
            URL
            <input
              required
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://..."
            />
          </label>
          <button className="primary">Guardar</button>
        </form>

        <form onSubmit={handleProductSubmit} className="form-card">
          <h3>Crear producto</h3>
          <label>
            Nombre
            <input
              required
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
            />
          </label>
          <label>
            Descripción
            <textarea
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
            />
          </label>
          <label>
            Precio
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={productForm.price}
              onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
            />
          </label>
          <label>
            Imagen
            <select
              value={productForm.imageId}
              onChange={(e) => setProductForm({ ...productForm, imageId: e.target.value })}
            >
              <option value="">Sin imagen</option>
              {images.map((image) => (
                <option key={image.id} value={image.id}>
                  {image.title}
                </option>
              ))}
            </select>
          </label>
          <button className="primary">Crear producto</button>
        </form>
      </div>

      <section className="product-table">
        <h3>Inventario actual</h3>
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Precio</th>
              <th>Imagen</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>${product.price.toFixed(2)}</td>
                <td>{product.imageId || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

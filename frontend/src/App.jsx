import { useEffect, useMemo, useState } from 'react';
import ProductList from './components/ProductList.jsx';
import CartPanel from './components/CartPanel.jsx';
import ImageManager from './components/ImageManager.jsx';
import useCart from './hooks/useCart.js';
import { apiClient } from './api/client.js';

const tabs = [
  { id: 'shop', label: 'Tienda' },
  { id: 'images', label: 'Administrador de imágenes' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('shop');
  const [products, setProducts] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { cart, addToCart, removeFromCart, total } = useCart();

  const imageMap = useMemo(
    () => Object.fromEntries(images.map((img) => [img.id, img])),
    [images]
  );

  useEffect(() => {
    async function bootstrap() {
      try {
        const [productData, imageData] = await Promise.all([
          apiClient('/products'),
          apiClient('/images')
        ]);
        setProducts(productData);
        setImages(imageData);
      } catch (err) {
        setError('No pudimos obtener los datos del servidor.');
        console.error(err); // eslint-disable-line no-console
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
  }, []);

  const heroImage = imageMap[products[0]?.imageId];

  async function handleProductCreate(payload) {
    const created = await apiClient('/products', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    setProducts((prev) => [...prev, created]);
  }

  async function handleImageCreate(payload) {
    const created = await apiClient('/images', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    setImages((prev) => [...prev, created]);
  }

  async function handleImageDelete(id) {
    await apiClient(`/images/${id}`, { method: 'DELETE' });
    setImages((prev) => prev.filter((img) => img.id !== id));
  }

  if (loading) {
    return <div className="app-shell">Cargando tienda...</div>;
  }

  if (error) {
    return <div className="app-shell error">{error}</div>;
  }

  return (
    <div className="app-shell">
      <header className="hero" style={{ backgroundImage: `url(${heroImage?.url})` }}>
        <div className="overlay" />
        <div className="hero-content">
          <p className="eyebrow">Colección Primavera 2025</p>
          <h1>Todo lo que necesitas para tu espacio creativo</h1>
          <p>
            Descubre productos seleccionados cuidadosamente para mejorar tu estudio, con envío
            rápido y pagos seguros.
          </p>
          <button onClick={() => setActiveTab('shop')}>Explorar productos</button>
        </div>
      </header>

      <nav className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={tab.id === activeTab ? 'active' : ''}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === 'shop' ? (
        <section className="content-grid">
          <ProductList products={products} images={imageMap} onAddToCart={addToCart} />
          <CartPanel cart={cart} total={total} onRemove={removeFromCart} />
        </section>
      ) : (
        <ImageManager
          images={images}
          onCreate={handleImageCreate}
          onDelete={handleImageDelete}
          products={products}
          onProductCreate={handleProductCreate}
        />
      )}
    </div>
  );
}

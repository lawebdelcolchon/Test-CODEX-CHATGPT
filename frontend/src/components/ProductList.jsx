export default function ProductList({ products, images, onAddToCart }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Productos destacados</p>
          <h2>Catálogo</h2>
        </div>
        <span className="badge">{products.length} ítems</span>
      </div>
      <div className="product-grid">
        {products.map((product) => (
          <article key={product.id} className="product-card">
            <img src={images[product.imageId]?.url} alt={product.name} />
            <h3>{product.name}</h3>
            <p className="description">{product.description}</p>
            <div className="product-meta">
              <span className="price">${product.price.toFixed(2)}</span>
              <button onClick={() => onAddToCart(product)}>Agregar</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

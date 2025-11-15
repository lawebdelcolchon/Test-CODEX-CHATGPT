export default function CartPanel({ cart, total, onRemove }) {
  return (
    <aside className="panel cart-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Tu pedido</p>
          <h2>Carrito</h2>
        </div>
        <span className="badge">{cart.length} productos</span>
      </div>

      {cart.length === 0 ? (
        <p className="empty">El carrito está vacío.</p>
      ) : (
        <ul className="cart-list">
          {cart.map((item) => (
            <li key={item.id}>
              <div>
                <strong>{item.name}</strong>
                <p>{item.qty} x ${item.price.toFixed(2)}</p>
              </div>
              <button className="ghost" onClick={() => onRemove(item.id)}>
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="cart-total">
        <span>Total</span>
        <strong>${total}</strong>
      </div>

      <button className="primary" disabled={cart.length === 0}>
        Confirmar pedido
      </button>
    </aside>
  );
}

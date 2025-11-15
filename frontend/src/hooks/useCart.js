import { useMemo, useState } from 'react';

export default function useCart() {
  const [cart, setCart] = useState([]);

  function addToCart(product) {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  }

  function removeFromCart(productId) {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  }

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.qty, 0).toFixed(2),
    [cart]
  );

  return { cart, addToCart, removeFromCart, total };
}

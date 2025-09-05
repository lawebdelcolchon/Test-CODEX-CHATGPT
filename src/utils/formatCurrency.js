export function formatCurrency(n, currency = "EUR") {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency }).format(n);
}

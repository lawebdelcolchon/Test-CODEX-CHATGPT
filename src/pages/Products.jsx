// src/pages/Products.jsx
import ContainerLayout from "../layouts/ContainerLayout.jsx";
import DataSet from "../mocks/products.json";
import { useStatusBadge } from "../hooks/useStatusBadge.jsx";

// Componente separado para el StatusBadge
function ProductStatusBadge({ status }) {
  return useStatusBadge(status === "active", status === "active" ? "Publicado" : "Borrador");
}

export default function Products() {

  const columnsData = [
    { key: "title", label: "Producto", accessor: "title", dataIndex: "title", render: (row) => (
      <div className="flex h-full w-full max-w-[250px] items-center gap-x-3 overflow-hidden">
        <div className="w-fit flex-shrink-0">
          <div className="bg-ui-bg-component border-ui-border-base flex items-center justify-center overflow-hidden rounded border h-8 w-6">
            <img src={row.thumbnail} className="h-full w-full object-cover object-center" />
          </div>
        </div>
        <span className="truncate">{row.title}</span>
      </div>
    )},
    { key: "status", label: "Estado", accessor: "status", dataIndex: "status", render: (row) => (
      <ProductStatusBadge status={row.status} />
    )},
    { key: "price", label: "Precio", accessor: "price", dataIndex: "price", render: (price) => `$${(price / 100).toFixed(2)}` },
    { key: "inventory_quantity", label: "Stock", accessor: "inventory_quantity", dataIndex: "inventory_quantity" },
    { key: "category", label: "Categoría", accessor: "category", dataIndex: "category" },
  ];

  return (
    <ContainerLayout
      entityName="products"
      columnsData={columnsData}
      orderKeys={["Producto", "Estado", "Precio", "Stock", "Categoría"]}
      DataSet={DataSet}
      emptyMessage="No se encontraron productos"
    />
  );
}

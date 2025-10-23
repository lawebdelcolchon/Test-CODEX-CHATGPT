// src/pages/Products.jsx
import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ContainerLayoutV2 from "../layouts/ContainerLayoutV2.jsx";
import { useStatusBadge } from "../hooks/useStatusBadge.jsx";
import { hasPermission } from "../utils/permissions.js";
import { useSelector } from "react-redux";
import {
  useProductsQuery,
  useDeleteProductMutation
} from "../hooks/queries/useProducts.js";
import { formatCurrency } from "../utils/formatters.js";

// Componente separado para el StatusBadge de productos DecorLujo
function ProductStatusBadge({ active, visible, marked }) {
  // En DecorLujo, el estado se maneja con active, visible y marked
  if (active && visible) {
    return useStatusBadge(true, marked ? 'Destacado' : 'Activo');
  } else if (active && !visible) {
    return useStatusBadge(false, 'Oculto');
  } else {
    return useStatusBadge(false, 'Inactivo');
  }
}

export default function Products() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Verificar permisos
  const userHasAccess = hasPermission(user, ['all', 'products']);

  // Handler para navegar a crear producto
  const handleCreateProduct = useCallback(() => {
    navigate('/products/create');
  }, [navigate]);

  // Si no tiene permisos, mostrar mensaje
  if (!userHasAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="mb-4">
          <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m13-9a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Acceso Denegado</h2>
        <p className="text-gray-500 mb-4">No tienes permisos para acceder a los productos.</p>
        <p className="text-sm text-gray-400">Permisos actuales: {user?.permissions?.join(', ') || 'No definidos'}</p>
      </div>
    );
  }

  const columnsData = [
    {
      key: "name",
      label: "Producto",
      accessor: "name",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-ui-fg-base truncate">{row.name || "-"}</span>
          <span className="text-sm text-ui-fg-muted">Código: {row.code || "-"}</span>
        </div>
      ),
    },
    {
      key: "category",
      label: "Categoría",
      accessor: "category",
      render: (row) => <span className="truncate">{row.category?.name || "Sin categoría"}</span>,
    },
    {
      key: "tax",
      label: "Impuesto",
      accessor: "tax",
      render: (row) => (
        <span className="text-center">
          {row.tax !== undefined && row.tax !== null ? `${parseFloat(row.tax).toFixed(1)}%` : "0.0%"}
        </span>
      ),
    },
    {
      key: "units",
      label: "Unidades",
      accessor: "units",
      render: (row) => (
        <span className="text-center">
          {row.units || "unidad"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Estado",
      accessor: "status",
      render: (row) => (
        <ProductStatusBadge 
          active={row.active} 
          visible={row.visible} 
          marked={row.marked}
        />
      ),
    },
    {
      key: "created_at",
      label: "Fecha de Creación",
      accessor: "created_at",
      render: (row) => row.created_at
        ? new Date(row.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })
        : "-",
    },
  ];

  // Personalizar el handler de nuevo
  const handleNew = useCallback(() => {
    handleCreateProduct();
  }, [handleCreateProduct]);

  // Handler personalizado para edición - navegar a la página de edición
  const handleEdit = useCallback((product) => {
    navigate(`/products/${product.id}/edit`);
  }, [navigate]);

  return (
    <>
      <ContainerLayoutV2
        resourceName="products"
        columnsData={columnsData}
        orderKeys={["name", "category", "tax", "units", "status", "created_at"]}
        emptyMessage="No se encontraron productos"
        useListQuery={useProductsQuery}
        useDeleteMutation={useDeleteProductMutation}
        requiredPermissions={['all', 'products']}
        defaultPageSize={20}
        defaultSort={{ field: 'created_at', order: 'desc' }}
        onNew={handleNew}
        onEdit={handleEdit}
        viewPath="/products/:id"
        editPath="/products/:id/edit"
        createPath="/products/create"
      />
    </>
  );
}

// src/pages/Orders.jsx
import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ContainerLayoutV2 from "../layouts/ContainerLayoutV2.jsx";
import { useStatusBadge } from "../hooks/useStatusBadge.jsx";
import { hasPermission } from "../utils/permissions.js";
import { useSelector } from "react-redux";
import {
  useOrdersQuery,
  useDeleteOrderMutation
} from "../hooks/queries/useOrders.js";

// Componente para el StatusBadge de órdenes
function OrderStatusBadge({ status }) {
  // Mapeo de estados comunes (ajustar según tu sistema)
  const statusMap = {
    1: { label: 'Pendiente', color: 'warning' },
    2: { label: 'Procesando', color: 'info' },
    3: { label: 'Completada', color: 'success' },
    4: { label: 'Cancelada', color: 'error' },
    5: { label: 'Nuevo', color: 'default' }
  };
  
  const statusInfo = statusMap[status] || { label: `Estado ${status}`, color: 'default' };
  return useStatusBadge(true, statusInfo.label);
}

export default function Orders() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Verificar permisos
  const userHasAccess = hasPermission(user, ['all', 'orders']);

  // Handler para navegar a crear orden
  const handleCreateOrder = useCallback(() => {
    navigate('/orders-client/create');
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
        <p className="text-gray-500 mb-4">No tienes permisos para acceder a los pedidos.</p>
        <p className="text-sm text-gray-400">Permisos actuales: {user?.permissions?.join(', ') || 'No definidos'}</p>
      </div>
    );
  }

  const columnsData = [
    {
      key: "code_order",
      label: "Código",
      accessor: "code_order",
      render: (row) => (
        <span className="font-medium text-ui-fg-base truncate">
          {row.code_order || `#${row.id}`}
        </span>
      ),
    },
    {
      key: "client",
      label: "Cliente",
      accessor: "client",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-ui-fg-base truncate">
            {row.client?.name || row.client?.email || "-"}
          </span>
          {row.client?.email && row.client?.name && (
            <span className="text-sm text-ui-fg-muted truncate">{row.client.email}</span>
          )}
        </div>
      ),
    },
    {
      key: "date",
      label: "Fecha",
      accessor: "date",
      render: (row) => row.date
        ? new Date(row.date).toLocaleDateString("es-ES", { 
            day: "numeric", 
            month: "short", 
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })
        : "-",
    },
    {
      key: "grandtotal",
      label: "Total",
      accessor: "grandtotal",
      render: (row) => (
        <span className="font-medium">
          {row.grandtotal ? `€${parseFloat(row.grandtotal).toFixed(2)}` : "-"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Estado",
      accessor: "status_order",
      render: (row) => (
        <OrderStatusBadge status={row.status_order} />
      ),
    },
    {
      key: "promise_date",
      label: "Fecha Prometida",
      accessor: "promise_date",
      render: (row) => row.promise_date
        ? new Date(row.promise_date).toLocaleDateString("es-ES", { 
            day: "numeric", 
            month: "short", 
            year: "numeric" 
          })
        : "-",
    },
  ];

  // Personalizar el handler de nuevo
  const handleNew = useCallback(() => {
    handleCreateOrder();
  }, [handleCreateOrder]);

  // Handler personalizado para edición - navegar a la página de edición
  const handleEdit = useCallback((order) => {
    navigate(`/orders-client/${order.id}/edit`);
  }, [navigate]);

  return (
    <>
      <ContainerLayoutV2
        resourceName="orders"
        columnsData={columnsData}
        orderKeys={["code_order", "client", "date", "grandtotal", "status", "promise_date"]}
        emptyMessage="No se encontraron pedidos"
        useListQuery={useOrdersQuery}
        useDeleteMutation={useDeleteOrderMutation}
        requiredPermissions={['all', 'orders']}
        defaultPageSize={20}
        defaultSort={{ field: 'date', order: 'desc' }}
        onNew={handleNew}
        onEdit={handleEdit}
        viewPath="/orders-client/:id"
        editPath="/orders-client/:id/edit"
        createPath="/orders-client/create"
      />
    </>
  );
}

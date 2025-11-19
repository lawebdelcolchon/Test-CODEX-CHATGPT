// src/pages/Invoices.jsx
import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import ContainerLayoutV2 from "../layouts/ContainerLayoutV2.jsx";
import { useStatusBadge } from "../hooks/useStatusBadge.jsx";
import { hasPermission } from "../utils/permissions.js";
import { useSelector } from "react-redux";
import {
  useInvoicesQuery,
  useDeleteInvoiceMutation,
  useSendToAeatMutation,
  useCancelInvoiceMutation
} from "../hooks/queries/useInvoices.js";
import { Button } from "@medusajs/ui";

// Componente para el StatusBadge de facturas
function InvoiceStatusBadge({ payed, canceled_date }) {
  if (canceled_date) {
    return useStatusBadge(false, 'Anulada');
  }
  return useStatusBadge(payed, payed ? 'Pagada' : 'Pendiente');
}

export default function Invoices() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Verificar permisos
  const userHasAccess = hasPermission(user, ['all', 'invoices']);

  // Mutations
  const sendToAeatMutation = useSendToAeatMutation({
    onSuccess: () => {
      alert('Factura transmitida correctamente a AEAT');
    },
    onError: (error) => {
      alert('Error al transmitir: ' + error.message);
    }
  });

  const cancelInvoiceMutation = useCancelInvoiceMutation({
    onSuccess: () => {
      alert('Factura anulada correctamente');
    },
    onError: (error) => {
      alert('Error al anular: ' + error.message);
    }
  });

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
        <p className="text-gray-500 mb-4">No tienes permisos para acceder a las facturas.</p>
        <p className="text-sm text-gray-400">Permisos actuales: {user?.permissions?.join(', ') || 'No definidos'}</p>
      </div>
    );
  }

  const columnsData = [
    {
      key: "serie_number",
      label: "Factura",
      accessor: "serie",
      render: (row) => (
        <span className="font-medium text-ui-fg-base">
          {row.serie}-{row.number}
        </span>
      ),
    },
    {
      key: "data",
      label: "Fecha",
      accessor: "data",
      render: (row) => row.data
        ? new Date(row.data).toLocaleDateString("es-ES", { 
            day: "numeric", 
            month: "short", 
            year: "numeric" 
          })
        : "-",
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
        </div>
      ),
    },
    {
      key: "subtotal",
      label: "Subtotal",
      accessor: "subtotal",
      render: (row) => (
        <span>
          €{parseFloat(row.subtotal || 0).toFixed(2)}
        </span>
      ),
    },
    {
      key: "tax",
      label: "IVA",
      accessor: "tax",
      render: (row) => (
        <span>
          €{parseFloat(row.tax || 0).toFixed(2)}
        </span>
      ),
    },
    {
      key: "grandtotal",
      label: "Total",
      accessor: "grandtotal",
      render: (row) => (
        <span className="font-medium">
          €{parseFloat(row.grandtotal || 0).toFixed(2)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Estado",
      accessor: "payed",
      render: (row) => (
        <InvoiceStatusBadge payed={row.payed} canceled_date={row.canceled_date} />
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      accessor: "id",
      render: (row) => (
        <div className="flex gap-2">
          {!row.canceled_date && (
            <>
              <Button
                size="small"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/invoices/${row.id}`);
                }}
              >
                Consultar
              </Button>
              <Button
                size="small"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`¿Transmitir factura ${row.serie}-${row.number} a AEAT?`)) {
                    sendToAeatMutation.mutate(row.id);
                  }
                }}
                disabled={sendToAeatMutation.isLoading}
              >
                Transmitir
              </Button>
              <Button
                size="small"
                variant="danger"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`¿Anular factura ${row.serie}-${row.number}?`)) {
                    cancelInvoiceMutation.mutate(row.id);
                  }
                }}
                disabled={cancelInvoiceMutation.isLoading}
              >
                Anular
              </Button>
            </>
          )}
          {row.canceled_date && (
            <span className="text-ui-fg-muted txt-compact-small">Factura anulada</span>
          )}
        </div>
      ),
    },
  ];

  // Handler personalizado para edición
  const handleEdit = useCallback((invoice) => {
    navigate(`/invoices/${invoice.id}`);
  }, [navigate]);

  return (
    <>
      <ContainerLayoutV2
        resourceName="invoices"
        columnsData={columnsData}
        orderKeys={["serie_number", "data", "client", "subtotal", "tax", "grandtotal", "status"]}
        emptyMessage="No se encontraron facturas"
        useListQuery={useInvoicesQuery}
        useDeleteMutation={useDeleteInvoiceMutation}
        requiredPermissions={['all', 'invoices']}
        defaultPageSize={20}
        defaultSort={{ field: 'data', order: 'desc' }}
        onEdit={handleEdit}
        viewPath="/invoices/:id"
        editPath="/invoices/:id"
        showNewButton={false}
      />
    </>
  );
}

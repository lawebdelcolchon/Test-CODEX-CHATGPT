// src/features/invoices/index.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge, Button } from "@medusajs/ui";
import DataLayout from "../../layouts/DataLayout.jsx";
import { hasPermission } from "../../utils/permissions.js";
import { useSelector } from "react-redux";
import {
  useInvoiceQuery,
  useDeleteInvoiceMutation,
  useSendToAeatMutation,
  useCancelInvoiceMutation,
  useCheckAeatStatusQuery
} from "../../hooks/queries/useInvoices.js";
import { formatDate } from "../../utils/formatters.js";

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Obtener usuario y verificar permisos
  const { user } = useSelector((state) => state.auth);
  const canEdit = hasPermission(user, ['all', 'invoices']);
  const canDelete = hasPermission(user, ['all', 'invoices']);

  // Estado para controlar consulta de AEAT
  const [checkingAeat, setCheckingAeat] = useState(false);

  // Queries
  const {
    data: invoice,
    isLoading: isInvoiceLoading,
    error: invoiceError,
  } = useInvoiceQuery(id);

  // Query de estado AEAT (solo se ejecuta cuando checkingAeat es true)
  const {
    data: aeatStatus,
    isLoading: isAeatLoading,
    refetch: refetchAeatStatus
  } = useCheckAeatStatusQuery(id, { enabled: checkingAeat });

  // Mutations
  const deleteInvoiceMutation = useDeleteInvoiceMutation({
    onSuccess: (result, deletedId) => {
      if (String(deletedId) === String(id)) {
        navigate('/invoices');
      }
    },
    onError: (error) => {
      alert('Error al eliminar la factura: ' + error.message);
    }
  });

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
      navigate('/invoices');
    },
    onError: (error) => {
      alert('Error al anular: ' + error.message);
    }
  });

  // Manejadores
  const handleDelete = async (entity) => {
    console.log('🗑️ Eliminando factura:', entity.id);
    return deleteInvoiceMutation.mutateAsync(entity.id);
  };

  const handleSendToAeat = async () => {
    if (confirm(`¿Transmitir factura ${invoice.serie}-${invoice.number} a AEAT?`)) {
      await sendToAeatMutation.mutateAsync(id);
    }
  };

  const handleCancelInvoice = async () => {
    if (confirm(`¿Anular factura ${invoice.serie}-${invoice.number}? Esta acción no se puede deshacer.`)) {
      await cancelInvoiceMutation.mutateAsync(id);
    }
  };

  const handleCheckAeatStatus = async () => {
    setCheckingAeat(true);
    await refetchAeatStatus();
  };

  // Custom handlers
  const customHandlers = {
    onDelete: (entity) => {
      if (!canDelete) {
        alert('No tienes permisos para eliminar facturas');
        return;
      }
      handleDelete(entity);
    }
  };

  // Render functions for DataLayout
  const renderHeader = ({ entity, ActionsMenu }) => {
    if (!entity) return null;
    
    return (
      <>
        <h1 className="font-sans font-medium h1-core">
          Factura {entity.serie}-{entity.number}
        </h1>
      <div className="flex items-center gap-x-2">
        <Badge
          variant={entity.canceled_date ? "danger" : (entity.payed ? "success" : "warning")}
          size="small"
          className="txt-compact-xsmall-plus"
        >
          {entity.canceled_date ? 'Anulada' : (entity.payed ? 'Pagada' : 'Pendiente')}
        </Badge>
        <ActionsMenu />
      </div>
    </>
    );
  };

  renderHeader.additionalRows = ({ entity }) => {
    if (!entity) return null;
    
    return (
    <>
      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <p className="font-medium font-sans txt-compact-small">ID</p>
        <p className="font-normal font-sans txt-compact-small">#{entity.id}</p>
      </div>
      
      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <p className="font-medium font-sans txt-compact-small">Serie-Número</p>
        <p className="font-normal font-sans txt-compact-small">{entity.serie}-{entity.number}</p>
      </div>

      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <p className="font-medium font-sans txt-compact-small">Cliente</p>
        <p className="font-normal font-sans txt-compact-small">
          {entity.client?.name || entity.client?.email || "-"}
        </p>
      </div>

      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <p className="font-medium font-sans txt-compact-small">Total</p>
        <p className="font-normal font-sans txt-compact-small font-medium">
          €{parseFloat(entity.grandtotal || 0).toFixed(2)}
        </p>
      </div>

      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <p className="font-medium font-sans txt-compact-small">Fecha</p>
        <p className="font-normal font-sans txt-compact-small">
          {entity.data ? formatDate(entity.data) : "-"}
        </p>
      </div>
    </>
    );
  };

  const renderMainSections = ({ entity }) => {
    if (!entity) return null;
    
    return (
    <div className="space-y-6">
      {/* Información General */}
      <div className="bg-ui-bg-subtle rounded-lg p-6 space-y-4">
        <h3 className="font-sans font-medium txt-large mb-4">Detalles de la Factura</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-ui-fg-muted txt-compact-small mb-1">Serie</p>
            <p className="txt-compact-medium">{entity.serie || "-"}</p>
          </div>
          
          <div>
            <p className="text-ui-fg-muted txt-compact-small mb-1">Número</p>
            <p className="txt-compact-medium">{entity.number || "-"}</p>
          </div>
          
          <div>
            <p className="text-ui-fg-muted txt-compact-small mb-1">Fecha</p>
            <p className="txt-compact-medium">
              {entity.data ? formatDate(entity.data) : "-"}
            </p>
          </div>
          
          <div>
            <p className="text-ui-fg-muted txt-compact-small mb-1">Tienda</p>
            <p className="txt-compact-medium">{entity.store?.name || "-"}</p>
          </div>
          
          <div>
            <p className="text-ui-fg-muted txt-compact-small mb-1">Pedido</p>
            <p className="txt-compact-medium">
              {entity.order?.code_order || `#${entity.id_order}` || "-"}
            </p>
          </div>
          
          <div>
            <p className="text-ui-fg-muted txt-compact-small mb-1">Subtotal</p>
            <p className="txt-compact-medium">€{parseFloat(entity.subtotal || 0).toFixed(2)}</p>
          </div>
          
          <div>
            <p className="text-ui-fg-muted txt-compact-small mb-1">IVA</p>
            <p className="txt-compact-medium">€{parseFloat(entity.tax || 0).toFixed(2)}</p>
          </div>
          
          <div>
            <p className="text-ui-fg-muted txt-compact-small mb-1">Total</p>
            <p className="txt-compact-medium font-semibold">
              €{parseFloat(entity.grandtotal || 0).toFixed(2)}
            </p>
          </div>

          <div>
            <p className="text-ui-fg-muted txt-compact-small mb-1">Estado de Pago</p>
            <p className="txt-compact-medium">{entity.payed ? 'Pagada' : 'Pendiente'}</p>
          </div>

          {entity.process_date && (
            <div>
              <p className="text-ui-fg-muted txt-compact-small mb-1">Fecha de Proceso</p>
              <p className="txt-compact-medium">{formatDate(entity.process_date)}</p>
            </div>
          )}

          {entity.canceled_date && (
            <div>
              <p className="text-ui-fg-muted txt-compact-small mb-1">Fecha de Anulación</p>
              <p className="txt-compact-medium text-ui-fg-error">
                {formatDate(entity.canceled_date)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Acciones AEAT */}
      {!entity.canceled_date && (
        <div className="bg-ui-bg-subtle rounded-lg p-6 space-y-4">
          <h3 className="font-sans font-medium txt-large mb-4">Acciones AEAT</h3>
          
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={handleCheckAeatStatus}
              disabled={isAeatLoading}
            >
              {isAeatLoading ? 'Consultando...' : 'Consultar Estado AEAT'}
            </Button>
            
            <Button
              variant="primary"
              onClick={handleSendToAeat}
              disabled={sendToAeatMutation.isLoading}
            >
              {sendToAeatMutation.isLoading ? 'Transmitiendo...' : 'Transmitir a AEAT'}
            </Button>
            
            <Button
              variant="danger"
              onClick={handleCancelInvoice}
              disabled={cancelInvoiceMutation.isLoading}
            >
              {cancelInvoiceMutation.isLoading ? 'Anulando...' : 'Anular Factura'}
            </Button>
          </div>

          {aeatStatus && (
            <div className="mt-4 p-4 bg-ui-bg-base rounded border border-ui-border-base">
              <h4 className="font-sans font-medium txt-medium mb-2">Estado en AEAT</h4>
              <div className="space-y-2 txt-compact-small">
                <p><strong>Estado actual:</strong> {aeatStatus.current_status || 'Desconocido'}</p>
                <p><strong>Estado AEAT:</strong> {aeatStatus.aeat_status || 'No disponible'}</p>
                {aeatStatus.sent_at && (
                  <p><strong>Enviado:</strong> {formatDate(aeatStatus.sent_at)}</p>
                )}
                {aeatStatus.details && (
                  <pre className="mt-2 p-2 bg-ui-bg-subtle rounded text-xs overflow-auto">
                    {JSON.stringify(aeatStatus.details, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
    );
  };

  return (
    <DataLayout
      entityName="invoices"
      entityPluralName="Facturas"
      entity={invoice}
      renderHeader={renderHeader}
      renderMainSections={renderMainSections}
      renderSidebar={() => null}
      customHandlers={customHandlers}
    />
  );
}

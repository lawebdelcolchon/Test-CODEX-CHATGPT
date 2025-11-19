// src/features/orders/index.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge, Tabs } from "@medusajs/ui";
import DataLayout from "../../layouts/DataLayout.jsx";
import { hasPermission } from "../../utils/permissions.js";
import { useSelector } from "react-redux";
import {
  useOrderQuery,
  useDeleteOrderMutation,
  useOrderProductsQuery,
  useOrderAddressesQuery
} from "../../hooks/queries/useOrders.js";
import { formatDate } from "../../utils/formatters.js";

// Componente para la tabla de productos
function ProductsTable({ products, orderId }) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8 text-ui-fg-muted">
        No hay productos en este pedido
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-ui-border-base">
            <th className="text-left p-3 text-ui-fg-subtle txt-compact-small-plus">Producto</th>
            <th className="text-center p-3 text-ui-fg-subtle txt-compact-small-plus">Cantidad</th>
            <th className="text-right p-3 text-ui-fg-subtle txt-compact-small-plus">Precio</th>
            <th className="text-right p-3 text-ui-fg-subtle txt-compact-small-plus">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b border-ui-border-base hover:bg-ui-bg-subtle">
              <td className="p-3 txt-compact-small">
                {product.products_prime?.name || `Producto #${product.id_product_prime}`}
              </td>
              <td className="p-3 txt-compact-small text-center">{product.quantity || 0}</td>
              <td className="p-3 txt-compact-small text-right">
                €{parseFloat(product.price || 0).toFixed(2)}
              </td>
              <td className="p-3 txt-compact-small text-right font-medium">
                €{(parseFloat(product.price || 0) * parseInt(product.quantity || 0)).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Componente para la tabla de direcciones
function AddressesTable({ addresses }) {
  if (!addresses || addresses.length === 0) {
    return (
      <div className="text-center py-8 text-ui-fg-muted">
        No hay direcciones registradas
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {addresses.map((address) => (
        <div key={address.id} className="bg-ui-bg-base rounded-lg p-4 border border-ui-border-base">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-sans font-medium txt-compact-medium">
              {address.type_address === 'billing_address' ? 'Dirección de Facturación' : 'Dirección de Envío'}
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-ui-fg-muted txt-compact-small mb-1">Nombre</p>
              <p className="txt-compact-medium">{address.name || "-"}</p>
            </div>
            <div>
              <p className="text-ui-fg-muted txt-compact-small mb-1">Email</p>
              <p className="txt-compact-medium">{address.email || "-"}</p>
            </div>
            <div>
              <p className="text-ui-fg-muted txt-compact-small mb-1">Teléfono</p>
              <p className="txt-compact-medium">{address.phone || "-"}</p>
            </div>
            <div>
              <p className="text-ui-fg-muted txt-compact-small mb-1">Ciudad</p>
              <p className="txt-compact-medium">{address.city || "-"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-ui-fg-muted txt-compact-small mb-1">Dirección</p>
              <p className="txt-compact-medium">{address.address || "-"}</p>
            </div>
            <div>
              <p className="text-ui-fg-muted txt-compact-small mb-1">Código Postal</p>
              <p className="txt-compact-medium">{address.zipcode || "-"}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Obtener usuario y verificar permisos
  const { user } = useSelector((state) => state.auth);
  const canEdit = hasPermission(user, ['all', 'orders']);
  const canDelete = hasPermission(user, ['all', 'orders']);

  // Estado para la pestaña activa
  const [activeTab, setActiveTab] = useState("info");

  // Queries
  const {
    data: order,
    isLoading: isOrderLoading,
    error: orderError,
  } = useOrderQuery(id);

  const {
    data: productsResult,
    isLoading: isProductsLoading,
  } = useOrderProductsQuery(id);

  const {
    data: addressesResult,
    isLoading: isAddressesLoading,
  } = useOrderAddressesQuery(id);

  const products = productsResult?.items || productsResult || [];
  const addresses = addressesResult || [];

  // Mutations
  const deleteOrderMutation = useDeleteOrderMutation({
    onSuccess: (result, deletedId) => {
      if (String(deletedId) === String(id)) {
        navigate('/orders-client');
      }
    },
    onError: (error) => {
      alert('Error al eliminar el pedido: ' + error.message);
    }
  });

  // Manejador para eliminar orden
  const handleDelete = async (entity) => {
    console.log('🗑️ Eliminando pedido:', entity.id);
    return deleteOrderMutation.mutateAsync(entity.id);
  };

  // Custom handlers
  const customHandlers = {
    onEdit: () => {
      if (!canEdit) {
        console.warn('🚫 Usuario no tiene permisos para editar pedidos');
        alert('No tienes permisos para editar pedidos');
        return false;
      }
      navigate(`/orders-client/${id}/edit`);
      return false; // No abrir el drawer
    },
    onDelete: (entity) => {
      if (!canDelete) {
        console.warn('🚫 Usuario no tiene permisos para eliminar pedidos');
        alert('No tienes permisos para eliminar pedidos');
        return;
      }
      handleDelete(entity);
    }
  };

  // Render functions for DataLayout
  const renderHeader = ({ entity, ActionsMenu }) => {
    if (!entity) return null;
    
    // Mapeo de estados
    const statusMap = {
      1: 'Pendiente',
      2: 'Procesando',
      3: 'Completada',
      4: 'Cancelada',
      5: 'Nuevo'
    };
    
    return (
      <>
        <h1 className="font-sans font-medium h1-core">
          Pedido {entity.code_order || `#${entity.id}`}
        </h1>
      <div className="flex items-center gap-x-2">
        <Badge
          variant="default"
          size="small"
          className="txt-compact-xsmall-plus bg-ui-bg-subtle text-ui-fg-subtle border-ui-border-base box-border flex w-fit select-none items-center overflow-hidden rounded-md border pl-0 pr-1 leading-none"
        >
          <div className="flex items-center justify-center w-5 h-[18px] [&_div]:w-2 [&_div]:h-2 [&_div]:rounded-sm [&_div]:bg-ui-tag-blue-icon">
            <div></div>
          </div>
          {statusMap[entity.status_order] || `Estado ${entity.status_order}`}
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
        <p className="font-medium font-sans txt-compact-small">Código</p>
        <p className="font-normal font-sans txt-compact-small">{entity.code_order || "-"}</p>
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
        <p className="font-medium font-sans txt-compact-small">Fecha de Creación</p>
        <p className="font-normal font-sans txt-compact-small">
          {entity.created_at ? formatDate(entity.created_at) : "-"}
        </p>
      </div>
    </>
    );
  };

  const renderMainSections = ({ entity }) => {
    if (!entity) return null;
    
    return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Trigger value="info">Información General</Tabs.Trigger>
          <Tabs.Trigger value="products">
            Productos ({products.length})
          </Tabs.Trigger>
          <Tabs.Trigger value="addresses">
            Direcciones ({addresses.length})
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="info" className="mt-6">
          <div className="bg-ui-bg-subtle rounded-lg p-6 space-y-4">
            <h3 className="font-sans font-medium txt-large mb-4">Detalles del Pedido</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-ui-fg-muted txt-compact-small mb-1">Código de Orden</p>
                <p className="txt-compact-medium">{entity.code_order || "-"}</p>
              </div>
              
              <div>
                <p className="text-ui-fg-muted txt-compact-small mb-1">Fecha</p>
                <p className="txt-compact-medium">
                  {entity.date ? formatDate(entity.date) : "-"}
                </p>
              </div>
              
              <div>
                <p className="text-ui-fg-muted txt-compact-small mb-1">Fecha Prometida</p>
                <p className="txt-compact-medium">
                  {entity.promise_date ? formatDate(entity.promise_date) : "-"}
                </p>
              </div>
              
              <div>
                <p className="text-ui-fg-muted txt-compact-small mb-1">Tienda</p>
                <p className="txt-compact-medium">{entity.store?.name || "-"}</p>
              </div>
              
              <div>
                <p className="text-ui-fg-muted txt-compact-small mb-1">Subtotal</p>
                <p className="txt-compact-medium">€{parseFloat(entity.subtotal || 0).toFixed(2)}</p>
              </div>
              
              <div>
                <p className="text-ui-fg-muted txt-compact-small mb-1">Impuestos</p>
                <p className="txt-compact-medium">€{parseFloat(entity.tax || 0).toFixed(2)}</p>
              </div>
              
              <div>
                <p className="text-ui-fg-muted txt-compact-small mb-1">Total</p>
                <p className="txt-compact-medium font-semibold">
                  €{parseFloat(entity.grandtotal || 0).toFixed(2)}
                </p>
              </div>
              
              <div>
                <p className="text-ui-fg-muted txt-compact-small mb-1">Facturado</p>
                <p className="txt-compact-medium">{entity.invoiced ? 'Sí' : 'No'}</p>
              </div>
            </div>

            {entity.notes && (
              <div className="mt-4">
                <p className="text-ui-fg-muted txt-compact-small mb-1">Notas</p>
                <p className="txt-compact-medium whitespace-pre-wrap">{entity.notes}</p>
              </div>
            )}
          </div>
        </Tabs.Content>

        <Tabs.Content value="products" className="mt-6">
          <div className="bg-ui-bg-subtle rounded-lg p-6">
            <h3 className="font-sans font-medium txt-large mb-4">Productos del Pedido</h3>
            
            {isProductsLoading ? (
              <div className="text-center py-8 text-ui-fg-muted">Cargando productos...</div>
            ) : (
              <ProductsTable
                products={products}
                orderId={id}
              />
            )}
          </div>
        </Tabs.Content>

        <Tabs.Content value="addresses" className="mt-6">
          <div className="bg-ui-bg-subtle rounded-lg p-6">
            <h3 className="font-sans font-medium txt-large mb-4">Direcciones</h3>
            
            {isAddressesLoading ? (
              <div className="text-center py-8 text-ui-fg-muted">Cargando direcciones...</div>
            ) : (
              <AddressesTable addresses={addresses} />
            )}
          </div>
        </Tabs.Content>
      </Tabs>
    </div>
    );
  };

  return (
    <DataLayout
      entityName="orders"
      entityPluralName="Pedidos"
      entity={order}
      renderHeader={renderHeader}
      renderMainSections={renderMainSections}
      renderSidebar={() => null}
      customHandlers={customHandlers}
    />
  );
}

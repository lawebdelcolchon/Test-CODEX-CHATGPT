// src/features/orders/edit.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOrderQuery, useUpdateOrderMutation } from "../../hooks/queries/useOrders.js";
import { Button, Input, Label, Select, Textarea } from "@medusajs/ui";

export default function OrderEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: order, isLoading } = useOrderQuery(id);
  const updateMutation = useUpdateOrderMutation({
    onSuccess: () => {
      alert('Pedido actualizado correctamente');
      navigate(`/orders-client/${id}`);
    },
    onError: (error) => {
      alert('Error al actualizar: ' + error.message);
    }
  });

  const [formData, setFormData] = useState({
    status_order: 5,
    notes: '',
    invoiced: false
  });

  useEffect(() => {
    if (order) {
      setFormData({
        status_order: order.status_order || 5,
        notes: order.notes || '',
        invoiced: order.invoiced || false
      });
    }
  }, [order]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await updateMutation.mutateAsync({
        id,
        data: formData
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-ui-fg-muted">Cargando pedido...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-ui-fg-error">Pedido no encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-2">
      <div className="px-8 pt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-sans font-medium h1-core">Editar Pedido</h1>
            <p className="text-ui-fg-subtle txt-compact-medium">
              {order.code_order || `#${order.id}`}
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => navigate(`/orders-client/${id}`)}
          >
            Cancelar
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          <div className="bg-ui-bg-base rounded-lg border border-ui-border-base p-6 space-y-4">
            <h2 className="font-sans font-medium txt-large mb-4">
              Información del Pedido
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status_order" className="txt-compact-small-plus mb-2 block">
                  Estado del Pedido
                </Label>
                <Select
                  id="status_order"
                  value={String(formData.status_order)}
                  onValueChange={(value) => 
                    setFormData({ ...formData, status_order: parseInt(value) })
                  }
                >
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="1">Pendiente</Select.Item>
                    <Select.Item value="2">Procesando</Select.Item>
                    <Select.Item value="3">Completada</Select.Item>
                    <Select.Item value="4">Cancelada</Select.Item>
                    <Select.Item value="5">Nuevo</Select.Item>
                  </Select.Content>
                </Select>
              </div>

              <div>
                <Label htmlFor="invoiced" className="txt-compact-small-plus mb-2 block">
                  Facturado
                </Label>
                <Select
                  id="invoiced"
                  value={formData.invoiced ? "true" : "false"}
                  onValueChange={(value) => 
                    setFormData({ ...formData, invoiced: value === "true" })
                  }
                >
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="false">No</Select.Item>
                    <Select.Item value="true">Sí</Select.Item>
                  </Select.Content>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="txt-compact-small-plus mb-2 block">
                Notas
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas adicionales sobre el pedido..."
                rows={4}
              />
            </div>
          </div>

          <div className="bg-ui-bg-base rounded-lg border border-ui-border-base p-6">
            <h3 className="font-sans font-medium txt-medium mb-3">
              Información de Solo Lectura
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-ui-fg-muted txt-compact-small mb-1">Cliente</p>
                <p className="txt-compact-medium">
                  {order.client?.name || order.client?.email || "-"}
                </p>
              </div>
              <div>
                <p className="text-ui-fg-muted txt-compact-small mb-1">Total</p>
                <p className="txt-compact-medium font-semibold">
                  €{parseFloat(order.grandtotal || 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-ui-fg-muted txt-compact-small mb-1">Fecha</p>
                <p className="txt-compact-medium">
                  {order.date ? new Date(order.date).toLocaleDateString("es-ES") : "-"}
                </p>
              </div>
              <div>
                <p className="text-ui-fg-muted txt-compact-small mb-1">Tienda</p>
                <p className="txt-compact-medium">{order.store?.name || "-"}</p>
              </div>
            </div>
            <p className="text-ui-fg-muted txt-compact-small mt-4">
              Nota: Los productos y direcciones no se pueden modificar desde el panel de administración.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(`/orders-client/${id}`)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isLoading}
            >
              {updateMutation.isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

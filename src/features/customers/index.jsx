// src/features/customers/index.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Input, Badge, Button } from "@medusajs/ui";
import DataLayout from "../../layouts/DataLayout.jsx";
import { hasPermission } from "../../utils/permissions.js";
import { useSelector } from "react-redux";
import { 
  useCustomersQuery,
  useCustomerQuery,
  useUpdateCustomerMutation, 
  useDeleteCustomerMutation,
  useCustomerOrdersQuery,
  useCustomerAddressesQuery
} from "../../hooks/queries/useCustomers.js";

export default function CustomerDetail() {
  const { id } = useParams();

  // Obtener usuario y verificar permisos
  const { user } = useSelector((state) => state.auth);
  const canEdit = hasPermission(user, ['all', 'customers']);
  const canDelete = hasPermission(user, ['all', 'customers']);

  // Usar TanStack Query para obtener datos
  const { 
    data: customersResult, 
    isLoading: isCustomersLoading 
  } = useCustomersQuery({ page: 1, pageSize: 100 });
  
  const { 
    data: customer, 
    isLoading: isCustomerLoading,
    error: customerError 
  } = useCustomerQuery(id);

  // Obtener datos relacionados del cliente
  const { 
    data: customerOrders, 
    isLoading: isOrdersLoading 
  } = useCustomerOrdersQuery(id, {}, { enabled: !!customer });
  
  const { 
    data: customerAddresses, 
    isLoading: isAddressesLoading 
  } = useCustomerAddressesQuery(id, {}, { enabled: !!customer });

  // Extraer datos para el contexto
  const customersData = customersResult?.items || [];
  const isLoading = isCustomersLoading || isCustomerLoading;

  // Hooks de mutación
  const updateCustomerMutation = useUpdateCustomerMutation({
    onSuccess: (updatedCustomer) => {
      console.log('✅ CustomerDetail: Cliente actualizado exitosamente:', updatedCustomer);
    },
    onError: (error) => {
      console.error('❌ CustomerDetail: Error detallado al actualizar cliente:', error);
      console.error('❌ Error stack:', error.stack);
      console.error('❌ Error response:', error.response?.data);
      alert('Error al actualizar el cliente: ' + error.message);
    }
  });

  const deleteCustomerMutation = useDeleteCustomerMutation({
    onSuccess: (result, deletedId) => {
      // Si el cliente eliminado era el que se estaba viendo, redirigir
      if (String(deletedId) === String(id)) {
        // Redirigir a la lista principal
        window.location.href = '/customers';
      }
    },
    onError: (error) => {
      alert('Error al eliminar el cliente: ' + error.message);
    }
  });
  
  // Estado para el formulario de edición
  const [formData, setFormData] = useState({
    first_name: customer?.first_name || "",
    last_name: customer?.last_name || "",
    email: customer?.email || "",
    company_name: customer?.company_name || "",
    phone: customer?.phone || ""
  });
  
  // Update formData when customer changes
  useEffect(() => {
    if (customer) {
      setFormData({
        first_name: customer?.first_name || "",
        last_name: customer?.last_name || "",
        email: customer?.email || "",
        company_name: customer?.company_name || "",
        phone: customer?.phone || ""
      });
    }
  }, [customer]);
  
  // Input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Custom handlers
  const customHandlers = {
    onEdit: () => {
      // Refresh formData when edit starts
      setFormData({
        first_name: customer?.first_name || "",
        last_name: customer?.last_name || "",
        email: customer?.email || "",
        company_name: customer?.company_name || "",
        phone: customer?.phone || ""
      });
    },
    onDelete: (entity) => {
      // Handle delete logic here if needed
      console.log("Custom delete logic for customer:", entity);
    }
  };
  
  // Render functions for DataLayout
  const renderHeader = ({ entity, ActionsMenu }) => (
    <>
      <h1 className="font-sans font-medium h1-core">{entity.email}</h1>
      <div className="flex items-center gap-x-2">
        <Badge 
          variant={entity.has_account ? "default" : "secondary"} 
          size="small"
          className="txt-compact-xsmall-plus bg-ui-bg-subtle text-ui-fg-subtle border-ui-border-base box-border flex w-fit select-none items-center overflow-hidden rounded-md border pl-0 pr-1 leading-none"
        >
          <div className="flex items-center justify-center w-5 h-[18px] [&_div]:w-2 [&_div]:h-2 [&_div]:rounded-sm [&_div]:bg-ui-tag-orange-icon">
            <div></div>
          </div>
          {entity.has_account ? "Registrado" : "Invitado"}
        </Badge>
        <ActionsMenu />
      </div>
    </>
  );
  
  renderHeader.additionalRows = ({ entity }) => (
    <>
      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <p className="font-medium font-sans txt-compact-small">Nombre</p>
        <p className="font-normal font-sans txt-compact-small">
          {entity.first_name} {entity.last_name}
        </p>
      </div>
      
      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <p className="font-medium font-sans txt-compact-small">Compañía</p>
        <p className="font-normal font-sans txt-compact-small">
          {entity.company_name || "-"}
        </p>
      </div>
      
      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <p className="font-medium font-sans txt-compact-small">Teléfono</p>
        <p className="font-normal font-sans txt-compact-small">
          {entity.phone || "-"}
        </p>
      </div>
    </>
  );
  
  const renderMainSections = ({ EmptyState, entity, Link, Button }) => (
    <>
      {/* Orders Section */}
      <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="font-sans font-medium h2-core">Pedidos</h2>
        </div>
        <EmptyState 
          title="No hay registros"
          description="No hay registros para mostrar"
        />
      </div>

      {/* Customer Groups Section */}
      <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="font-sans font-medium h2-core">Grupos de Clientes</h2>
          <Link to={`/customers/${entity.id}/add-customer-groups`}>
            <Button variant="secondary" size="small" className="txt-compact-small-plus gap-x-1.5 px-2 py-1">
              Agregar
            </Button>
          </Link>
        </div>
        <EmptyState 
          title="No hay registros"
          description="Este cliente no pertenece a ningún grupo."
        />
      </div>
    </>
  );
  
  const renderSidebar = ({ entity, Link, Button, Badge, PencilSquare, mobile = false }) => (
    <>
      {/* Metadata Section */}
      <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-x-3">
          <h2 className="font-sans font-medium h2-core">Metadatos</h2>
          <Badge 
            variant="secondary" 
            size="small"
            className="bg-ui-tag-neutral-bg text-ui-tag-neutral-text [&_svg]:text-ui-tag-neutral-icon border-ui-tag-neutral-border inline-flex items-center gap-x-0.5 border box-border txt-compact-xsmall-plus h-5 rounded-full px-1.5"
          >
            0 claves
          </Badge>
        </div>
        <Link to={`/customers/${entity.id}/metadata/edit`}>
          <Button variant="transparent" size="small" className="h-7 w-7 p-1 text-ui-fg-muted hover:text-ui-fg-subtle">
            <PencilSquare />
          </Button>
        </Link>
      </div>

      {/* JSON Section */}
      <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-x-4">
          <h2 className="font-sans font-medium h2-core">JSON</h2>
          <Badge 
            variant="secondary" 
            size="small"
            className="bg-ui-tag-neutral-bg text-ui-tag-neutral-text [&_svg]:text-ui-tag-neutral-icon border-ui-tag-neutral-border inline-flex items-center gap-x-0.5 border box-border txt-compact-xsmall-plus h-5 rounded-full px-1.5"
          >
            {Object.keys(entity).length} claves
          </Badge>
        </div>
        <Button 
          variant="transparent" 
          size="small" 
          className="h-7 w-7 p-1 text-ui-fg-muted hover:text-ui-fg-subtle"
        >
          <PencilSquare />
        </Button>
      </div>
      
      {/* Addresses Section - Mobile version or as additional section */}
      {!mobile && (
        <div className="flex w-full max-w-[100%] flex-col gap-y-3 xl:mt-0 xl:max-w-[440px]">
          <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg p-0">
            <div className="flex items-center justify-between px-6 py-4">
              <h2 className="font-sans font-medium h2-core">Direcciones</h2>
              <Link 
                to={`/customers/${entity.id}/create-address`}
                className="text-ui-fg-muted text-xs"
              >
                Agregar
              </Link>
            </div>
            <div className="w-full items-center justify-center gap-y-4 flex h-full flex-col overflow-hidden border-t p-6">
              <div className="flex h-[150px] w-full flex-col items-center justify-center gap-y-4">
                <div className="flex flex-col items-center gap-y-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" className="text-ui-fg-subtle">
                    <g stroke="currentColor" clipPath="url(#a)">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7.5 13.944a6.444 6.444 0 1 0 0-12.888 6.444 6.444 0 0 0 0 12.888M7.5 4.328v3.678" />
                      <path strokeWidth="0.9" d="M7.5 10.099a.44.44 0 0 1 .44.438.44.44 0 0 1-.44.44.44.44 0 0 1 0-.878Z" />
                    </g>
                    <defs>
                      <clipPath id="a">
                        <path fill="#fff" d="M0 0h15v15H0z" />
                      </clipPath>
                    </defs>
                  </svg>
                  <div className="flex flex-col items-center gap-y-1">
                    <p className="font-medium font-sans txt-compact-small">No hay registros</p>
                    <p className="font-normal font-sans txt-small text-ui-fg-muted">No hay registros para mostrar</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
  
  const renderEditForm = ({ formData, onInputChange }) => (
    <div className="flex flex-col gap-y-4">
      {/* Email */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-x-1">
          <label 
            className="font-sans txt-compact-small font-medium" 
            htmlFor="edit_email"
          >
            Correo electrónico
          </label>
        </div>
        <div className="relative">
          <Input
            id="edit_email"
            name="email"
            type="email"
            value={formData.email}
            onChange={onInputChange}
            className="caret-ui-fg-base bg-ui-bg-field hover:bg-ui-bg-field-hover shadow-borders-base placeholder-ui-fg-muted text-ui-fg-base transition-fg relative w-full appearance-none rounded-md outline-none focus-visible:shadow-borders-interactive-with-active txt-compact-small h-8 px-2 py-1.5"
            required
          />
        </div>
      </div>

      {/* First Name */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-x-1">
          <label 
            className="font-sans txt-compact-small font-medium" 
            htmlFor="edit_first_name"
          >
            Nombre
          </label>
        </div>
        <div className="relative">
          <Input
            id="edit_first_name"
            name="first_name"
            type="text"
            value={formData.first_name}
            onChange={onInputChange}
            className="caret-ui-fg-base bg-ui-bg-field hover:bg-ui-bg-field-hover shadow-borders-base placeholder-ui-fg-muted text-ui-fg-base transition-fg relative w-full appearance-none rounded-md outline-none focus-visible:shadow-borders-interactive-with-active txt-compact-small h-8 px-2 py-1.5"
          />
        </div>
      </div>

      {/* Last Name */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-x-1">
          <label 
            className="font-sans txt-compact-small font-medium" 
            htmlFor="edit_last_name"
          >
            Apellido
          </label>
        </div>
        <div className="relative">
          <Input
            id="edit_last_name"
            name="last_name"
            type="text"
            value={formData.last_name}
            onChange={onInputChange}
            className="caret-ui-fg-base bg-ui-bg-field hover:bg-ui-bg-field-hover shadow-borders-base placeholder-ui-fg-muted text-ui-fg-base transition-fg relative w-full appearance-none rounded-md outline-none focus-visible:shadow-borders-interactive-with-active txt-compact-small h-8 px-2 py-1.5"
          />
        </div>
      </div>

      {/* Company */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-x-1">
          <label 
            className="font-sans txt-compact-small font-medium" 
            htmlFor="edit_company_name"
          >
            Compañía
          </label>
        </div>
        <div className="relative">
          <Input
            id="edit_company_name"
            name="company_name"
            type="text"
            value={formData.company_name}
            onChange={onInputChange}
            className="caret-ui-fg-base bg-ui-bg-field hover:bg-ui-bg-field-hover shadow-borders-base placeholder-ui-fg-muted text-ui-fg-base transition-fg relative w-full appearance-none rounded-md outline-none focus-visible:shadow-borders-interactive-with-active txt-compact-small h-8 px-2 py-1.5"
          />
        </div>
      </div>

      {/* Phone */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-x-1">
          <label 
            className="font-sans txt-compact-small font-medium" 
            htmlFor="edit_phone"
          >
            Teléfono
          </label>
        </div>
        <div className="relative">
          <Input
            id="edit_phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={onInputChange}
            className="caret-ui-fg-base bg-ui-bg-field hover:bg-ui-bg-field-hover shadow-borders-base placeholder-ui-fg-muted text-ui-fg-base transition-fg relative w-full appearance-none rounded-md outline-none focus-visible:shadow-borders-interactive-with-active txt-compact-small h-8 px-2 py-1.5"
          />
        </div>
      </div>
    </div>
  );

  const handleFormSubmit = (formData) => {
    console.log('📋 CustomerDetail.handleFormSubmit INICIO', { formData, customer });
    
    if (!customer?.id) {
      console.error('❌ CustomerDetail: No customer ID found');
      return Promise.reject(new Error('No se puede actualizar: ID del cliente no encontrado'));
    }

    return updateCustomerMutation.mutateAsync({ id: customer.id, data: formData });
  };

  const handleDelete = (entity) => {
    console.log('🗑️ CustomerDetail.handleDelete INICIO', { entity });
    
    if (!entity?.id) {
      console.error('❌ CustomerDetail: No entity ID found for deletion');
      return Promise.reject(new Error('No se puede eliminar: ID del cliente no encontrado'));
    }

    return deleteCustomerMutation.mutateAsync(entity.id);
  };

  // Mostrar loading si los datos están cargando
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-ui-fg-muted">Cargando...</div>
      </div>
    );
  }

  // Mostrar error si no se pudo cargar el cliente
  if (customerError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-ui-fg-error">Error al cargar el cliente: {customerError.message}</div>
      </div>
    );
  }

  // Mostrar mensaje si no se encontró el cliente
  if (!customer) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-ui-fg-muted">Cliente no encontrado</div>
      </div>
    );
  }

  return (
    <DataLayout
      entityName="customers"
      entityPluralName="Clientes"
      data={customersData}
      entity={customer}
      formData={formData}
      setFormData={setFormData}
      onInputChange={handleInputChange}
      onEditSubmit={handleFormSubmit}
      onDelete={handleDelete}
      renderHeader={renderHeader}
      renderMainSections={renderMainSections}
      renderSidebar={renderSidebar}
      renderEditForm={renderEditForm}
      deleteVerificationField="email"
      editTitle="Editar Cliente"
      deleteItemText="cliente"
      customHandlers={customHandlers}
      // Estados de loading y error
      isLoading={updateCustomerMutation.isPending || deleteCustomerMutation.isPending}
      permissions={{
        canEdit,
        canDelete
      }}
    />
  );
}

// src/features/suppliers/create.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Badge, Button, Select, Textarea, Switch } from "@medusajs/ui";
import { ArrowLeft, XMarkMini } from "@medusajs/icons";
import { hasPermission } from "../../utils/permissions.js";
import { useSelector } from "react-redux";
import {
  useCreateSupplierMutation
} from "../../hooks/queries/useSuppliers.js";

export default function CreateSupplier() {
  const navigate = useNavigate();
  
  // Obtener usuario y verificar permisos
  const { user } = useSelector((state) => state.auth);
  const canCreate = hasPermission(user, ['all', 'suppliers']);

  // Hook de mutación para crear supplier
  const createSupplierMutation = useCreateSupplierMutation({
    onSuccess: (createdSupplier) => {
      console.log('✅ CreateSupplier: Supplier creado exitosamente:', createdSupplier);
      // Navegar a la lista de suppliers después de crear
      navigate('/suppliers');
    },
    onError: (error) => {
      console.error('❌ CreateSupplier: Error al crear supplier:', error);
      alert('Error al crear el proveedor: ' + error.message);
    }
  });

  // Estado para el formulario de creación
  const [formData, setFormData] = useState({
    name: "",
    tax_code: "",
    email: "",
    phone: "",
    fax: "",
    address: "",
    zipcode: "",
    city: "",
    code_shipping: "",
    code_control: "",
    is_company: false,
    active: true
  });

  // Input change handler
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSwitchChange = (name, checked) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Manejador para crear supplier
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    console.log('📋 CreateSupplier.handleFormSubmit INICIO - formData:', formData);
    
    // Validaciones básicas según el modelo
    if (!formData.name.trim()) {
      alert('El nombre es requerido');
      return;
    }
    
    if (!formData.tax_code.trim()) {
      alert('El código fiscal es requerido');
      return;
    }

    if (!formData.email.trim()) {
      alert('El email es requerido');
      return;
    }

    if (!formData.phone.trim()) {
      alert('El teléfono es requerido');
      return;
    }

    if (!formData.address.trim()) {
      alert('La dirección es requerida');
      return;
    }

    if (!formData.zipcode.trim()) {
      alert('El código postal es requerido');
      return;
    }

    if (!formData.city.trim()) {
      alert('La ciudad es requerida');
      return;
    }

    try {
      // Limpiar datos y preparar para envío
      const cleanString = (str) => {
        if (typeof str !== 'string') return str;
        return str.replace(/\\\"/g, '"').replace(/"/g, '').trim();
      };

      const supplierData = {
        name: cleanString(formData.name),
        tax_code: cleanString(formData.tax_code),
        email: cleanString(formData.email),
        phone: cleanString(formData.phone),
        fax: cleanString(formData.fax) || '',
        address: cleanString(formData.address),
        zipcode: cleanString(formData.zipcode),
        city: cleanString(formData.city),
        code_shipping: cleanString(formData.code_shipping) || '',
        code_control: cleanString(formData.code_control) || '',
        is_company: Boolean(formData.is_company),
        active: Boolean(formData.active)
      };

      console.log('📝 Submitting supplier data:', supplierData);
      const result = await createSupplierMutation.mutateAsync(supplierData);
      console.log('✅ CreateSupplier.handleFormSubmit ÉXITO - result:', result);
    } catch (error) {
      console.error('❌ CreateSupplier.handleFormSubmit ERROR:', error);
    }
  };

  const handleBack = () => {
    navigate('/suppliers');
  };

  // Si no tiene permisos
  if (!canCreate) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="mb-4">
          <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m13-9a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Acceso Denegado</h2>
        <p className="text-gray-500 mb-4">No tienes permisos para crear proveedores.</p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-y-3">
      {/* Back Button */}
      <div className="flex items-center gap-x-2">
        <Button
          variant="transparent"
          size="small"
          onClick={handleBack}
          className="h-8 w-8 p-1"
        >
          <ArrowLeft />
        </Button>
        <span className="text-ui-fg-muted txt-small">Volver a Proveedores</span>
      </div>
      
      <div className="flex w-full flex-col items-start gap-x-4 gap-y-3 xl:grid xl:grid-cols-[minmax(0,_1fr)_440px]">
        {/* Main Content */}
        <div className="flex w-full min-w-0 flex-col gap-y-3">
          {/* Header */}
          <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
              <h1 className="font-sans font-medium h1-core">Crear Nuevo Proveedor</h1>
              <div className="flex items-center gap-x-2">
                <Badge
                  variant="secondary"
                  size="small"
                  className="txt-compact-xsmall-plus bg-ui-bg-subtle text-ui-fg-subtle border-ui-border-base"
                >
                  Nuevo
                </Badge>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
              <h2 className="font-sans font-medium h2-core">Información del Proveedor</h2>
            </div>
            <form onSubmit={handleFormSubmit} className="px-6 py-4">
              <div className="flex flex-col gap-y-4">
                {/* Basic Info */}
                <div className="flex flex-col space-y-2">
                  <label className="font-sans txt-compact-small font-medium">Nombre *</label>
                  <Input
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Nombre del proveedor..."
                    required
                  />
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="font-sans txt-compact-small font-medium">Código Fiscal *</label>
                  <Input
                    name="tax_code"
                    type="text"
                    value={formData.tax_code}
                    onChange={handleInputChange}
                    placeholder="ej. B12345678..."
                    required
                  />
                  <span className="text-xs text-ui-fg-muted">Código fiscal único del proveedor</span>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-2">
                    <label className="font-sans txt-compact-small font-medium">Email *</label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="correo@proveedor.com"
                      required
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <label className="font-sans txt-compact-small font-medium">Teléfono *</label>
                    <Input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+34 900 123 456"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="font-sans txt-compact-small font-medium">Fax</label>
                  <Input
                    name="fax"
                    type="tel"
                    value={formData.fax}
                    onChange={handleInputChange}
                    placeholder="+34 900 123 457"
                  />
                </div>

                {/* Address Information */}
                <div className="flex flex-col space-y-2">
                  <label className="font-sans txt-compact-small font-medium">Dirección *</label>
                  <Input
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Dirección completa..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-2">
                    <label className="font-sans txt-compact-small font-medium">Código Postal *</label>
                    <Input
                      name="zipcode"
                      type="text"
                      value={formData.zipcode}
                      onChange={handleInputChange}
                      placeholder="28001"
                      required
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <label className="font-sans txt-compact-small font-medium">Ciudad *</label>
                    <Input
                      name="city"
                      type="text"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Madrid"
                      required
                    />
                  </div>
                </div>

                {/* Shipping Codes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-2">
                    <label className="font-sans txt-compact-small font-medium">Código de Envío</label>
                    <Input
                      name="code_shipping"
                      type="text"
                      value={formData.code_shipping}
                      onChange={handleInputChange}
                      placeholder="SHIP001"
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <label className="font-sans txt-compact-small font-medium">Código de Control</label>
                    <Input
                      name="code_control"
                      type="text"
                      value={formData.code_control}
                      onChange={handleInputChange}
                      placeholder="CTRL001"
                    />
                  </div>
                </div>

                {/* Switches */}
                <div className="flex flex-col gap-y-3 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-sans txt-compact-small font-medium">Es Empresa</label>
                      <p className="text-xs text-ui-fg-muted">Marcar si es una empresa en lugar de persona física</p>
                    </div>
                    <Switch
                      checked={formData.is_company}
                      onCheckedChange={(checked) => handleSwitchChange('is_company', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-sans txt-compact-small font-medium">Activo</label>
                      <p className="text-xs text-ui-fg-muted">El proveedor estará habilitado para uso</p>
                    </div>
                    <Switch
                      checked={formData.active}
                      onCheckedChange={(checked) => handleSwitchChange('active', checked)}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-end gap-x-2 pt-6 border-t">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    size="small"
                    onClick={handleBack}
                    className="txt-compact-small-plus gap-x-1.5 px-2 py-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    variant="primary" 
                    size="small"
                    disabled={createSupplierMutation.isLoading}
                    className="shadow-buttons-inverted text-ui-contrast-fg-primary bg-ui-button-inverted txt-compact-small-plus gap-x-1.5 px-2 py-1"
                  >
                    {createSupplierMutation.isLoading ? 'Creando...' : 'Crear Proveedor'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar - Preview */}
        <div className="hidden flex-col gap-y-3 xl:flex">
          {/* Preview Card */}
          <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg p-0">
            <div className="flex items-center justify-between px-6 py-4">
              <h2 className="font-sans font-medium h2-core">Vista Previa</h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Nombre</p>
                <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle">
                  {formData.name || "Sin nombre"}
                </p>
              </div>
              <div>
                <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Código Fiscal</p>
                <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle font-mono">
                  {formData.tax_code || "Sin código"}
                </p>
              </div>
              {formData.email && (
                <div>
                  <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Email</p>
                  <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle break-all">
                    {formData.email}
                  </p>
                </div>
              )}
              {formData.city && (
                <div>
                  <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Ciudad</p>
                  <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle">
                    {formData.city}
                  </p>
                </div>
              )}
              <div>
                <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Estados</p>
                <div className="flex flex-wrap gap-1">
                  {formData.active && (
                    <Badge variant="default" size="small">Activo</Badge>
                  )}
                  {formData.is_company ? (
                    <Badge variant="default" size="small">Empresa</Badge>
                  ) : (
                    <Badge variant="secondary" size="small">Persona</Badge>
                  )}
                  {!formData.active && (
                    <Badge variant="secondary" size="small">Inactivo</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
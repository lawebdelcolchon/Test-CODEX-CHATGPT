// src/features/marketplace/create.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Badge, Button, Select, Textarea, Switch } from "@medusajs/ui";
import { ArrowLeft, XMarkMini } from "@medusajs/icons";
import { hasPermission } from "../../utils/permissions.js";
import { useSelector } from "react-redux";
import {
  useCreateMarketplaceMutation
} from "../../hooks/queries/useMarketplace.js";

export default function CreateMarketplace() {
  const navigate = useNavigate();
  
  // Obtener usuario y verificar permisos
  const { user } = useSelector((state) => state.auth);
  const canCreate = hasPermission(user, ['all', 'marketplace']);

  // Hook de mutación para crear marketplace
  const createMarketplaceMutation = useCreateMarketplaceMutation({
    onSuccess: (createdMarketplace) => {
      console.log('✅ CreateMarketplace: Marketplace creado exitosamente:', createdMarketplace);
      // Navegar a la lista de marketplaces después de crear
      navigate('/marketplace');
    },
    onError: (error) => {
      console.error('❌ CreateMarketplace: Error al crear marketplace:', error);
      alert('Error al crear el marketplace: ' + error.message);
    }
  });

  // Estado para el formulario de creación
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    url: "",
    visible: true,
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

  // Manejador para crear marketplace
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    console.log('📋 CreateMarketplace.handleFormSubmit INICIO - formData:', formData);
    
    // Validaciones básicas
    if (!formData.name.trim()) {
      alert('El nombre es requerido');
      return;
    }
    
    if (!formData.code.trim()) {
      alert('El código del marketplace es requerido');
      return;
    }

    try {
      // Limpiar datos y preparar para envío
      const cleanString = (str) => {
        if (typeof str !== 'string') return str;
        return str.replace(/\\\"/g, '"').replace(/"/g, '').trim();
      };

      const marketplaceData = {
        name: cleanString(formData.name),
        code: cleanString(formData.code),
        description: cleanString(formData.description) || null,
        url: cleanString(formData.url) || null,
        visible: Boolean(formData.visible),
        active: Boolean(formData.active)
      };

      console.log('📝 Submitting marketplace data:', marketplaceData);
      const result = await createMarketplaceMutation.mutateAsync(marketplaceData);
      console.log('✅ CreateMarketplace.handleFormSubmit ÉXITO - result:', result);
    } catch (error) {
      console.error('❌ CreateMarketplace.handleFormSubmit ERROR:', error);
    }
  };

  const handleBack = () => {
    navigate('/marketplace');
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
        <p className="text-gray-500 mb-4">No tienes permisos para crear marketplaces.</p>
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
        <span className="text-ui-fg-muted txt-small">Volver a Marketplaces</span>
      </div>
      
      <div className="flex w-full flex-col items-start gap-x-4 gap-y-3 xl:grid xl:grid-cols-[minmax(0,_1fr)_440px]">
        {/* Main Content */}
        <div className="flex w-full min-w-0 flex-col gap-y-3">
          {/* Header */}
          <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
              <h1 className="font-sans font-medium h1-core">Crear Nuevo Marketplace</h1>
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
              <h2 className="font-sans font-medium h2-core">Información del Marketplace</h2>
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
                    placeholder="ej. Amazon, eBay, MercadoLibre..."
                    required
                  />
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="font-sans txt-compact-small font-medium">Código *</label>
                  <Input
                    name="code"
                    type="text"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="ej. AMZ, EBAY, ML..."
                    required
                  />
                  <span className="text-xs text-ui-fg-muted">Código único que identifica al marketplace</span>
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="font-sans txt-compact-small font-medium">Descripción</label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Descripción opcional del marketplace..."
                  />
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="font-sans txt-compact-small font-medium">URL del Marketplace</label>
                  <Input
                    name="url"
                    type="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    placeholder="https://www.ejemplo.com"
                  />
                  <span className="text-xs text-ui-fg-muted">URL principal del marketplace (opcional)</span>
                </div>

                {/* Switches */}
                <div className="flex flex-col gap-y-3 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-sans txt-compact-small font-medium">Activo</label>
                      <p className="text-xs text-ui-fg-muted">El marketplace estará habilitado para uso</p>
                    </div>
                    <Switch
                      checked={formData.active}
                      onCheckedChange={(checked) => handleSwitchChange('active', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-sans txt-compact-small font-medium">Visible</label>
                      <p className="text-xs text-ui-fg-muted">El marketplace aparecerá en las listas públicas</p>
                    </div>
                    <Switch
                      checked={formData.visible}
                      onCheckedChange={(checked) => handleSwitchChange('visible', checked)}
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
                    disabled={createMarketplaceMutation.isLoading}
                    className="shadow-buttons-inverted text-ui-contrast-fg-primary bg-ui-button-inverted txt-compact-small-plus gap-x-1.5 px-2 py-1"
                  >
                    {createMarketplaceMutation.isLoading ? 'Creando...' : 'Crear Marketplace'}
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
                <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Código</p>
                <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle font-mono">
                  {formData.code || "Sin código"}
                </p>
              </div>
              {formData.url && (
                <div>
                  <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">URL</p>
                  <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle break-all">
                    {formData.url}
                  </p>
                </div>
              )}
              <div>
                <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Estados</p>
                <div className="flex flex-wrap gap-1">
                  {formData.active && (
                    <Badge variant="default" size="small">Activo</Badge>
                  )}
                  {formData.visible && (
                    <Badge variant="default" size="small">Visible</Badge>
                  )}
                  {!formData.active && (
                    <Badge variant="secondary" size="small">Inactivo</Badge>
                  )}
                  {!formData.visible && (
                    <Badge variant="secondary" size="small">Oculto</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Help Card */}
          <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg p-0">
            <div className="flex items-center justify-between px-6 py-4">
              <h2 className="font-sans font-medium h2-core">Ayuda</h2>
            </div>
            <div className="px-6 py-4 space-y-3">
              <div className="text-xs text-ui-fg-muted">
                <p><strong>Código:</strong> Debe ser único y preferiblemente corto (ej. AMZ para Amazon)</p>
              </div>
              <div className="text-xs text-ui-fg-muted">
                <p><strong>URL:</strong> La dirección web principal del marketplace</p>
              </div>
              <div className="text-xs text-ui-fg-muted">
                <p><strong>Activo:</strong> Si está desactivado, no se podrá usar en operaciones</p>
              </div>
              <div className="text-xs text-ui-fg-muted">
                <p><strong>Visible:</strong> Si está oculto, no aparecerá en listados públicos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
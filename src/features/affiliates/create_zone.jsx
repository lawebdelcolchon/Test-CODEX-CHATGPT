// src/features/affiliates/create_zone.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Input, Label } from "@medusajs/ui";
import { ArrowLeft } from "@medusajs/icons";
import { useSelector } from "react-redux";
import { hasPermission } from "../../utils/permissions.js";
import { useAffiliateQuery, useCreateZoneMutation } from "../../hooks/queries/useAffiliates.js";

export default function AffiliateCreateZone() {
  const navigate = useNavigate();
  const { id } = useParams(); // ID del afiliado

  // Obtener usuario y verificar permisos
  const { user } = useSelector((state) => state.auth);
  const canCreate = hasPermission(user, ['all', 'affiliates']);

  // Estados del formulario
  const [formData, setFormData] = useState({
    name: "",
    postal_code: "",
    city: "",
    province: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Query para obtener los datos del afiliado
  const {
    data: affiliate,
    isLoading: isLoadingAffiliate,
  } = useAffiliateQuery(id);

  // Hook de mutación
  const createZoneMutation = useCreateZoneMutation({
    onSuccess: (createdZone) => {
      console.log('✅ CreateZone: Zona creada exitosamente:', createdZone);
      navigate(`/affiliates/${id}`);
    },
    onError: (error) => {
      console.error('❌ CreateZone: Error al crear zona:', error);
      setErrors({ submit: error.message });
      setIsLoading(false);
    }
  });

  // Verificar permisos al montar el componente
  useEffect(() => {
    if (!canCreate) {
      console.warn('🚫 Usuario no tiene permisos para crear zonas');
      navigate(`/affiliates/${id}`, { replace: true });
    }
  }, [canCreate, navigate, id]);

  // Manejar cambios en el formulario
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Validación del formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    if (!formData.city?.trim()) {
      newErrors.city = "La ciudad es requerida";
    }

    return newErrors;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Preparar datos para enviar al servidor
      const dataToSubmit = {
        name: formData.name.trim(),
        postal_code: formData.postal_code?.trim() || null,
        city: formData.city.trim(),
        province: formData.province?.trim() || null,
      };

      console.log('📦 CreateZone: Enviando datos:', dataToSubmit);

      await createZoneMutation.mutateAsync({ 
        affiliateId: id, 
        data: dataToSubmit 
      });
    } catch (error) {
      console.error('❌ CreateZone: Error en handleSubmit:', error);
      setIsLoading(false);
    }
  };

  // Manejar cancelación
  const handleCancel = () => {
    navigate(`/affiliates/${id}`);
  };

  // Mostrar loading mientras carga
  if (isLoadingAffiliate) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ui-fg-base mx-auto mb-4"></div>
          <p className="text-ui-fg-muted">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-ui-border-base">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleCancel}
            className="text-ui-fg-muted hover:text-ui-fg-base transition-colors"
          >
            <ArrowLeft />
          </button>
          <div>
            <h1 className="font-sans font-medium h2-core">Agregar Zona</h1>
            <p className="text-ui-fg-subtle txt-compact-small mt-1">
              {affiliate?.name || `Afiliado #${id}`}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-6">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="space-y-8">
            {/* Información de la Zona */}
            <div className="bg-ui-bg-base shadow rounded-lg p-6">
              <h2 className="font-sans font-medium txt-large mb-6">
                Información de la Zona
              </h2>

              <div className="space-y-6">
                {/* Nombre */}
                <div>
                  <Label htmlFor="name" className="mb-2 block">
                    Nombre <span className="text-ui-fg-error">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Nombre de la zona"
                    className={errors.name ? 'border-ui-fg-error' : ''}
                  />
                  {errors.name && (
                    <p className="text-ui-fg-error txt-compact-xsmall mt-1">
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Ciudad */}
                <div>
                  <Label htmlFor="city" className="mb-2 block">
                    Ciudad <span className="text-ui-fg-error">*</span>
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="Madrid, Barcelona, etc."
                    className={errors.city ? 'border-ui-fg-error' : ''}
                  />
                  {errors.city && (
                    <p className="text-ui-fg-error txt-compact-xsmall mt-1">
                      {errors.city}
                    </p>
                  )}
                </div>

                {/* Código Postal */}
                <div>
                  <Label htmlFor="postal_code" className="mb-2 block">
                    Código Postal
                  </Label>
                  <Input
                    id="postal_code"
                    name="postal_code"
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => handleChange('postal_code', e.target.value)}
                    placeholder="28001"
                  />
                </div>

                {/* Provincia */}
                <div>
                  <Label htmlFor="province" className="mb-2 block">
                    Provincia
                  </Label>
                  <Input
                    id="province"
                    name="province"
                    type="text"
                    value={formData.province}
                    onChange={(e) => handleChange('province', e.target.value)}
                    placeholder="Madrid, Cataluña, etc."
                  />
                </div>
              </div>
            </div>

            {/* Error de envío */}
            {errors.submit && (
              <div className="bg-ui-bg-error-subtle border border-ui-border-error rounded-lg p-4">
                <p className="text-ui-fg-error txt-compact-small">
                  {errors.submit}
                </p>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 p-6 border-t border-ui-border-base">
        <Button
          type="button"
          variant="secondary"
          onClick={handleCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          onClick={handleSubmit}
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? 'Creando...' : 'Agregar Zona'}
        </Button>
      </div>
    </div>
  );
}

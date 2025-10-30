// src/features/affiliates/create.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Label, Switch, Textarea } from "@medusajs/ui";
import { ArrowLeft } from "@medusajs/icons";
import { useSelector } from "react-redux";
import { hasPermission } from "../../utils/permissions.js";
import { useCreateAffiliateMutation } from "../../hooks/queries/useAffiliates.js";

export default function AffiliateCreate() {
  const navigate = useNavigate();

  // Obtener usuario y verificar permisos
  const { user } = useSelector((state) => state.auth);
  const canCreate = hasPermission(user, ['all', 'affiliates']);

  // Estados del formulario
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    city: "",
    postal_code: "",
    country: "España",
    notes: "",
    active: true,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Hook de mutación
  const createAffiliateMutation = useCreateAffiliateMutation({
    onSuccess: (createdAffiliate) => {
      console.log('✅ AffiliateCreate: Afiliado creado exitosamente:', createdAffiliate);
      sessionStorage.setItem('affiliate_just_created', createdAffiliate.id);
      navigate(`/affiliates/${createdAffiliate.id}`);
    },
    onError: (error) => {
      console.error('❌ AffiliateCreate: Error al crear afiliado:', error);
      setErrors({ submit: error.message });
      setIsLoading(false);
    }
  });

  // Verificar permisos al montar el componente
  useEffect(() => {
    if (!canCreate) {
      console.warn('🚫 Usuario no tiene permisos para crear afiliados');
      navigate('/affiliates', { replace: true });
    }
  }, [canCreate, navigate]);

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

    if (!formData.email?.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El email debe tener un formato válido";
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = "El teléfono es requerido";
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
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        company: formData.company?.trim() || null,
        address: formData.address?.trim() || null,
        city: formData.city?.trim() || null,
        postal_code: formData.postal_code?.trim() || null,
        country: formData.country?.trim() || null,
        notes: formData.notes?.trim() || null,
        active: formData.active,
      };

      console.log('📦 AffiliateCreate: Enviando datos:', dataToSubmit);

      await createAffiliateMutation.mutateAsync(dataToSubmit);
    } catch (error) {
      console.error('❌ AffiliateCreate: Error en handleSubmit:', error);
      setIsLoading(false);
    }
  };

  // Manejar cancelación
  const handleCancel = () => {
    navigate('/affiliates');
  };

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
            <h1 className="font-sans font-medium h2-core">Crear Afiliado</h1>
            <p className="text-ui-fg-subtle txt-compact-small mt-1">
              Complete la información del nuevo afiliado
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-6">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {/* Información General */}
            <div className="bg-ui-bg-base shadow rounded-lg p-6">
              <h2 className="font-sans font-medium txt-large mb-6">
                Información General
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre */}
                <div className="md:col-span-2">
                  <Label htmlFor="name" className="mb-2 block">
                    Nombre <span className="text-ui-fg-error">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Nombre del afiliado"
                    className={errors.name ? 'border-ui-fg-error' : ''}
                  />
                  {errors.name && (
                    <p className="text-ui-fg-error txt-compact-xsmall mt-1">
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="mb-2 block">
                    Email <span className="text-ui-fg-error">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="email@ejemplo.com"
                    className={errors.email ? 'border-ui-fg-error' : ''}
                  />
                  {errors.email && (
                    <p className="text-ui-fg-error txt-compact-xsmall mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Teléfono */}
                <div>
                  <Label htmlFor="phone" className="mb-2 block">
                    Teléfono <span className="text-ui-fg-error">*</span>
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+34 123 456 789"
                    className={errors.phone ? 'border-ui-fg-error' : ''}
                  />
                  {errors.phone && (
                    <p className="text-ui-fg-error txt-compact-xsmall mt-1">
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Empresa */}
                <div className="md:col-span-2">
                  <Label htmlFor="company" className="mb-2 block">
                    Empresa
                  </Label>
                  <Input
                    id="company"
                    name="company"
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleChange('company', e.target.value)}
                    placeholder="Nombre de la empresa"
                  />
                </div>
              </div>
            </div>

            {/* Dirección */}
            <div className="bg-ui-bg-base shadow rounded-lg p-6">
              <h2 className="font-sans font-medium txt-large mb-6">
                Dirección
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dirección */}
                <div className="md:col-span-2">
                  <Label htmlFor="address" className="mb-2 block">
                    Dirección
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Calle, número, etc."
                  />
                </div>

                {/* Ciudad */}
                <div>
                  <Label htmlFor="city" className="mb-2 block">
                    Ciudad
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="Ciudad"
                  />
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
                    placeholder="12345"
                  />
                </div>

                {/* País */}
                <div className="md:col-span-2">
                  <Label htmlFor="country" className="mb-2 block">
                    País
                  </Label>
                  <Input
                    id="country"
                    name="country"
                    type="text"
                    value={formData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    placeholder="España"
                  />
                </div>
              </div>
            </div>

            {/* Notas Adicionales */}
            <div className="bg-ui-bg-base shadow rounded-lg p-6">
              <h2 className="font-sans font-medium txt-large mb-6">
                Notas Adicionales
              </h2>

              <div>
                <Label htmlFor="notes" className="mb-2 block">
                  Notas
                </Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Información adicional sobre el afiliado..."
                  rows={4}
                />
              </div>
            </div>

            {/* Estado */}
            <div className="bg-ui-bg-base shadow rounded-lg p-6">
              <h2 className="font-sans font-medium txt-large mb-6">
                Estado
              </h2>

              <div className="flex items-center gap-3">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => handleChange('active', checked)}
                />
                <Label htmlFor="active" className="cursor-pointer">
                  {formData.active ? 'Activo' : 'Inactivo'}
                </Label>
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
          {isLoading ? 'Creando...' : 'Crear Afiliado'}
        </Button>
      </div>
    </div>
  );
}

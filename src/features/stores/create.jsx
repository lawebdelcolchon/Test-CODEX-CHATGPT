// src/features/stores/create.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Textarea, Label, Switch } from "@medusajs/ui";
import { ArrowLeft } from "@medusajs/icons";
import { useSelector } from "react-redux";
import { hasPermission } from "../../utils/permissions.js";
import { useCreateStoreMutation } from "../../hooks/queries/useStores.js";

export default function StoreCreate() {
  const navigate = useNavigate();
  
  // Obtener usuario y verificar permisos
  const { user } = useSelector((state) => state.auth);
  const canCreate = hasPermission(user, ['all', 'stores']);

  // Estados del formulario
  const [formData, setFormData] = useState({
    name: "",
    short_name: "",
    is_company: true,
    tax_code: "",
    code_shipping: "",
    code_control: "",
    email: "",
    phone: "",
    fax: "-",
    address: "",
    zipcode: "",
    city: "",
    active: true,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Hook de mutación
  const createStoreMutation = useCreateStoreMutation({
    onSuccess: (createdStore) => {
      console.log('✅ StoreCreate: Tienda creada exitosamente:', createdStore);
      navigate('/stores');
    },
    onError: (error) => {
      console.error('❌ StoreCreate: Error al crear tienda:', error);
      setErrors({ submit: error.message });
      setIsLoading(false);
    }
  });

  // Verificar permisos al montar el componente
  useEffect(() => {
    if (!canCreate) {
      console.warn('🚫 Usuario no tiene permisos para crear tiendas');
      navigate('/stores', { replace: true });
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

    if (!formData.short_name?.trim()) {
      newErrors.short_name = "El nombre corto es requerido";
    }

    if (!formData.tax_code?.trim()) {
      newErrors.tax_code = "El código fiscal es requerido";
    }

    if (!formData.code_shipping?.trim()) {
      newErrors.code_shipping = "El código de envío es requerido";
    }

    if (!formData.code_control?.trim()) {
      newErrors.code_control = "El código de control es requerido";
    }

    if (!formData.email?.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El email debe tener un formato válido";
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = "El teléfono es requerido";
    }

    if (!formData.address?.trim()) {
      newErrors.address = "La dirección es requerida";
    }

    if (!formData.zipcode?.trim()) {
      newErrors.zipcode = "El código postal es requerido";
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

    console.log('📤 StoreCreate: Creando tienda con datos:', formData);

    try {
      await createStoreMutation.mutateAsync(formData);
    } catch (error) {
      // El error ya se maneja en onError del hook
      console.error('❌ StoreCreate: Error en handleSubmit:', error);
    }
  };

  return (
    <div className="flex flex-col gap-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-4">
          <Button
            variant="transparent"
            onClick={() => navigate(-1)}
            className="p-1"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-sans font-medium h1-core">Nueva Tienda</h1>
            <p className="txt-compact-small text-ui-fg-subtle">
              Crea una nueva tienda en el sistema
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-ui-bg-base border border-ui-border-base rounded-lg p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-y-8">
          
          {/* Información Básica */}
          <div className="flex flex-col gap-y-6">
            <h2 className="font-sans font-medium txt-compact-large-plus">Información Básica</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="name" className="font-sans txt-compact-small-plus">
                  Nombre *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Nombre de la tienda"
                  className={errors.name ? "border-ui-border-error" : ""}
                />
                {errors.name && (
                  <span className="text-ui-fg-error txt-compact-xsmall">{errors.name}</span>
                )}
              </div>

              {/* Nombre Corto */}
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="short_name" className="font-sans txt-compact-small-plus">
                  Nombre Corto *
                </Label>
                <Input
                  id="short_name"
                  value={formData.short_name}
                  onChange={(e) => handleChange('short_name', e.target.value)}
                  placeholder="nombre-tienda"
                  className={errors.short_name ? "border-ui-border-error" : ""}
                />
                {errors.short_name && (
                  <span className="text-ui-fg-error txt-compact-xsmall">{errors.short_name}</span>
                )}
              </div>
            </div>
          </div>

          {/* Códigos de Control */}
          <div className="flex flex-col gap-y-6">
            <h2 className="font-sans font-medium txt-compact-large-plus">Códigos de Control</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Código Fiscal */}
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="tax_code" className="font-sans txt-compact-small-plus">
                  Código Fiscal *
                </Label>
                <Input
                  id="tax_code"
                  value={formData.tax_code}
                  onChange={(e) => handleChange('tax_code', e.target.value)}
                  placeholder="B12345678"
                  className={errors.tax_code ? "border-ui-border-error" : ""}
                />
                {errors.tax_code && (
                  <span className="text-ui-fg-error txt-compact-xsmall">{errors.tax_code}</span>
                )}
              </div>

              {/* Código de Envío */}
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="code_shipping" className="font-sans txt-compact-small-plus">
                  Código de Envío *
                </Label>
                <Input
                  id="code_shipping"
                  value={formData.code_shipping}
                  onChange={(e) => handleChange('code_shipping', e.target.value)}
                  placeholder="SHIP001"
                  className={errors.code_shipping ? "border-ui-border-error" : ""}
                />
                {errors.code_shipping && (
                  <span className="text-ui-fg-error txt-compact-xsmall">{errors.code_shipping}</span>
                )}
              </div>

              {/* Código de Control */}
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="code_control" className="font-sans txt-compact-small-plus">
                  Código de Control *
                </Label>
                <Input
                  id="code_control"
                  value={formData.code_control}
                  onChange={(e) => handleChange('code_control', e.target.value)}
                  placeholder="CTRL001"
                  className={errors.code_control ? "border-ui-border-error" : ""}
                />
                {errors.code_control && (
                  <span className="text-ui-fg-error txt-compact-xsmall">{errors.code_control}</span>
                )}
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="flex flex-col gap-y-6">
            <h2 className="font-sans font-medium txt-compact-large-plus">Información de Contacto</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Email */}
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="email" className="font-sans txt-compact-small-plus">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className={errors.email ? "border-ui-border-error" : ""}
                />
                {errors.email && (
                  <span className="text-ui-fg-error txt-compact-xsmall">{errors.email}</span>
                )}
              </div>

              {/* Teléfono */}
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="phone" className="font-sans txt-compact-small-plus">
                  Teléfono *
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+34123456789"
                  className={errors.phone ? "border-ui-border-error" : ""}
                />
                {errors.phone && (
                  <span className="text-ui-fg-error txt-compact-xsmall">{errors.phone}</span>
                )}
              </div>

              {/* Fax */}
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="fax" className="font-sans txt-compact-small-plus">
                  Fax
                </Label>
                <Input
                  id="fax"
                  value={formData.fax}
                  onChange={(e) => handleChange('fax', e.target.value)}
                  placeholder="+34123456790"
                />
              </div>
            </div>
          </div>

          {/* Dirección */}
          <div className="flex flex-col gap-y-6">
            <h2 className="font-sans font-medium txt-compact-large-plus">Dirección</h2>
            
            <div className="grid grid-cols-1 gap-4">
              {/* Dirección */}
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="address" className="font-sans txt-compact-small-plus">
                  Dirección *
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Calle Mayor 123"
                  className={errors.address ? "border-ui-border-error" : ""}
                />
                {errors.address && (
                  <span className="text-ui-fg-error txt-compact-xsmall">{errors.address}</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ciudad */}
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="city" className="font-sans txt-compact-small-plus">
                  Ciudad *
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="Madrid"
                  className={errors.city ? "border-ui-border-error" : ""}
                />
                {errors.city && (
                  <span className="text-ui-fg-error txt-compact-xsmall">{errors.city}</span>
                )}
              </div>

              {/* Código Postal */}
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="zipcode" className="font-sans txt-compact-small-plus">
                  Código Postal *
                </Label>
                <Input
                  id="zipcode"
                  value={formData.zipcode}
                  onChange={(e) => handleChange('zipcode', e.target.value)}
                  placeholder="28001"
                  className={errors.zipcode ? "border-ui-border-error" : ""}
                />
                {errors.zipcode && (
                  <span className="text-ui-fg-error txt-compact-xsmall">{errors.zipcode}</span>
                )}
              </div>
            </div>
          </div>

          {/* Configuración */}
          <div className="flex flex-col gap-y-6">
            <h2 className="font-sans font-medium txt-compact-large-plus">Configuración</h2>
            
            {/* Switches */}
            <div className="flex flex-col gap-y-4">
              <div className="flex items-center justify-between p-4 border border-ui-border-base rounded-lg">
                <div>
                  <p className="font-sans txt-compact-medium-plus">Es Empresa</p>
                  <p className="font-sans txt-compact-small text-ui-fg-subtle">
                    Determina si esta tienda es una empresa
                  </p>
                </div>
                <Switch
                  checked={formData.is_company}
                  onCheckedChange={(checked) => handleChange('is_company', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border border-ui-border-base rounded-lg">
                <div>
                  <p className="font-sans txt-compact-medium-plus">Tienda Activa</p>
                  <p className="font-sans txt-compact-small text-ui-fg-subtle">
                    Determina si la tienda está activa en el sistema
                  </p>
                </div>
                <Switch
                  checked={formData.active}
                  onCheckedChange={(checked) => handleChange('active', checked)}
                />
              </div>
            </div>
          </div>

          {/* Error general */}
          {errors.submit && (
            <div className="bg-ui-bg-error border border-ui-border-error rounded-lg p-4">
              <p className="text-ui-fg-error txt-compact-small">{errors.submit}</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex items-center gap-x-4 pt-4">
            <Button
              type="submit"
              isLoading={isLoading}
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? "Creando..." : "Crear Tienda"}
            </Button>
            
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/stores')}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
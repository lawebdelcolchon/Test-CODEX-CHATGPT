// src/features/clients/create_new.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Label, Switch, Select } from "@medusajs/ui";
import { ArrowLeft } from "@medusajs/icons";
import { useSelector } from "react-redux";
import { hasPermission } from "../../utils/permissions.js";
import { useCreateClientMutation } from "../../hooks/queries/useClients.js";
import { useActiveStoresQuery } from "../../hooks/queries/useStores.js";
import { useActiveAffiliatesQuery } from "../../hooks/queries/useAffiliates.js";

export default function ClientCreateNew() {
  const navigate = useNavigate();

  // Obtener usuario y verificar permisos
  const { user } = useSelector((state) => state.auth);
  const canCreate = hasPermission(user, ['all', 'clients']);

  // Estados del formulario - basado en modelo real Client
  const [formData, setFormData] = useState({
    // Claves foráneas
    id_store: "",
    id_affiliate: "none",
    
    // Campos obligatorios
    name: "",
    lastname: "",
    tax_code: "",
    email: "",
    amz_email: "", // Se auto-rellenará con email si está vacío
    phone: "",
    road: "",
    address: "",
    zipcode: "",
    city: "",
    user: "",
    password: "",
    
    // Campos opcionales
    via: "",
    fax: "",
    
    // Estados booleanos
    is_company: false,
    active: true,
    privacy: false,
    advertising: false,
    send: true,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Cargar datos para los selectores
  const { data: storesData, isLoading: storesLoading } = useActiveStoresQuery();
  const { data: affiliatesData, isLoading: affiliatesLoading } = useActiveAffiliatesQuery();

  // Preparar opciones para los selectores
  const storesOptions = React.useMemo(() => {
    if (!storesData?.items) return [];
    return storesData.items.map(store => ({
      label: store.name || store.short_name || `Tienda ${store.id}`,
      value: String(store.id)
    }));
  }, [storesData]);

  const affiliatesOptions = React.useMemo(() => {
    if (!affiliatesData?.items) return [];
    return affiliatesData.items.map(affiliate => ({
      label: affiliate.name || `Afiliado ${affiliate.id}`,
      value: String(affiliate.id)
    }));
  }, [affiliatesData]);

  // Hook de mutación
  const createClientMutation = useCreateClientMutation({
    onSuccess: (createdClient) => {
      console.log('✅ ClientCreate: Cliente creado exitosamente:', createdClient);
      sessionStorage.setItem('client_just_edited', createdClient.id);
      navigate('/clients');
    },
    onError: (error) => {
      console.error('❌ ClientCreate: Error al crear cliente:', error);
      setErrors({ submit: error.message });
      setIsLoading(false);
    }
  });

  // Verificar permisos al montar el componente
  useEffect(() => {
    if (!canCreate) {
      console.warn('🚫 Usuario no tiene permisos para crear clientes');
      navigate('/clients', { replace: true });
    }
  }, [canCreate, navigate]);

  // Auto-rellenar amz_email con email si está vacío
  useEffect(() => {
    if (formData.email && !formData.amz_email) {
      setFormData(prev => ({ ...prev, amz_email: prev.email }));
    }
  }, [formData.email, formData.amz_email]);

  // Auto-generar user basado en nombre y apellido
  useEffect(() => {
    if (formData.name && formData.lastname && !formData.user.includes('.')) {
      const suggestedUser = `${formData.name.toLowerCase()}.${formData.lastname.toLowerCase()}`.replace(/\s+/g, '');
      setFormData(prev => ({ ...prev, user: suggestedUser }));
    }
  }, [formData.name, formData.lastname]);

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

    // Tienda obligatoria
    if (!formData.id_store) {
      newErrors.id_store = "La tienda es requerida";
    }

    // Campos obligatorios del modelo
    if (!formData.name?.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    if (!formData.lastname?.trim()) {
      newErrors.lastname = "El apellido es requerido";
    }

    if (!formData.tax_code?.trim()) {
      newErrors.tax_code = "El código fiscal es requerido";
    }

    if (!formData.email?.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El email debe tener un formato válido";
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = "El teléfono es requerido";
    }

    if (!formData.road?.trim()) {
      newErrors.road = "La vía/carretera es requerida";
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

    if (!formData.user?.trim()) {
      newErrors.user = "El nombre de usuario es requerido";
    }

    if (!formData.password?.trim()) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
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
      // Preparar datos finales
      const finalData = {
        ...formData,
        amz_email: formData.amz_email || formData.email, // Usar email principal si no hay amz_email
      };
      
      await createClientMutation.mutateAsync(finalData);
    } catch (error) {
      console.error('❌ ClientCreate: Error en handleSubmit:', error);
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
            <h1 className="font-sans font-medium h1-core">Nuevo Cliente</h1>
            <p className="txt-compact-small text-ui-fg-subtle">
              Crea un nuevo cliente en el sistema
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-ui-bg-base border border-ui-border-base rounded-lg p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-y-8">

          {/* Asignaciones */}
          <div className="flex flex-col gap-y-6">
            <h2 className="font-sans font-medium txt-compact-large-plus">Asignaciones</h2>

            {/* Tienda */}
            <div className="flex flex-col gap-y-2">
              <Label htmlFor="id_store" className="font-sans txt-compact-small-plus">
                Tienda *
              </Label>
              <Select
                value={formData.id_store}
                onValueChange={(value) => handleChange('id_store', value)}
                disabled={storesLoading}
              >
                <Select.Trigger className={errors.id_store ? "border-ui-border-error" : ""}>
                  <Select.Value placeholder={storesLoading ? "Cargando tiendas..." : "Seleccionar tienda"} />
                </Select.Trigger>
                <Select.Content>
                  {storesOptions.map((option) => (
                    <Select.Item key={option.value} value={option.value}>
                      {option.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
              {errors.id_store && (
                <span className="text-ui-fg-error txt-compact-xsmall">{errors.id_store}</span>
              )}
            </div>

            {/* Afiliado */}
            <div className="flex flex-col gap-y-2">
              <Label htmlFor="id_affiliate" className="font-sans txt-compact-small-plus">
                Afiliado (Opcional)
              </Label>
              <Select
                value={formData.id_affiliate}
                onValueChange={(value) => handleChange('id_affiliate', value)}
                disabled={affiliatesLoading}
              >
                <Select.Trigger>
                  <Select.Value placeholder={affiliatesLoading ? "Cargando afiliados..." : "Seleccionar afiliado (opcional)"} />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="none">
                    Sin afiliado
                  </Select.Item>
                  {affiliatesOptions.map((option) => (
                    <Select.Item key={option.value} value={option.value}>
                      {option.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
          </div>

          {/* Información Personal */}
          <div className="flex flex-col gap-y-6">
            <h2 className="font-sans font-medium txt-compact-large-plus">Información Personal</h2>

            <div className="grid grid-cols-2 gap-x-4">
              {/* Nombre */}
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="name" className="font-sans txt-compact-small-plus">
                  Nombre *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Nombre"
                  className={errors.name ? "border-ui-border-error" : ""}
                  required
                />
                {errors.name && (
                  <span className="text-ui-fg-error txt-compact-xsmall">{errors.name}</span>
                )}
              </div>

              {/* Apellido */}
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="lastname" className="font-sans txt-compact-small-plus">
                  Apellido *
                </Label>
                <Input
                  id="lastname"
                  value={formData.lastname}
                  onChange={(e) => handleChange('lastname', e.target.value)}
                  placeholder="Apellido"
                  className={errors.lastname ? "border-ui-border-error" : ""}
                  required
                />
                {errors.lastname && (
                  <span className="text-ui-fg-error txt-compact-xsmall">{errors.lastname}</span>
                )}
              </div>
            </div>

            {/* Código Fiscal */}
            <div className="flex flex-col gap-y-2">
              <Label htmlFor="tax_code" className="font-sans txt-compact-small-plus">
                Código Fiscal *
              </Label>
              <Input
                id="tax_code"
                value={formData.tax_code}
                onChange={(e) => handleChange('tax_code', e.target.value)}
                placeholder="12345678A"
                className={errors.tax_code ? "border-ui-border-error" : ""}
                required
              />
              {errors.tax_code && (
                <span className="text-ui-fg-error txt-compact-xsmall">{errors.tax_code}</span>
              )}
            </div>

            {/* Email y Amazon Email */}
            <div className="grid grid-cols-2 gap-x-4">
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
                  required
                />
                {errors.email && (
                  <span className="text-ui-fg-error txt-compact-xsmall">{errors.email}</span>
                )}
              </div>

              <div className="flex flex-col gap-y-2">
                <Label htmlFor="amz_email" className="font-sans txt-compact-small-plus">
                  Email Amazon
                </Label>
                <Input
                  id="amz_email"
                  type="email"
                  value={formData.amz_email}
                  onChange={(e) => handleChange('amz_email', e.target.value)}
                  placeholder="Se auto-completa con email principal"
                />
              </div>
            </div>

            {/* Teléfono y Fax */}
            <div className="grid grid-cols-2 gap-x-4">
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
                  required
                />
                {errors.phone && (
                  <span className="text-ui-fg-error txt-compact-xsmall">{errors.phone}</span>
                )}
              </div>

              <div className="flex flex-col gap-y-2">
                <Label htmlFor="fax" className="font-sans txt-compact-small-plus">
                  Fax
                </Label>
                <Input
                  id="fax"
                  value={formData.fax}
                  onChange={(e) => handleChange('fax', e.target.value)}
                  placeholder="+34987654321"
                />
              </div>
            </div>

          </div>

          {/* Dirección */}
          <div className="flex flex-col gap-y-6">
            <h2 className="font-sans font-medium txt-compact-large-plus">Dirección</h2>

            {/* Vía/Carretera */}
            <div className="flex flex-col gap-y-2">
              <Label htmlFor="road" className="font-sans txt-compact-small-plus">
                Vía/Carretera *
              </Label>
              <Input
                id="road"
                value={formData.road}
                onChange={(e) => handleChange('road', e.target.value)}
                placeholder="Carretera, Calle, Avenida..."
                className={errors.road ? "border-ui-border-error" : ""}
                required
              />
              {errors.road && (
                <span className="text-ui-fg-error txt-compact-xsmall">{errors.road}</span>
              )}
            </div>

            {/* Dirección */}
            <div className="flex flex-col gap-y-2">
              <Label htmlFor="address" className="font-sans txt-compact-small-plus">
                Dirección Completa *
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Calle Mayor 123, 2º B"
                className={errors.address ? "border-ui-border-error" : ""}
                required
              />
              {errors.address && (
                <span className="text-ui-fg-error txt-compact-xsmall">{errors.address}</span>
              )}
            </div>

            {/* Código Postal y Ciudad */}
            <div className="grid grid-cols-2 gap-x-4">
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
                  required
                />
                {errors.zipcode && (
                  <span className="text-ui-fg-error txt-compact-xsmall">{errors.zipcode}</span>
                )}
              </div>

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
                  required
                />
                {errors.city && (
                  <span className="text-ui-fg-error txt-compact-xsmall">{errors.city}</span>
                )}
              </div>
            </div>

          </div>

          {/* Credenciales */}
          <div className="flex flex-col gap-y-6">
            <h2 className="font-sans font-medium txt-compact-large-plus">Credenciales de Acceso</h2>

            <div className="grid grid-cols-2 gap-x-4">
              {/* Usuario */}
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="user" className="font-sans txt-compact-small-plus">
                  Usuario *
                </Label>
                <Input
                  id="user"
                  value={formData.user}
                  onChange={(e) => handleChange('user', e.target.value)}
                  placeholder="nombre.apellido"
                  className={errors.user ? "border-ui-border-error" : ""}
                  required
                />
                {errors.user && (
                  <span className="text-ui-fg-error txt-compact-xsmall">{errors.user}</span>
                )}
              </div>

              {/* Contraseña */}
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="password" className="font-sans txt-compact-small-plus">
                  Contraseña *
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className={errors.password ? "border-ui-border-error" : ""}
                  required
                />
                {errors.password && (
                  <span className="text-ui-fg-error txt-compact-xsmall">{errors.password}</span>
                )}
              </div>
            </div>

          </div>

          {/* Configuración */}
          <div className="flex flex-col gap-y-6">
            <h2 className="font-sans font-medium txt-compact-large-plus">Configuración</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-x-4">
                <Label htmlFor="is_company" className="font-sans txt-compact-small-plus cursor-pointer">
                  Es Empresa
                </Label>
                <Switch
                  id="is_company"
                  checked={formData.is_company}
                  onCheckedChange={(checked) => handleChange('is_company', checked)}
                />
              </div>

              <div className="flex items-center gap-x-4">
                <Label htmlFor="active" className="font-sans txt-compact-small-plus cursor-pointer">
                  Cliente Activo
                </Label>
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => handleChange('active', checked)}
                />
              </div>

              <div className="flex items-center gap-x-4">
                <Label htmlFor="privacy" className="font-sans txt-compact-small-plus cursor-pointer">
                  Acepta Privacidad
                </Label>
                <Switch
                  id="privacy"
                  checked={formData.privacy}
                  onCheckedChange={(checked) => handleChange('privacy', checked)}
                />
              </div>

              <div className="flex items-center gap-x-4">
                <Label htmlFor="advertising" className="font-sans txt-compact-small-plus cursor-pointer">
                  Acepta Publicidad
                </Label>
                <Switch
                  id="advertising"
                  checked={formData.advertising}
                  onCheckedChange={(checked) => handleChange('advertising', checked)}
                />
              </div>

              <div className="flex items-center gap-x-4">
                <Label htmlFor="send" className="font-sans txt-compact-small-plus cursor-pointer">
                  Permite Comunicaciones
                </Label>
                <Switch
                  id="send"
                  checked={formData.send}
                  onCheckedChange={(checked) => handleChange('send', checked)}
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
              {isLoading ? "Creando..." : "Crear Cliente"}
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/clients')}
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
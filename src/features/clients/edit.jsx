// src/features/clients/edit.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Input, Label, Switch, Select } from "@medusajs/ui";
import { ArrowLeft } from "@medusajs/icons";
import { useSelector } from "react-redux";
import { hasPermission } from "../../utils/permissions.js";
import { useClientQuery, useUpdateClientMutation } from "../../hooks/queries/useClients.js";
import { useActiveStoresQuery } from "../../hooks/queries/useStores.js";
import { useActiveAffiliatesQuery } from "../../hooks/queries/useAffiliates.js";

export default function ClientEdit() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Obtener usuario y verificar permisos
  const { user } = useSelector((state) => state.auth);
  const canEdit = hasPermission(user, ['all', 'clients']);

  // Estados del formulario - según modelo real Client
  const [formData, setFormData] = useState({
    // Claves foráneas
    id_store: "",
    id_affiliate: "none",
    
    // Campos obligatorios
    name: "",
    lastname: "",
    tax_code: "",
    email: "",
    amz_email: "",
    phone: "",
    road: "",
    address: "",
    zipcode: "",
    city: "",
    user: "",
    password: "",
    
    // Campos opcionales
    via: "",
    accounting_plan: "",
    fax: "",
    idcity: "",
    date_client: "",
    
    // Estados booleanos
    is_company: false,
    active: true,
    level: false,
    privacy: false,
    advertising: false,
    send: true,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState(null);

  // Query para obtener los datos del cliente
  const {
    data: client,
    isLoading: isLoadingClient,
    error: clientError,
    refetch: refetchClient
  } = useClientQuery(id);

  // Cargar datos para los selectores
  const { data: storesData, isLoading: storesLoading } = useActiveStoresQuery();
  const { data: affiliatesData, isLoading: affiliatesLoading } = useActiveAffiliatesQuery();

  // Preparar opciones para los selectores
  const storesOptions = React.useMemo(() => {
    if (!storesData?.items) {
      console.log('🏪 ClientEdit: storesData aún no disponible');
      return [];
    }
    const options = storesData.items.map(store => ({
      label: store.name || store.short_name || `Tienda ${store.id}`,
      value: String(store.id)
    }));
    console.log('🏪 ClientEdit: Opciones de tiendas preparadas:', options);
    return options;
  }, [storesData]);

  const affiliatesOptions = React.useMemo(() => {
    if (!affiliatesData?.items) {
      console.log('🤝 ClientEdit: affiliatesData aún no disponible');
      return [];
    }
    const options = affiliatesData.items.map(affiliate => ({
      label: affiliate.name || `Afiliado ${affiliate.id}`,
      value: String(affiliate.id)
    }));
    console.log('🤝 ClientEdit: Opciones de afiliados preparadas:', options);
    return options;
  }, [affiliatesData]);

  // Hook de mutación
  const updateClientMutation = useUpdateClientMutation({
    onSuccess: (updatedClient) => {
      console.log('✅ ClientEdit: Cliente actualizado exitosamente:', updatedClient);
      sessionStorage.setItem('client_just_edited', updatedClient.id);
      navigate(`/clients/${updatedClient.id}`);
    },
    onError: (error) => {
      console.error('❌ ClientEdit: Error al actualizar cliente:', error);
      setErrors({ submit: error.message });
      setIsLoading(false);
    }
  });

  // Verificar permisos al montar el componente
  useEffect(() => {
    if (!canEdit) {
      console.warn('🚫 Usuario no tiene permisos para editar clientes');
      navigate('/clients', { replace: true });
    }
  }, [canEdit, navigate]);

  // Cargar datos del cliente cuando se obtengan
  useEffect(() => {
    if (client) {
      const clientData = {
        // Claves foráneas
        id_store: client.id_store || null,
        id_affiliate: client.id_affiliate ? String(client.id_affiliate) : "none",
        
        // Campos obligatorios
        name: client.name || "",
        lastname: client.lastname || "",
        tax_code: client.tax_code || "",
        email: client.email || "",
        amz_email: client.amz_email || "",
        phone: client.phone || "",
        road: client.road || "",
        address: client.address || "",
        zipcode: client.zipcode || "",
        city: client.city || "",
        user: client.user || "",
        password: "", // No mostrar password actual por seguridad
        
        // Campos opcionales
        via: client.via || "",
        accounting_plan: client.accounting_plan || "",
        fax: client.fax || "",
        idcity: client.idcity || "",
        
        // Estados booleanos
        is_company: client.is_company ?? false,
        active: client.active ?? true,
        level: client.level ?? false,
        privacy: client.privacy ?? false,
        advertising: client.advertising ?? false,
        send: client.send ?? true,
        
        // Fecha del cliente
        date_client: client.date_client ? client.date_client.split('T')[0] : "",
      };
      
      setFormData(clientData);
      setOriginalData(clientData);
      console.log('📄 ClientEdit: Datos del cliente cargados:', clientData);
      console.log('🏪 ClientEdit: ID de tienda del cliente:', client.id_store);
      console.log('🤝 ClientEdit: ID de afiliado del cliente:', client.id_affiliate);
    }
  }, [client]);

  // Simple debug para verificar carga de datos
  useEffect(() => {
    if (client && storesOptions.length > 0) {
      console.log('🏪 ClientEdit: Cliente cargado - ID tienda:', client.id_store);
      console.log('🏪 ClientEdit: Tiendas disponibles:', storesOptions.length);
    }
  }, [client, storesOptions]);

  // Detectar cambios en el formulario
  useEffect(() => {
    if (originalData) {
      const hasChanges = Object.keys(formData).some(key => {
        return formData[key] !== originalData[key];
      });
      setHasChanges(hasChanges);
    }
  }, [formData, originalData]);

  // Manejar cambios en el formulario
  const handleChange = (field, value) => {
    console.log(`🔄 ClientEdit: Campo ${field} cambiado a:`, value);
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      console.log('📄 ClientEdit: FormData actualizado:', newData);
      return newData;
    });

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

    // Campos obligatorios
    if (!formData.name?.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    if (!formData.lastname?.trim()) {
      newErrors.lastname = "Los apellidos son requeridos";
    }

    if (!formData.tax_code?.trim()) {
      newErrors.tax_code = "El código fiscal es requerido";
    }

    if (!formData.email?.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El email debe tener un formato válido";
    }

    if (!formData.amz_email?.trim()) {
      newErrors.amz_email = "El email de Amazon es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.amz_email)) {
      newErrors.amz_email = "El email de Amazon debe tener un formato válido";
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = "El teléfono es requerido";
    }

    if (!formData.road?.trim()) {
      newErrors.road = "La calle/carretera es requerida";
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
      newErrors.user = "El usuario es requerido";
    }

    if (!formData.id_store || formData.id_store === "none") {
      newErrors.id_store = "La tienda es requerida";
    }

    return newErrors;
  };

  // Transformar datos para la API
  const transformForAPI = (data) => {
    const apiData = {
      id_store: data.id_store ? parseInt(data.id_store) : null,
      name: data.name.trim(),
      lastname: data.lastname.trim(),
      tax_code: data.tax_code.trim(),
      email: data.email.trim(),
      amz_email: data.amz_email.trim(),
      phone: data.phone.trim(),
      road: data.road.trim(),
      address: data.address.trim(),
      zipcode: data.zipcode.trim(),
      city: data.city.trim(),
      user: data.user.trim(),
      is_company: data.is_company,
      active: data.active,
      level: data.level,
      privacy: data.privacy,
      advertising: data.advertising,
      send: data.send,
    };

    // Solo incluir afiliado si tiene un valor válido
    if (data.id_affiliate && data.id_affiliate !== "none") {
      apiData.id_affiliate = parseInt(data.id_affiliate);
    }

    // Campos opcionales - solo incluir si tienen valor
    if (data.fax?.trim()) {
      apiData.fax = data.fax.trim();
    }

    if (data.via?.trim()) {
      apiData.via = data.via.trim();
    }

    if (data.accounting_plan) {
      apiData.accounting_plan = parseInt(data.accounting_plan);
    }

    if (data.idcity) {
      apiData.idcity = parseInt(data.idcity);
    }

    // Solo incluir password si se ha cambiado
    if (data.password?.trim()) {
      apiData.password = data.password.trim();
    }

    // Solo incluir fecha si tiene valor
    if (data.date_client) {
      apiData.date_client = data.date_client;
    }

    console.log('📄 ClientEdit: Datos transformados para API:', apiData);
    return apiData;
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
      const apiData = transformForAPI(formData);
      await updateClientMutation.mutateAsync({
        id: id,
        data: apiData
      });
    } catch (error) {
      console.error('❌ ClientEdit: Error en handleSubmit:', error);
    }
  };

  // Manejar cancelación
  const handleCancel = () => {
    if (hasChanges) {
      const confirmCancel = window.confirm(
        "¿Estás seguro de que quieres cancelar? Los cambios no guardados se perderán."
      );
      if (!confirmCancel) return;
    }
    navigate(`/clients/${id}`);
  };

  // Mostrar loading
  if (isLoadingClient) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-ui-fg-interactive"></div>
        <p className="mt-4 text-ui-fg-muted">Cargando datos del cliente...</p>
      </div>
    );
  }

  // Mostrar error
  if (clientError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="mb-4">
          <svg className="w-16 h-16 text-red-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-ui-fg-base mb-2">Error al cargar cliente</h2>
        <p className="text-ui-fg-muted mb-4">{clientError.message}</p>
        <Button onClick={() => navigate('/clients')}>
          Volver a Clientes
        </Button>
      </div>
    );
  }

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
            <h1 className="font-sans font-medium h1-core">
              Editar Cliente: {client?.name}
            </h1>
            <p className="txt-compact-small text-ui-fg-subtle">
              Modifica la información del cliente
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-ui-bg-base border border-ui-border-base rounded-lg p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-y-8">

          {/* Información Personal */}
          <div className="flex flex-col gap-y-6">
            <h2 className="font-sans font-medium txt-compact-large-plus">Información Personal</h2>

            {/* Nombre y Apellidos */}
            <div className="grid grid-cols-2 gap-x-4">
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="name" className="font-sans txt-compact-small-plus">
                  Nombre *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Nombre del cliente"
                  className={errors.name ? "border-ui-border-error" : ""}
                  required
                />
                {errors.name && (
                  <span className="text-ui-fg-error txt-compact-xsmall">{errors.name}</span>
                )}
              </div>

              <div className="flex flex-col gap-y-2">
                <Label htmlFor="lastname" className="font-sans txt-compact-small-plus">
                  Apellidos *
                </Label>
                <Input
                  id="lastname"
                  value={formData.lastname}
                  onChange={(e) => handleChange('lastname', e.target.value)}
                  placeholder="Apellidos del cliente"
                  className={errors.lastname ? "border-ui-border-error" : ""}
                  required
                />
                {errors.lastname && (
                  <span className="text-ui-fg-error txt-compact-xsmall">{errors.lastname}</span>
                )}
              </div>
            </div>

            {/* Tax Code */}
            <div className="flex flex-col gap-y-2">
              <Label htmlFor="tax_code" className="font-sans txt-compact-small-plus">
                Código Fiscal (NIF/CIF) *
              </Label>
              <Input
                id="tax_code"
                value={formData.tax_code}
                onChange={(e) => handleChange('tax_code', e.target.value)}
                placeholder="12345678A o A12345678"
                className={errors.tax_code ? "border-ui-border-error" : ""}
                required
              />
              {errors.tax_code && (
                <span className="text-ui-fg-error txt-compact-xsmall">{errors.tax_code}</span>
              )}
            </div>

            {/* Es empresa */}
            <div className="flex items-center gap-x-4">
              <Label htmlFor="is_company" className="font-sans txt-compact-small-plus cursor-pointer">
                Es empresa
              </Label>
              <Switch
                id="is_company"
                checked={formData.is_company}
                onCheckedChange={(checked) => handleChange('is_company', checked)}
              />
            </div>

          </div>

          {/* Información de Contacto */}
          <div className="flex flex-col gap-y-6">
            <h2 className="font-sans font-medium txt-compact-large-plus">Información de Contacto</h2>

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
                  Email Amazon *
                </Label>
                <Input
                  id="amz_email"
                  type="email"
                  value={formData.amz_email}
                  onChange={(e) => handleChange('amz_email', e.target.value)}
                  placeholder="amazon@ejemplo.com"
                  className={errors.amz_email ? "border-ui-border-error" : ""}
                  required
                />
                {errors.amz_email && (
                  <span className="text-ui-fg-error txt-compact-xsmall">{errors.amz_email}</span>
                )}
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
                  placeholder="+34123456790"
                />
              </div>
            </div>

          </div>

          {/* Dirección */}
          <div className="flex flex-col gap-y-6">
            <h2 className="font-sans font-medium txt-compact-large-plus">Dirección</h2>

            {/* Road y Address */}
            <div className="grid grid-cols-2 gap-x-4">
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="road" className="font-sans txt-compact-small-plus">
                  Calle/Carretera *
                </Label>
                <Input
                  id="road"
                  value={formData.road}
                  onChange={(e) => handleChange('road', e.target.value)}
                  placeholder="Calle Principal"
                  className={errors.road ? "border-ui-border-error" : ""}
                  required
                />
                {errors.road && (
                  <span className="text-ui-fg-error txt-compact-xsmall">{errors.road}</span>
                )}
              </div>

              <div className="flex flex-col gap-y-2">
                <Label htmlFor="address" className="font-sans txt-compact-small-plus">
                  Dirección *
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Número, piso, puerta"
                  className={errors.address ? "border-ui-border-error" : ""}
                  required
                />
                {errors.address && (
                  <span className="text-ui-fg-error txt-compact-xsmall">{errors.address}</span>
                )}
              </div>
            </div>

            {/* Ciudad, Código Postal e ID Ciudad */}
            <div className="grid grid-cols-3 gap-x-4">
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
                <Label htmlFor="idcity" className="font-sans txt-compact-small-plus">
                  ID Ciudad
                </Label>
                <Input
                  id="idcity"
                  type="number"
                  value={formData.idcity}
                  onChange={(e) => handleChange('idcity', e.target.value)}
                  placeholder="ID de la ciudad"
                />
              </div>
            </div>

          </div>

          {/* Datos Comerciales */}
          <div className="flex flex-col gap-y-6">
            <h2 className="font-sans font-medium txt-compact-large-plus">Datos Comerciales</h2>

            {/* Vía y Plan Contable */}
            <div className="grid grid-cols-2 gap-x-4">
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="via" className="font-sans txt-compact-small-plus">
                  Vía
                </Label>
                <Input
                  id="via"
                  value={formData.via}
                  onChange={(e) => handleChange('via', e.target.value)}
                  placeholder="Vía de contacto"
                />
              </div>

              <div className="flex flex-col gap-y-2">
                <Label htmlFor="accounting_plan" className="font-sans txt-compact-small-plus">
                  Plan Contable
                </Label>
                <Input
                  id="accounting_plan"
                  type="number"
                  value={formData.accounting_plan}
                  onChange={(e) => handleChange('accounting_plan', e.target.value)}
                  placeholder="ID del plan contable"
                />
              </div>
            </div>

          </div>

          {/* Acceso de Usuario */}
          <div className="flex flex-col gap-y-6">
            <h2 className="font-sans font-medium txt-compact-large-plus">Acceso de Usuario</h2>

            {/* Usuario y Password */}
            <div className="grid grid-cols-2 gap-x-4">
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="user" className="font-sans txt-compact-small-plus">
                  Usuario *
                </Label>
                <Input
                  id="user"
                  value={formData.user}
                  onChange={(e) => handleChange('user', e.target.value)}
                  placeholder="Usuario de acceso"
                  className={errors.user ? "border-ui-border-error" : ""}
                  required
                />
                {errors.user && (
                  <span className="text-ui-fg-error txt-compact-xsmall">{errors.user}</span>
                )}
              </div>

              <div className="flex flex-col gap-y-2">
                <Label htmlFor="password" className="font-sans txt-compact-small-plus">
                  Nueva Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Dejar vacío para mantener actual"
                />
              </div>
            </div>

            {/* Fecha Cliente */}
            <div className="flex flex-col gap-y-2">
              <Label htmlFor="date_client" className="font-sans txt-compact-small-plus">
                Fecha de Cliente
              </Label>
              <Input
                id="date_client"
                type="date"
                value={formData.date_client}
                onChange={(e) => handleChange('date_client', e.target.value)}
              />
            </div>

          </div>

          {/* Asignaciones */}
          <div className="flex flex-col gap-y-6">
            <h2 className="font-sans font-medium txt-compact-large-plus">Asignaciones</h2>

            {/* Tienda */}
            <div className="flex flex-col gap-y-2">
              <Label htmlFor="id_store" className="font-sans txt-compact-small-plus">
                Tienda *
              </Label>
              <Select
                key={`store-${formData.id_store}-${storesOptions.length}`}
                value={formData.id_store?.toString() || "none"}
                onValueChange={(value) => {
                  console.log('🏪 ClientEdit: Tienda seleccionada:', value);
                  const newValue = value === "none" ? "" : value;
                  handleChange('id_store', newValue);
                }}
                disabled={storesLoading || storesOptions.length === 0}
              >
                <Select.Trigger className={errors.id_store ? "border-ui-border-error" : ""}>
                  <Select.Value placeholder="Seleccionar tienda" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="none">Seleccionar tienda</Select.Item>
                  {storesOptions.map((option) => (
                    <Select.Item key={option.value} value={option.value.toString()}>
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
                value={formData.id_affiliate === "none" || (formData.id_affiliate && affiliatesOptions.find(opt => opt.value === formData.id_affiliate)) ? formData.id_affiliate : "none"}
                onValueChange={(value) => {
                  console.log('🤝 ClientEdit: Afiliado seleccionado por usuario:', value);
                  handleChange('id_affiliate', value);
                }}
                disabled={affiliatesLoading}
              >
                <Select.Trigger>
                  <Select.Value 
                    placeholder={
                      affiliatesLoading ? "Cargando afiliados..." : 
                      "Seleccionar afiliado (opcional)"
                    } 
                  />
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

          {/* Estados y Configuración */}
          <div className="flex flex-col gap-y-6">
            <h2 className="font-sans font-medium txt-compact-large-plus">Estados y Configuración</h2>

            {/* Estados principales */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div className="flex items-center justify-between p-4 bg-ui-bg-field border border-ui-border-base rounded-lg">
                <Label htmlFor="active" className="font-sans txt-compact-small-plus cursor-pointer">
                  Cliente Activo
                </Label>
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => handleChange('active', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-ui-bg-field border border-ui-border-base rounded-lg">
                <Label htmlFor="level" className="font-sans txt-compact-small-plus cursor-pointer">
                  Nivel Especial
                </Label>
                <Switch
                  id="level"
                  checked={formData.level}
                  onCheckedChange={(checked) => handleChange('level', checked)}
                />
              </div>
            </div>

            {/* Estados de comunicaciones */}
            <div className="grid grid-cols-3 gap-x-4 gap-y-4">
              <div className="flex items-center justify-between p-4 bg-ui-bg-field border border-ui-border-base rounded-lg">
                <Label htmlFor="privacy" className="font-sans txt-compact-small-plus cursor-pointer">
                  Privacidad
                </Label>
                <Switch
                  id="privacy"
                  checked={formData.privacy}
                  onCheckedChange={(checked) => handleChange('privacy', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-ui-bg-field border border-ui-border-base rounded-lg">
                <Label htmlFor="advertising" className="font-sans txt-compact-small-plus cursor-pointer">
                  Publicidad
                </Label>
                <Switch
                  id="advertising"
                  checked={formData.advertising}
                  onCheckedChange={(checked) => handleChange('advertising', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-ui-bg-field border border-ui-border-base rounded-lg">
                <Label htmlFor="send" className="font-sans txt-compact-small-plus cursor-pointer">
                  Enviar Comunicaciones
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
              disabled={isLoading || !hasChanges}
              className="min-w-[120px]"
            >
              {isLoading ? "Guardando..." : "Guardar Cambios"}
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
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
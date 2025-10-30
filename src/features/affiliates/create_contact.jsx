// src/features/affiliates/create_contact.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Input, Label } from "@medusajs/ui";
import { ArrowLeft } from "@medusajs/icons";
import { useSelector } from "react-redux";
import { hasPermission } from "../../utils/permissions.js";
import { useAffiliateQuery, useCreateContactMutation } from "../../hooks/queries/useAffiliates.js";

export default function AffiliateCreateContact() {
  const navigate = useNavigate();
  const { id } = useParams(); // ID del afiliado

  // Obtener usuario y verificar permisos
  const { user } = useSelector((state) => state.auth);
  const canCreate = hasPermission(user, ['all', 'affiliates']);

  // Estados del formulario
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    mobile: "",
    position: "",
    type_biz: "",
    address: "",
    zipcode: "",
    city: "",
    state: "",
    country: "",
    lat: "",
    lng: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Query para obtener los datos del afiliado
  const {
    data: affiliate,
    isLoading: isLoadingAffiliate,
  } = useAffiliateQuery(id);

  // Hook de mutación
  const createContactMutation = useCreateContactMutation({
    onSuccess: (createdContact) => {
      console.log('✅ CreateContact: Contacto creado exitosamente:', createdContact);
      navigate(`/affiliates/${id}`);
    },
    onError: (error) => {
      console.error('❌ CreateContact: Error al crear contacto:', error);
      setErrors({ submit: error.message });
      setIsLoading(false);
    }
  });

  // Verificar permisos al montar el componente
  useEffect(() => {
    if (!canCreate) {
      console.warn('🚫 Usuario no tiene permisos para crear contactos');
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

    if (!formData.email?.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El email debe tener un formato válido";
    }

    if (!formData.type_biz?.trim()) {
      newErrors.type_biz = "El tipo de negocio es requerido";
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

    if (!formData.mobile?.trim()) {
      newErrors.mobile = "El móvil es requerido";
    }

    if (!formData.lat?.trim()) {
      newErrors.lat = "La latitud es requerida";
    }

    if (!formData.lng?.trim()) {
      newErrors.lng = "La longitud es requerida";
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
        id_affiliate: id,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || null,
        mobile: formData.mobile.trim(),
        position: formData.position?.trim() || null,
        type_biz: formData.type_biz.trim(),
        address: formData.address.trim(),
        zipcode: formData.zipcode.trim(),
        city: formData.city.trim(),
        state: formData.state?.trim() || null,
        country: formData.country?.trim() || null,
        lat: formData.lat.trim(),
        lng: formData.lng.trim(),
      };

      console.log('📦 CreateContact: Enviando datos:', dataToSubmit);

      await createContactMutation.mutateAsync({ 
        affiliateId: id, 
        data: dataToSubmit 
      });
    } catch (error) {
      console.error('❌ CreateContact: Error en handleSubmit:', error);
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
            <h1 className="font-sans font-medium h2-core">Agregar Contacto</h1>
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
            {/* Información del Contacto */}
            <div className="bg-ui-bg-base shadow rounded-lg p-6">
              <h2 className="font-sans font-medium txt-large mb-6">
                Información del Contacto
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
                    placeholder="Nombre del contacto"
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

                {/* Teléfono y Móvil */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="mb-2 block">
                      Teléfono
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="+34 123 456 789"
                    />
                  </div>

                  <div>
                    <Label htmlFor="mobile" className="mb-2 block">
                      Móvil <span className="text-ui-fg-error">*</span>
                    </Label>
                    <Input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      value={formData.mobile}
                      onChange={(e) => handleChange('mobile', e.target.value)}
                      placeholder="+34 600 123 456"
                      className={errors.mobile ? 'border-ui-fg-error' : ''}
                    />
                    {errors.mobile && (
                      <p className="text-ui-fg-error txt-compact-xsmall mt-1">
                        {errors.mobile}
                      </p>
                    )}
                  </div>
                </div>

                {/* Cargo */}
                <div>
                  <Label htmlFor="position" className="mb-2 block">
                    Cargo
                  </Label>
                  <Input
                    id="position"
                    name="position"
                    type="text"
                    value={formData.position}
                    onChange={(e) => handleChange('position', e.target.value)}
                    placeholder="Gerente de ventas, Director, etc."
                  />
                </div>
              </div>
            </div>

            {/* Información del Negocio */}
            <div className="bg-ui-bg-base shadow rounded-lg p-6">
              <h2 className="font-sans font-medium txt-large mb-6">
                Información del Negocio
              </h2>

              <div className="space-y-6">
                {/* Tipo de Negocio */}
                <div>
                  <Label htmlFor="type_biz" className="mb-2 block">
                    Tipo de Negocio <span className="text-ui-fg-error">*</span>
                  </Label>
                  <Input
                    id="type_biz"
                    name="type_biz"
                    type="text"
                    value={formData.type_biz}
                    onChange={(e) => handleChange('type_biz', e.target.value)}
                    placeholder="Tienda, Oficina, Almacén, etc."
                    className={errors.type_biz ? 'border-ui-fg-error' : ''}
                  />
                  {errors.type_biz && (
                    <p className="text-ui-fg-error txt-compact-xsmall mt-1">
                      {errors.type_biz}
                    </p>
                  )}
                </div>

                {/* Dirección */}
                <div>
                  <Label htmlFor="address" className="mb-2 block">
                    Dirección <span className="text-ui-fg-error">*</span>
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Calle, número, piso, etc."
                    className={errors.address ? 'border-ui-fg-error' : ''}
                  />
                  {errors.address && (
                    <p className="text-ui-fg-error txt-compact-xsmall mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>

                {/* Código Postal y Ciudad */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zipcode" className="mb-2 block">
                      Código Postal <span className="text-ui-fg-error">*</span>
                    </Label>
                    <Input
                      id="zipcode"
                      name="zipcode"
                      type="text"
                      value={formData.zipcode}
                      onChange={(e) => handleChange('zipcode', e.target.value)}
                      placeholder="28001"
                      className={errors.zipcode ? 'border-ui-fg-error' : ''}
                    />
                    {errors.zipcode && (
                      <p className="text-ui-fg-error txt-compact-xsmall mt-1">
                        {errors.zipcode}
                      </p>
                    )}
                  </div>

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
                      placeholder="Madrid"
                      className={errors.city ? 'border-ui-fg-error' : ''}
                    />
                    {errors.city && (
                      <p className="text-ui-fg-error txt-compact-xsmall mt-1">
                        {errors.city}
                      </p>
                    )}
                  </div>
                </div>

                {/* Estado/Provincia y País */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="state" className="mb-2 block">
                      Estado/Provincia
                    </Label>
                    <Input
                      id="state"
                      name="state"
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleChange('state', e.target.value)}
                      placeholder="Comunidad de Madrid"
                    />
                  </div>

                  <div>
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

                {/* Coordenadas (Latitud y Longitud) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lat" className="mb-2 block">
                      Latitud <span className="text-ui-fg-error">*</span>
                    </Label>
                    <Input
                      id="lat"
                      name="lat"
                      type="text"
                      value={formData.lat}
                      onChange={(e) => handleChange('lat', e.target.value)}
                      placeholder="40.416775"
                      className={errors.lat ? 'border-ui-fg-error' : ''}
                    />
                    {errors.lat && (
                      <p className="text-ui-fg-error txt-compact-xsmall mt-1">
                        {errors.lat}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="lng" className="mb-2 block">
                      Longitud <span className="text-ui-fg-error">*</span>
                    </Label>
                    <Input
                      id="lng"
                      name="lng"
                      type="text"
                      value={formData.lng}
                      onChange={(e) => handleChange('lng', e.target.value)}
                      placeholder="-3.703790"
                      className={errors.lng ? 'border-ui-fg-error' : ''}
                    />
                    {errors.lng && (
                      <p className="text-ui-fg-error txt-compact-xsmall mt-1">
                        {errors.lng}
                      </p>
                    )}
                  </div>
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
          {isLoading ? 'Creando...' : 'Agregar Contacto'}
        </Button>
      </div>
    </div>
  );
}

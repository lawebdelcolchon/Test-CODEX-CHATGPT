// src/features/admin_accounts/create.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Textarea, Label, Switch, Select } from "@medusajs/ui";
import { ArrowLeft } from "@medusajs/icons";
import { useSelector } from "react-redux";
import { hasPermission } from "../../utils/permissions.js";
import { useCreateAdminAccountMutation } from "../../hooks/queries/useAdminAccounts.js";
import { useStoresSelect } from "../../hooks/useStoresSelect.js";

// Tipos de cuenta disponibles
const ACCOUNT_TYPES = [
  { value: "user", label: "Usuario", admin: false, super_admin: false },
  { value: "admin", label: "Administrador", admin: true, super_admin: false },
  { value: "super_admin", label: "Super Administrador", admin: true, super_admin: true },
];

export default function AdminAccountCreate() {
  const navigate = useNavigate();
  
  // Obtener usuario y verificar permisos
  const { user } = useSelector((state) => state.auth);
  const canCreate = hasPermission(user, ['all', 'admin_accounts']);

  // Estados del formulario
  const [formData, setFormData] = useState({
    name: "",
    user: "",
    email: "",
    id_store: "",
    password: "",
    confirmPassword: "",
    admin: true,
    super_admin: false,
    active: true,
  });

  // Hook para obtener las tiendas
  const { storesOptions, isLoading: isLoadingStores } = useStoresSelect();

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Hook de mutación
  const createAdminAccountMutation = useCreateAdminAccountMutation({
    onSuccess: (createdAccount) => {
      console.log('✅ AdminAccountCreate: Cuenta creada exitosamente:', createdAccount);
      navigate('/admin-accounts');
    },
    onError: (error) => {
      console.error('❌ AdminAccountCreate: Error al crear cuenta:', error);
      
      let errorMessage = error.message;
      
      // Manejar error específico de email duplicado
      if (error.message && error.message.includes('email') && error.message.includes('uso')) {
        errorMessage = 'El email que intentas usar ya está asignado a otro administrador. ' +
                      'Puedes dejarlo vacío o usar un email diferente.';
      }
      
      // Manejar error específico de usuario duplicado
      if (error.message && error.message.includes('user') && error.message.includes('uso')) {
        errorMessage = 'El nombre de usuario ya está en uso. Debe ser único para cada administrador.';
      }
      
      setErrors({ submit: errorMessage });
      setIsLoading(false);
    }
  });

  // Verificar permisos al montar el componente
  useEffect(() => {
    if (!canCreate) {
      console.warn('🚫 Usuario no tiene permisos para crear cuentas de administrador');
      navigate('/admin-accounts', { replace: true });
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

  // Manejar cambio de tipo de cuenta
  const handleAccountTypeChange = (accountType) => {
    const selectedType = ACCOUNT_TYPES.find(t => t.value === accountType);
    if (selectedType) {
      setFormData(prev => ({
        ...prev,
        admin: selectedType.admin,
        super_admin: selectedType.super_admin
      }));
    }
  };

  // Validación del formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    // El campo 'user' es el principal para el login - debe ser único y requerido
    if (!formData.user?.trim()) {
      newErrors.user = "El nombre de usuario es requerido para el login";
    } else if (formData.user.length < 3) {
      newErrors.user = "El nombre de usuario debe tener al menos 3 caracteres";
    }

    if (!formData.id_store) {
      newErrors.id_store = "La tienda es requerida";
    }

    // El email es opcional según las reglas de negocio (pueden estar duplicados)
    if (formData.email?.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Si proporcionas un email, debe tener un formato válido";
    }

    if (!formData.password?.trim()) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (!formData.confirmPassword?.trim()) {
      newErrors.confirmPassword = "Confirmar contraseña es requerido";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
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

    console.log('📤 AdminAccountCreate: Creando cuenta con datos:', formData);

    // Preparar los datos para envío (sin confirmPassword)
    const { confirmPassword, ...dataToSend } = formData;
    
    // Si no hay email (es opcional), no enviarlo
    if (!formData.email?.trim()) {
      console.log('📤 AdminAccountCreate: Email vacío, eliminando del envío');
      delete dataToSend.email;
    }
    
    console.log('📤 AdminAccountCreate: Datos finales a enviar:', dataToSend);

    try {
      await createAdminAccountMutation.mutateAsync(dataToSend);
    } catch (error) {
      // El error ya se maneja en onError del hook
      console.error('❌ AdminAccountCreate: Error en handleSubmit:', error);
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
            <h1 className="font-sans font-medium h1-core">Nuevo Administrador</h1>
            <p className="txt-compact-small text-ui-fg-subtle">
              Crear una nueva cuenta de administrador en el sistema
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="name" className="font-sans txt-compact-small-plus">
                  Nombre Completo *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Nombre completo del administrador"
                  className={errors.name ? "border-ui-border-error" : ""}
                />
                {errors.name && (
                  <span className="text-ui-fg-error txt-compact-xsmall">{errors.name}</span>
                )}
              </div>

              {/* Usuario */}
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="user" className="font-sans txt-compact-small-plus">
                  Usuario de Acceso *
                </Label>
                <Input
                  id="user"
                  value={formData.user}
                  onChange={(e) => handleChange('user', e.target.value)}
                  placeholder="usuario_login"
                  className={errors.user ? "border-ui-border-error" : ""}
                />
                <p className="text-xs text-ui-fg-muted">
                  Se usará para iniciar sesión en el sistema
                </p>
                {errors.user && (
                  <span className="text-ui-fg-error txt-compact-xsmall">{errors.user}</span>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="email" className="font-sans txt-compact-small-plus">
                  Email (opcional)
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="correo@ejemplo.com (opcional)"
                  className={errors.email ? "border-ui-border-error" : ""}
                />
                <p className="text-xs text-ui-fg-muted">
                  Solo para contacto - puede estar duplicado entre administradores
                </p>
                {errors.email && (
                  <span className="text-ui-fg-error txt-compact-xsmall">{errors.email}</span>
                )}
              </div>

              {/* Tienda */}
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="id_store" className="font-sans txt-compact-small-plus">
                  Tienda *
                </Label>
                <Select 
                  value={formData.id_store} 
                  onValueChange={(value) => handleChange('id_store', value)}
                  disabled={isLoadingStores}
                >
                  <Select.Trigger>
                    <Select.Value placeholder={isLoadingStores ? "Cargando tiendas..." : "Seleccionar tienda"} />
                  </Select.Trigger>
                  <Select.Content>
                    {storesOptions.map((store) => (
                      <Select.Item key={store.value} value={store.value}>
                        {store.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
                {errors.id_store && (
                  <span className="text-ui-fg-error txt-compact-xsmall">{errors.id_store}</span>
                )}
              </div>
            </div>
          </div>

          {/* Contraseña */}
          <div className="flex flex-col gap-y-6">
            <h2 className="font-sans font-medium txt-compact-large-plus">Contraseña</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                />
                {errors.password && (
                  <span className="text-ui-fg-error txt-compact-xsmall">{errors.password}</span>
                )}
              </div>

              {/* Confirmar Contraseña */}
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="confirmPassword" className="font-sans txt-compact-small-plus">
                  Confirmar Contraseña *
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="Repetir contraseña"
                  className={errors.confirmPassword ? "border-ui-border-error" : ""}
                />
                {errors.confirmPassword && (
                  <span className="text-ui-fg-error txt-compact-xsmall">{errors.confirmPassword}</span>
                )}
              </div>
            </div>
          </div>

          {/* Tipo de Cuenta */}
          <div className="flex flex-col gap-y-6">
            <h2 className="font-sans font-medium txt-compact-large-plus">Tipo de Cuenta</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ACCOUNT_TYPES.map((accountType) => (
                <div 
                  key={accountType.value} 
                  className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                    formData.admin === accountType.admin && formData.super_admin === accountType.super_admin
                      ? 'border-ui-border-interactive bg-ui-bg-subtle'
                      : 'border-ui-border-base hover:bg-ui-bg-subtle-hover'
                  }`}
                  onClick={() => handleAccountTypeChange(accountType.value)}
                >
                  <div>
                    <p className="font-sans txt-compact-medium-plus">{accountType.label}</p>
                    <p className="font-sans txt-compact-small text-ui-fg-subtle">
                      {accountType.value === 'user' && 'Usuario sin permisos administrativos'}
                      {accountType.value === 'admin' && 'Administrador con permisos limitados'}
                      {accountType.value === 'super_admin' && 'Administrador con permisos completos'}
                    </p>
                  </div>
                  <input
                    type="radio"
                    name="accountType"
                    value={accountType.value}
                    checked={formData.admin === accountType.admin && formData.super_admin === accountType.super_admin}
                    onChange={() => handleAccountTypeChange(accountType.value)}
                    className="h-4 w-4"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Estado */}
          <div className="flex flex-col gap-y-6">
            <h2 className="font-sans font-medium txt-compact-large-plus">Estado</h2>
            
            <div className="flex items-center justify-between p-4 border border-ui-border-base rounded-lg">
              <div>
                <p className="font-sans txt-compact-medium-plus">Cuenta Activa</p>
                <p className="font-sans txt-compact-small text-ui-fg-subtle">
                  Determina si la cuenta está activa en el sistema
                </p>
              </div>
              <Switch
                checked={formData.active}
                onCheckedChange={(checked) => handleChange('active', checked)}
              />
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
              {isLoading ? "Creando..." : "Crear Administrador"}
            </Button>
            
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/admin-accounts')}
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
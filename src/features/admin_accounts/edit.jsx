// src/features/admin_accounts/edit.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Input, Textarea, Label, Switch, Select } from "@medusajs/ui";
import { ArrowLeft } from "@medusajs/icons";
import { useSelector } from "react-redux";
import { hasPermission } from "../../utils/permissions.js";
import {
  useAdminAccountQuery,
  useUpdateAdminAccountMutation,
  useChangePasswordMutation,
} from "../../hooks/queries/useAdminAccounts.js";
import { useStoresSelect } from "../../hooks/useStoresSelect.js";

// Tipos de cuenta disponibles
const ACCOUNT_TYPES = [
  { value: "user", label: "Usuario", admin: false, super_admin: false },
  { value: "admin", label: "Administrador", admin: true, super_admin: false },
  { value: "super_admin", label: "Super Administrador", admin: true, super_admin: true },
];

export default function AdminAccountEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Obtener usuario y verificar permisos
  const { user } = useSelector((state) => state.auth);
  const canEdit = hasPermission(user, ['all', 'admin_accounts']);

  // Estados del formulario
  const [formData, setFormData] = useState({
    name: "",
    user: "",
    email: "",
    id_store: "",
    admin: true,
    super_admin: false,
    active: true,
  });

  // Hook para obtener las tiendas
  const { storesOptions, isLoading: isLoadingStores } = useStoresSelect();

  // Estados para cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
    showPasswordSection: false,
  });

  const [errors, setErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // Usar TanStack Query para obtener datos
  const {
    data: adminAccount,
    isLoading: isAdminAccountLoading,
    error: adminAccountError,
  } = useAdminAccountQuery(id);

  // Hook de mutación para actualizar datos
  const updateAdminAccountMutation = useUpdateAdminAccountMutation({
    onSuccess: (updatedAccount) => {
      console.log('✅ AdminAccountEdit: Cuenta actualizada exitosamente:', updatedAccount);
      // Marcar que acabamos de editar para forzar refetch en la página de detalle
      sessionStorage.setItem('admin_account_just_edited', id);
      navigate(`/admin-accounts/${id}`);
    },
    onError: (error) => {
      console.error('❌ AdminAccountEdit: Error al actualizar cuenta:', error);
      
      let errorMessage = error.message;
      
      // Manejar error específico de email duplicado
      if (error.message && error.message.includes('email') && error.message.includes('uso')) {
        errorMessage = 'El email que intentas usar ya está asignado a otro administrador. ' +
                      'Según las reglas de negocio, puedes dejar el email actual o usar uno diferente.';
      }
      
      setErrors({ submit: errorMessage });
      setIsLoading(false);
    }
  });

  // Hook de mutación para cambiar contraseña
  const changePasswordMutation = useChangePasswordMutation({
    onSuccess: () => {
      console.log('✅ AdminAccountEdit: Contraseña cambiada exitosamente');
      setPasswordData({
        newPassword: "",
        confirmPassword: "",
        showPasswordSection: false,
      });
      setPasswordErrors({});
      setIsPasswordLoading(false);
      alert('Contraseña actualizada exitosamente');
    },
    onError: (error) => {
      console.error('❌ AdminAccountEdit: Error al cambiar contraseña:', error);
      setPasswordErrors({ submit: error.message });
      setIsPasswordLoading(false);
    }
  });

  // Verificar permisos al montar el componente
  useEffect(() => {
    if (!canEdit) {
      console.warn('🚫 Usuario no tiene permisos para editar cuentas de administrador');
      navigate('/admin-accounts', { replace: true });
    }
  }, [canEdit, navigate]);

  // Cargar datos de la cuenta en el formulario cuando se obtengan
  useEffect(() => {
    if (adminAccount && adminAccount.id) {
      console.log('📥 AdminAccountEdit: Cargando datos de la cuenta:', adminAccount);
      console.log('📥 AdminAccountEdit: Tienda asignada:', { id_store: adminAccount.id_store, store: adminAccount.store });
      
      const storeId = adminAccount.id_store ? adminAccount.id_store.toString() : "";
      console.log('📥 AdminAccountEdit: Configurando id_store como string:', storeId);
      
      setFormData(prevFormData => {
        // Solo actualizar si los datos son diferentes para evitar loops
        if (prevFormData.name !== (adminAccount.name || "") || 
            prevFormData.id_store !== storeId) {
          console.log('📥 AdminAccountEdit: Actualizando formData desde adminAccount');
          return {
            name: adminAccount.name || "",
            user: adminAccount.user || "",
            email: adminAccount.email || "",
            id_store: storeId,
            admin: adminAccount.admin ?? true,
            super_admin: adminAccount.super_admin ?? false,
            active: adminAccount.active ?? true,
          };
        }
        console.log('📥 AdminAccountEdit: FormData no necesita actualización');
        return prevFormData;
      });
    }
  }, [adminAccount?.id, adminAccount?.name, adminAccount?.id_store, adminAccount?.user, adminAccount?.email, adminAccount?.admin, adminAccount?.super_admin, adminAccount?.active]);

  // Sincronizar select cuando se cargan las tiendas y hay adminAccount
  useEffect(() => {
    if (adminAccount && adminAccount.id_store && storesOptions.length > 0 && !formData.id_store) {
      console.log('🔄 AdminAccountEdit: Sincronizando id_store cuando las tiendas están listas');
      const storeId = adminAccount.id_store.toString();
      const storeExists = storesOptions.find(store => store.value === storeId);
      
      if (storeExists) {
        console.log('🔄 AdminAccountEdit: Tienda encontrada, asignando:', storeId);
        setFormData(prev => ({
          ...prev,
          id_store: storeId
        }));
      } else {
        console.warn('⚠️ AdminAccountEdit: Tienda no encontrada en opciones:', storeId);
      }
    }
  }, [adminAccount?.id_store, storesOptions.length, formData.id_store]);

  // Debug del select - verificar que el valor coincida con las opciones
  useEffect(() => {
    if (storesOptions.length > 0) {
      const selectedStore = storesOptions.find(store => store.value === formData.id_store);
      console.log('🏪 AdminAccountEdit: Debug del select de tiendas:', {
        formDataIdStore: formData.id_store,
        formDataIdStoreType: typeof formData.id_store,
        storesOptionsCount: storesOptions.length,
        selectedStore: selectedStore,
        firstStoreOption: storesOptions[0],
        allStoreValues: storesOptions.map(s => s.value),
        hasMatch: !!selectedStore
      });
      
      // Si no hay coincidencia y tenemos un id_store, puede ser un problema de formato
      if (formData.id_store && !selectedStore && storesOptions.length > 0) {
        console.warn('⚠️ AdminAccountEdit: No se encontró coincidencia para id_store:', formData.id_store);
        console.warn('⚠️ AdminAccountEdit: Valores de tiendas disponibles:', storesOptions.map(s => s.value));
      }
    }
  }, [storesOptions, formData.id_store]);

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

  // Manejar cambios en la sección de contraseña
  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({
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

  // Obtener el tipo de cuenta actual
  const getCurrentAccountType = () => {
    return ACCOUNT_TYPES.find(type => 
      type.admin === formData.admin && type.super_admin === formData.super_admin
    )?.value || "user";
  };

  // Validación del formulario principal
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

    return newErrors;
  };

  // Validación del formulario de contraseña
  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordData.newPassword?.trim()) {
      newErrors.newPassword = "La nueva contraseña es requerida";
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = "La contraseña debe tener al menos 6 caracteres";
    }

    if (!passwordData.confirmPassword?.trim()) {
      newErrors.confirmPassword = "Confirmar contraseña es requerido";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    return newErrors;
  };

  // Manejar envío del formulario principal
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    console.log('📤 AdminAccountEdit: Actualizando cuenta con datos:', formData);
    
    // Preparar datos para envío
    const dataToSend = { ...formData };
    
    // Si el email no ha cambiado, no enviarlo para evitar validación de único
    if (adminAccount && adminAccount.email === formData.email) {
      console.log('📤 AdminAccountEdit: Email sin cambios, eliminando del envío');
      delete dataToSend.email;
    }
    
    // Si no hay email (es opcional), no enviarlo
    if (!formData.email?.trim()) {
      console.log('📤 AdminAccountEdit: Email vacío, eliminando del envío');
      delete dataToSend.email;
    }
    
    console.log('📤 AdminAccountEdit: Datos finales a enviar:', dataToSend);

    try {
      await updateAdminAccountMutation.mutateAsync({
        id: parseInt(id),
        data: dataToSend
      });
    } catch (error) {
      // El error ya se maneja en onError del hook
      console.error('❌ AdminAccountEdit: Error en handleSubmit:', error);
    }
  };

  // Manejar cambio de contraseña
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validatePasswordForm();
    if (Object.keys(validationErrors).length > 0) {
      setPasswordErrors(validationErrors);
      return;
    }

    setIsPasswordLoading(true);
    setPasswordErrors({});

    console.log('🔐 AdminAccountEdit: Cambiando contraseña');

    try {
      await changePasswordMutation.mutateAsync({
        id: parseInt(id),
        newPassword: passwordData.newPassword
      });
    } catch (error) {
      // El error ya se maneja en onError del hook
      console.error('❌ AdminAccountEdit: Error en handlePasswordSubmit:', error);
    }
  };

  // Mostrar loading mientras se cargan los datos
  if (isAdminAccountLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-ui-fg-subtle">Cargando datos de la cuenta...</div>
      </div>
    );
  }

  // Mostrar error si hay problemas cargando los datos
  if (adminAccountError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-ui-fg-on-color-bg">Error al cargar la cuenta</div>
        <div className="text-ui-fg-subtle text-center">
          {adminAccountError.message || "Ocurrió un error inesperado"}
        </div>
        <button 
          onClick={() => navigate('/admin-accounts')}
          className="px-4 py-2 bg-ui-bg-base border border-ui-border-base rounded-md hover:bg-ui-bg-subtle"
        >
          Volver a Administradores
        </button>
      </div>
    );
  }

  // Mostrar "no encontrado" si no hay datos
  if (!adminAccount) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-ui-fg-on-color-bg">Cuenta no encontrada</div>
        <div className="text-ui-fg-subtle text-center">
          No se encontró una cuenta de administrador con el ID: {id}
        </div>
        <button 
          onClick={() => navigate('/admin-accounts')}
          className="px-4 py-2 bg-ui-bg-base border border-ui-border-base rounded-md hover:bg-ui-bg-subtle"
        >
          Volver a Administradores
        </button>
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
            <h1 className="font-sans font-medium h1-core">Editar Administrador</h1>
            <p className="txt-compact-small text-ui-fg-subtle">
              Modificar la información de la cuenta de administrador
            </p>
          </div>
        </div>
      </div>

      {/* Formulario Principal */}
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
                  Se usa para iniciar sesión en el sistema
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

          {/* Tipo de Cuenta */}
          <div className="flex flex-col gap-y-6">
            <h2 className="font-sans font-medium txt-compact-large-plus">Tipo de Cuenta</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ACCOUNT_TYPES.map((accountType) => {
                const isSelected = formData.admin === accountType.admin && formData.super_admin === accountType.super_admin;
                return (
                  <div 
                    key={accountType.value} 
                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                      isSelected
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
                      checked={isSelected}
                      onChange={() => handleAccountTypeChange(accountType.value)}
                      className="h-4 w-4"
                    />
                  </div>
                );
              })}
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
              {isLoading ? "Actualizando..." : "Actualizar Administrador"}
            </Button>
            
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(`/admin-accounts/${id}`)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>

      {/* Sección de Cambio de Contraseña */}
      <div className="bg-ui-bg-base border border-ui-border-base rounded-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-sans font-medium txt-compact-large-plus">Cambiar Contraseña</h2>
            <p className="txt-compact-small text-ui-fg-subtle">
              Actualizar la contraseña de la cuenta
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => handlePasswordChange('showPasswordSection', !passwordData.showPasswordSection)}
          >
            {passwordData.showPasswordSection ? "Ocultar" : "Cambiar Contraseña"}
          </Button>
        </div>

        {passwordData.showPasswordSection && (
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nueva Contraseña */}
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="newPassword" className="font-sans txt-compact-small-plus">
                  Nueva Contraseña *
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className={passwordErrors.newPassword ? "border-ui-border-error" : ""}
                />
                {passwordErrors.newPassword && (
                  <span className="text-ui-fg-error txt-compact-xsmall">{passwordErrors.newPassword}</span>
                )}
              </div>

              {/* Confirmar Nueva Contraseña */}
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="confirmPassword" className="font-sans txt-compact-small-plus">
                  Confirmar Contraseña *
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  placeholder="Repetir nueva contraseña"
                  className={passwordErrors.confirmPassword ? "border-ui-border-error" : ""}
                />
                {passwordErrors.confirmPassword && (
                  <span className="text-ui-fg-error txt-compact-xsmall">{passwordErrors.confirmPassword}</span>
                )}
              </div>
            </div>

            {/* Error de contraseña */}
            {passwordErrors.submit && (
              <div className="bg-ui-bg-error border border-ui-border-error rounded-lg p-4">
                <p className="text-ui-fg-error txt-compact-small">{passwordErrors.submit}</p>
              </div>
            )}

            {/* Botones de contraseña */}
            <div className="flex items-center gap-x-4">
              <Button
                type="submit"
                isLoading={isPasswordLoading}
                disabled={isPasswordLoading}
                className="min-w-[120px]"
              >
                {isPasswordLoading ? "Cambiando..." : "Cambiar Contraseña"}
              </Button>
              
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setPasswordData({
                    newPassword: "",
                    confirmPassword: "",
                    showPasswordSection: false,
                  });
                  setPasswordErrors({});
                }}
                disabled={isPasswordLoading}
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
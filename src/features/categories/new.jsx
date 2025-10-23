// src/features/categories/new.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, FocusModal, Textarea, Switch, toast } from "@medusajs/ui";
import { XMarkMini } from "@medusajs/icons";
import genericApi from "../../services/genericApi.js";
import { hasPermission } from "../../utils/permissions.js";
import { useSelector } from "react-redux";

export default function New() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Servicio API genérico (instancia compartida)
  const apiService = genericApi;

  // Obtener usuario y verificar permisos
  const { user } = useSelector((state) => state.auth);
  const canCreate = hasPermission(user, ['all', 'categories']);

  // Verificar permisos al cargar el componente
  useEffect(() => {
    if (!canCreate) {
      console.warn('🚫 Usuario no tiene permisos para crear categorías');
      navigate('/categories', { replace: true });
    }
  }, [canCreate, navigate]);

  const [formData, setFormData] = useState({
    name: "",
    meta_keywords: "",
    meta_description: "",
    parent: null,
    position: 0,
    visible: true,
    active: true
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'position' || name === 'parent') ? (value === '' ? null : parseInt(value)) : value
    }));
  };

  const handleSwitchChange = (name, checked) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verificar permisos antes de proceder
    if (!canCreate) {
      console.warn('🚫 Usuario no tiene permisos para crear categorías');
      toast.error('No tienes permisos para crear categorías');
      return;
    }

    // Evitar envíos duplicados
    if (isLoading) return;

    try {
      setIsLoading(true);

      // Preparar datos para enviar a la API
      const categoryData = {
        name: formData.name.trim(),
        meta_keywords: formData.meta_keywords?.trim() || null,
        meta_description: formData.meta_description?.trim() || null,
        parent: formData.parent || null,
        position: formData.position || 0,
        visible: Boolean(formData.visible),
        active: Boolean(formData.active)
      };

      console.log('✨ Creating category:', categoryData);

      // Llamar a la API para crear la categoría
      const newCategory = await apiService.create('categories', categoryData);

      console.log('✅ Category created successfully:', newCategory);

      // Mostrar mensaje de éxito
      toast.success('Categoría creada exitosamente');

      // Cerrar modal y navegar a la nueva categoría
      setIsOpen(false);
      setTimeout(() => {
        // Si la API devuelve el ID de la nueva categoría, navegar a ella
        if (newCategory && newCategory.id) {
          navigate(`/categories/${newCategory.id}`, { replace: true });
        } else {
          // Si no hay ID, navegar de vuelta a la lista
          navigate("/categories", { replace: true });
        }
      }, 100);

    } catch (error) {
      console.error('❌ Error creating category:', error);

      // Mostrar mensaje de error específico
      if (error.validationErrors) {
        // Errores de validación del servidor
        const errorMessages = Object.values(error.validationErrors)
          .flat()
          .join(', ');
        toast.error(`Error de validación: ${errorMessages}`);
      } else if (error.message) {
        // Error genérico con mensaje
        toast.error(error.message);
      } else {
        // Error genérico
        toast.error('Error al crear la categoría. Intenta de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    handleClose();
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      navigate("/categories", { replace: true });
    }, 100);
  };

  return (
    <FocusModal open={isOpen} onOpenChange={setIsOpen}>
      <FocusModal.Content>
        <form className="flex flex-1 flex-col overflow-hidden" onSubmit={handleSubmit}>
          {/* Header */}
          <div className="border-ui-border-base flex items-center justify-between gap-x-4 border-b px-4 py-2">
            <div className="flex items-center gap-x-2">
              <Button
                type="button"
                variant="transparent"
                size="small"
                onClick={handleClose}
                className="h-7 w-7 p-1"
              >
                <XMarkMini />
              </Button>
              <kbd className="bg-ui-tag-neutral-bg text-ui-tag-neutral-text border-ui-tag-neutral-border inline-flex h-5 w-fit min-w-[20px] items-center justify-center rounded-md border px-1 txt-compact-xsmall-plus">
                esc
              </kbd>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col items-center overflow-y-auto py-16">
            <div className="flex w-full max-w-[720px] flex-col gap-y-8">
              {/* Title */}
              <div>
                <h1 className="font-sans font-medium h1-core">Crear Categoría</h1>
                <p className="font-normal font-sans txt-small text-ui-fg-subtle">
                  Crea una nueva categoría para organizar productos.
                </p>
              </div>

              {/* Form Fields */}
              <div className="flex flex-col gap-y-6">
                {/* Name */}
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-x-1">
                    <label
                      className="font-sans txt-compact-small font-medium"
                      htmlFor="name"
                    >
                      Nombre de Categoría
                    </label>
                  </div>
                  <div className="relative">
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="caret-ui-fg-base bg-ui-bg-field hover:bg-ui-bg-field-hover shadow-borders-base placeholder-ui-fg-muted text-ui-fg-base transition-fg relative w-full appearance-none rounded-md outline-none focus-visible:shadow-borders-interactive-with-active txt-compact-small h-8 px-2 py-1.5"
                      placeholder="Ejemplo: Colchones"
                      required
                      autoComplete="off"
                    />
                  </div>
                </div>

                {/* Grid for two-column layout */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Meta Keywords */}
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center gap-x-1">
                      <label
                        className="font-sans txt-compact-small font-medium"
                        htmlFor="meta_keywords"
                      >
                        Meta Keywords
                      </label>
                      <p className="font-normal font-sans txt-compact-small text-ui-fg-muted">
                        (Opcional)
                      </p>
                    </div>
                    <div className="relative">
                      <Input
                        id="meta_keywords"
                        name="meta_keywords"
                        type="text"
                        value={formData.meta_keywords}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className="caret-ui-fg-base bg-ui-bg-field hover:bg-ui-bg-field-hover shadow-borders-base placeholder-ui-fg-muted text-ui-fg-base transition-fg relative w-full appearance-none rounded-md outline-none focus-visible:shadow-borders-interactive-with-active txt-compact-small h-8 px-2 py-1.5"
                        placeholder="palabras, clave, separadas, por, comas"
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  {/* Position */}
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center gap-x-1">
                      <label
                        className="font-sans txt-compact-small font-medium"
                        htmlFor="position"
                      >
                        Posición
                      </label>
                      <p className="font-normal font-sans txt-compact-small text-ui-fg-muted">
                        (Opcional)
                      </p>
                    </div>
                    <div className="relative">
                      <Input
                        id="position"
                        name="position"
                        type="number"
                        value={formData.position || ''}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className="caret-ui-fg-base bg-ui-bg-field hover:bg-ui-bg-field-hover shadow-borders-base placeholder-ui-fg-muted text-ui-fg-base transition-fg relative w-full appearance-none rounded-md outline-none focus-visible:shadow-borders-interactive-with-active txt-compact-small h-8 px-2 py-1.5"
                        placeholder="0"
                        min="0"
                        autoComplete="off"
                      />
                    </div>
                  </div>
                </div>

                {/* Meta Description */}
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-x-1">
                    <label
                      className="font-sans txt-compact-small font-medium"
                      htmlFor="meta_description"
                    >
                      Meta Description
                    </label>
                    <p className="font-normal font-sans txt-compact-small text-ui-fg-muted">
                      (Opcional)
                    </p>
                  </div>
                  <div className="relative">
                    <Textarea
                      id="meta_description"
                      name="meta_description"
                      value={formData.meta_description}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="caret-ui-fg-base bg-ui-bg-field hover:bg-ui-bg-field-hover shadow-borders-base placeholder-ui-fg-muted text-ui-fg-base transition-fg relative w-full appearance-none rounded-md outline-none focus-visible:shadow-borders-interactive-with-active txt-compact-small px-2 py-1.5 min-h-[80px]"
                      placeholder="Descripción para motores de búsqueda"
                    />
                  </div>
                </div>

                {/* Parent Category */}
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-x-1">
                    <label
                      className="font-sans txt-compact-small font-medium"
                      htmlFor="parent"
                    >
                      Categoría Padre
                    </label>
                    <p className="font-normal font-sans txt-compact-small text-ui-fg-muted">
                      (Opcional - Dejar vacío para categoría raíz)
                    </p>
                  </div>
                  <div className="relative">
                    <Input
                      id="parent"
                      name="parent"
                      type="number"
                      value={formData.parent || ''}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="caret-ui-fg-base bg-ui-bg-field hover:bg-ui-bg-field-hover shadow-borders-base placeholder-ui-fg-muted text-ui-fg-base transition-fg relative w-full appearance-none rounded-md outline-none focus-visible:shadow-borders-interactive-with-active txt-compact-small h-8 px-2 py-1.5"
                      placeholder="ID de la categoría padre"
                      min="1"
                      autoComplete="off"
                    />
                  </div>
                </div>

                {/* Boolean Switches */}
                <div className="flex flex-col gap-y-4">
                  <h3 className="font-sans txt-compact-small font-medium text-ui-fg-base">
                    Configuración
                  </h3>

                  {/* Visible */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <label className="font-sans txt-compact-small font-medium text-ui-fg-base">
                        Visible
                      </label>
                      <p className="font-normal font-sans txt-compact-small text-ui-fg-muted">
                        La categoría aparecerá en el sitio web
                      </p>
                    </div>
                    <Switch
                      checked={formData.visible}
                      onCheckedChange={(checked) => handleSwitchChange('visible', checked)}
                      disabled={isLoading}
                    />
                  </div>

                  {/* Active */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <label className="font-sans txt-compact-small font-medium text-ui-fg-base">
                        Activo
                      </label>
                      <p className="font-normal font-sans txt-compact-small text-ui-fg-muted">
                        La categoría está habilitada para uso
                      </p>
                    </div>
                    <Switch
                      checked={formData.active}
                      onCheckedChange={(checked) => handleSwitchChange('active', checked)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-ui-border-base flex items-center justify-end gap-x-2 border-t p-4">
            <div className="flex items-center justify-end gap-x-2">
              <Button
                type="button"
                variant="secondary"
                size="small"
                onClick={handleCancel}
                disabled={isLoading}
                className="txt-compact-small-plus gap-x-1.5 px-2 py-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="small"
                disabled={isLoading || !formData.name.trim()}
                className="shadow-buttons-inverted text-ui-contrast-fg-primary bg-ui-button-inverted txt-compact-small-plus gap-x-1.5 px-2 py-1"
              >
                {isLoading ? 'Creando...' : 'Crear'}
              </Button>
            </div>
          </div>
        </form>
      </FocusModal.Content>
    </FocusModal>
  );
}

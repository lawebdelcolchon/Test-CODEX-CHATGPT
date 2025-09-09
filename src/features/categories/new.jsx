// src/features/categories/new.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, FocusModal, Textarea, Switch } from "@medusajs/ui";
import { XMarkMini } from "@medusajs/icons";
import categoriesData from "../../mocks/categories.json";

export default function New() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Creating category:", formData);
    // Aquí iría la lógica para crear la categoría
    // Por ahora solo cerramos el modal y navegamos de vuelta
    handleClose();
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
                className="txt-compact-small-plus gap-x-1.5 px-2 py-1"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                variant="primary" 
                size="small"
                className="shadow-buttons-inverted text-ui-contrast-fg-primary bg-ui-button-inverted txt-compact-small-plus gap-x-1.5 px-2 py-1"
              >
                Crear
              </Button>
            </div>
          </div>
        </form>
      </FocusModal.Content>
    </FocusModal>
  );
}

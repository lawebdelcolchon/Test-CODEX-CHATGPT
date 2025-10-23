// src/features/options/new.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, FocusModal, Textarea, Switch } from "@medusajs/ui";
import { XMarkMini } from "@medusajs/icons";

export default function New() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  
  const [formData, setFormData] = useState({
    name: "",
    utilities: "",
    caption: "",
    observations: "",
    id_category: null,
    position: 0,
    active: true
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              (name === 'position' || name === 'id_category') ? 
              (value === '' ? null : parseInt(value)) : value
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
    console.log("Creating option:", formData);
    // Aquí iría la lógica para crear la opción
    // Por ahora solo cerramos el modal y navegamos de vuelta
    handleClose();
  };

  const handleCancel = () => {
    handleClose();
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      navigate("/options", { replace: true });
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
                <h1 className="font-sans font-medium h1-core">Crear Opción</h1>
                <p className="font-normal font-sans txt-small text-ui-fg-subtle">
                  Crea una nueva opción para personalizar productos.
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
                      Nombre de la Opción
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
                      placeholder="Ejemplo: Color botones"
                      required
                      autoComplete="off"
                    />
                  </div>
                </div>

                {/* Utilities */}
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-x-1">
                    <label 
                      className="font-sans txt-compact-small font-medium" 
                      htmlFor="utilities"
                    >
                      Utilidades
                    </label>
                    <p className="font-normal font-sans txt-compact-small text-ui-fg-muted">
                      (Opcional)
                    </p>
                  </div>
                  <div className="relative">
                    <Input
                      id="utilities"
                      name="utilities"
                      type="text"
                      value={formData.utilities}
                      onChange={handleInputChange}
                      className="caret-ui-fg-base bg-ui-bg-field hover:bg-ui-bg-field-hover shadow-borders-base placeholder-ui-fg-muted text-ui-fg-base transition-fg relative w-full appearance-none rounded-md outline-none focus-visible:shadow-borders-interactive-with-active txt-compact-small h-8 px-2 py-1.5"
                      placeholder="Ejemplo: Cabeceros y Baules - Mayorga"
                      autoComplete="off"
                    />
                  </div>
                </div>

                {/* Grid for two-column layout */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Caption */}
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center gap-x-1">
                      <label 
                        className="font-sans txt-compact-small font-medium" 
                        htmlFor="caption"
                      >
                        Caption
                      </label>
                      <p className="font-normal font-sans txt-compact-small text-ui-fg-muted">
                        (Opcional)
                      </p>
                    </div>
                    <div className="relative">
                      <Input
                        id="caption"
                        name="caption"
                        type="text"
                        value={formData.caption}
                        onChange={handleInputChange}
                        className="caret-ui-fg-base bg-ui-bg-field hover:bg-ui-bg-field-hover shadow-borders-base placeholder-ui-fg-muted text-ui-fg-base transition-fg relative w-full appearance-none rounded-md outline-none focus-visible:shadow-borders-interactive-with-active txt-compact-small h-8 px-2 py-1.5"
                        placeholder="Elija su color"
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

                {/* ID Category */}
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-x-1">
                    <label 
                      className="font-sans txt-compact-small font-medium" 
                      htmlFor="id_category"
                    >
                      ID Categoría
                    </label>
                    <p className="font-normal font-sans txt-compact-small text-ui-fg-muted">
                      (Opcional)
                    </p>
                  </div>
                  <div className="relative">
                    <Input
                      id="id_category"
                      name="id_category"
                      type="number"
                      value={formData.id_category || ''}
                      onChange={handleInputChange}
                      className="caret-ui-fg-base bg-ui-bg-field hover:bg-ui-bg-field-hover shadow-borders-base placeholder-ui-fg-muted text-ui-fg-base transition-fg relative w-full appearance-none rounded-md outline-none focus-visible:shadow-borders-interactive-with-active txt-compact-small h-8 px-2 py-1.5"
                      placeholder="ID de la categoría asociada"
                      min="1"
                      autoComplete="off"
                    />
                  </div>
                </div>

                {/* Observations */}
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-x-1">
                    <label 
                      className="font-sans txt-compact-small font-medium" 
                      htmlFor="observations"
                    >
                      Observaciones
                    </label>
                    <p className="font-normal font-sans txt-compact-small text-ui-fg-muted">
                      (Opcional)
                    </p>
                  </div>
                  <div className="relative">
                    <Textarea
                      id="observations"
                      name="observations"
                      value={formData.observations}
                      onChange={handleInputChange}
                      className="caret-ui-fg-base bg-ui-bg-field hover:bg-ui-bg-field-hover shadow-borders-base placeholder-ui-fg-muted text-ui-fg-base transition-fg relative w-full appearance-none rounded-md outline-none focus-visible:shadow-borders-interactive-with-active txt-compact-small px-2 py-1.5 min-h-[80px]"
                      placeholder="Utilizado en:&#10;*Productos específicos&#10;*Detalles de uso..."
                    />
                  </div>
                </div>

                {/* Boolean Switches */}
                <div className="flex flex-col gap-y-4">
                  <h3 className="font-sans txt-compact-small font-medium text-ui-fg-base">
                    Configuración
                  </h3>
                  
                  {/* Active */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <label className="font-sans txt-compact-small font-medium text-ui-fg-base">
                        Activo
                      </label>
                      <p className="font-normal font-sans txt-compact-small text-ui-fg-muted">
                        La opción está habilitada para uso
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

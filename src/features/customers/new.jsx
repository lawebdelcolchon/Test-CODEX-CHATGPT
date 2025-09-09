// src/features/customers/new.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, FocusModal } from "@medusajs/ui";
import { XMarkMini } from "@medusajs/icons";

export default function New() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    company_name: "",
    phone: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Creating customer:", formData);
    // Aquí iría la lógica para crear el cliente
    // Por ahora solo cerramos el modal y navegamos de vuelta
    handleClose();
  };

  const handleCancel = () => {
    handleClose();
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      navigate("/customers", { replace: true });
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
                <h1 className="font-sans font-medium h1-core">Crear Cliente</h1>
                <p className="font-normal font-sans txt-small text-ui-fg-subtle">
                  Crea un nuevo cliente y administra sus detalles.
                </p>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* First Name */}
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-x-1">
                    <label 
                      className="font-sans txt-compact-small font-medium" 
                      htmlFor="first_name"
                    >
                      Nombre
                    </label>
                    <p className="font-normal font-sans txt-compact-small text-ui-fg-muted">
                      (Opcional)
                    </p>
                  </div>
                  <div className="relative">
                    <Input
                      id="first_name"
                      name="first_name"
                      type="text"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className="caret-ui-fg-base bg-ui-bg-field hover:bg-ui-bg-field-hover shadow-borders-base placeholder-ui-fg-muted text-ui-fg-base transition-fg relative w-full appearance-none rounded-md outline-none focus-visible:shadow-borders-interactive-with-active txt-compact-small h-8 px-2 py-1.5"
                      autoComplete="off"
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-x-1">
                    <label 
                      className="font-sans txt-compact-small font-medium" 
                      htmlFor="last_name"
                    >
                      Apellido
                    </label>
                    <p className="font-normal font-sans txt-compact-small text-ui-fg-muted">
                      (Opcional)
                    </p>
                  </div>
                  <div className="relative">
                    <Input
                      id="last_name"
                      name="last_name"
                      type="text"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className="caret-ui-fg-base bg-ui-bg-field hover:bg-ui-bg-field-hover shadow-borders-base placeholder-ui-fg-muted text-ui-fg-base transition-fg relative w-full appearance-none rounded-md outline-none focus-visible:shadow-borders-interactive-with-active txt-compact-small h-8 px-2 py-1.5"
                      autoComplete="off"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-x-1">
                    <label 
                      className="font-sans txt-compact-small font-medium" 
                      htmlFor="email"
                    >
                      Correo electrónico
                    </label>
                  </div>
                  <div className="relative">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="caret-ui-fg-base bg-ui-bg-field hover:bg-ui-bg-field-hover shadow-borders-base placeholder-ui-fg-muted text-ui-fg-base transition-fg relative w-full appearance-none rounded-md outline-none focus-visible:shadow-borders-interactive-with-active txt-compact-small h-8 px-2 py-1.5"
                      autoComplete="off"
                      required
                    />
                  </div>
                </div>

                {/* Company */}
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-x-1">
                    <label 
                      className="font-sans txt-compact-small font-medium" 
                      htmlFor="company_name"
                    >
                      Compañía
                    </label>
                    <p className="font-normal font-sans txt-compact-small text-ui-fg-muted">
                      (Opcional)
                    </p>
                  </div>
                  <div className="relative">
                    <Input
                      id="company_name"
                      name="company_name"
                      type="text"
                      value={formData.company_name}
                      onChange={handleInputChange}
                      className="caret-ui-fg-base bg-ui-bg-field hover:bg-ui-bg-field-hover shadow-borders-base placeholder-ui-fg-muted text-ui-fg-base transition-fg relative w-full appearance-none rounded-md outline-none focus-visible:shadow-borders-interactive-with-active txt-compact-small h-8 px-2 py-1.5"
                      autoComplete="off"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-x-1">
                    <label 
                      className="font-sans txt-compact-small font-medium" 
                      htmlFor="phone"
                    >
                      Teléfono
                    </label>
                    <p className="font-normal font-sans txt-compact-small text-ui-fg-muted">
                      (Opcional)
                    </p>
                  </div>
                  <div className="relative">
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="caret-ui-fg-base bg-ui-bg-field hover:bg-ui-bg-field-hover shadow-borders-base placeholder-ui-fg-muted text-ui-fg-base transition-fg relative w-full appearance-none rounded-md outline-none focus-visible:shadow-borders-interactive-with-active txt-compact-small h-8 px-2 py-1.5"
                      autoComplete="off"
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

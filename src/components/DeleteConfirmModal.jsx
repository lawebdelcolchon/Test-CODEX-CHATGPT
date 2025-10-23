// src/components/DeleteConfirmModal.jsx
import React, { useEffect } from "react";
import { Button } from "@medusajs/ui";

export default function DeleteConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  entityName = "elemento",
  entityValue = "",
  verificationField = "name"
}) {
  // Función helper para determinar el artículo correcto
  const getArticleAndEntity = (entity) => {
    const lowerEntity = entity.toLowerCase();
    
    // Si ya incluye artículo, devolverlo tal como está
    if (lowerEntity.includes('el ') || lowerEntity.includes('la ') || lowerEntity.includes('los ') || lowerEntity.includes('las ')) {
      return lowerEntity;
    }
    
    // Mapeo específico para entidades comunes
    const entityMap = {
      'producto': 'el producto',
      'categoria': 'la categoría',
      'categoría': 'la categoría',
      'cliente': 'el cliente',
      'usuario': 'el usuario',
      'pedido': 'el pedido',
      'orden': 'la orden',
      'factura': 'la factura',
      'elemento': 'el elemento',
      'item': 'el item'
    };
    
    // Si existe mapeo específico, usarlo
    if (entityMap[lowerEntity]) {
      return entityMap[lowerEntity];
    }
    
    // Regla general: si termina en 'a', usar 'la', de lo contrario 'el'
    return lowerEntity.endsWith('a') ? `la ${lowerEntity}` : `el ${lowerEntity}`;
  };
  // Manejar tecla ESC para cerrar el modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Bloquear scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onCancel}
    >
      <div 
        className="bg-ui-bg-base shadow-elevation-modal border-ui-border-base w-full max-w-md rounded-lg border outline-none m-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-col gap-y-3 p-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ui-bg-error">
              <svg className="h-6 w-6 text-ui-fg-error" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
          </div>
          
          {/* Title and Message */}
          <div className="text-center">
            <h3 className="font-sans font-medium h3-core text-ui-fg-base mb-2">
              ¿Eliminar {entityName}?
            </h3>
            <p className="text-ui-fg-subtle txt-compact-medium">
              Estás a punto de eliminar {getArticleAndEntity(entityName)} <strong>"{entityValue}"</strong>.
            </p>
            <p className="text-ui-fg-subtle txt-compact-medium mt-1">
              Esta acción no puede deshacerse.
            </p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-center gap-x-3 p-6 pt-0">
          <Button 
            type="button" 
            variant="secondary" 
            size="small"
            onClick={onCancel}
            className="txt-compact-small-plus gap-x-1.5 px-4 py-2 min-w-[80px]"
          >
            Cancelar
          </Button>
          <Button 
            type="button"
            variant="danger"
            size="small"
            onClick={onConfirm}
            className="shadow-buttons-danger bg-ui-button-danger hover:bg-ui-button-danger-hover active:bg-ui-button-danger-pressed focus-visible:shadow-buttons-danger-focus txt-compact-small-plus gap-x-1.5 px-4 py-2 min-w-[80px]"
          >
            Sí, eliminar
          </Button>
        </div>
      </div>
    </div>
  );
}
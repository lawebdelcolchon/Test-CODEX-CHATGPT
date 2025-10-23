// src/components/CategoryViewModal.jsx
import React from 'react';
import { Button, Badge } from '@medusajs/ui';
import { XMarkMini } from '@medusajs/icons';

export default function CategoryViewModal({ isOpen, onClose, category }) {
  if (!isOpen || !category) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div 
        className="bg-ui-bg-base shadow-elevation-modal border-ui-border-base w-full max-w-2xl rounded-lg border outline-none m-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-ui-border-base flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-x-3">
            <h1 className="font-sans font-medium h1-core">{category.name}</h1>
            <Badge
              variant={category.active ? "default" : "secondary"}
              size="small"
              className="txt-compact-xsmall-plus bg-ui-bg-subtle text-ui-fg-subtle border-ui-border-base box-border flex w-fit select-none items-center overflow-hidden rounded-md border pl-0 pr-1 leading-none"
            >
              <div className="flex items-center justify-center w-5 h-[18px] [&_div]:w-2 [&_div]:h-2 [&_div]:rounded-sm [&_div]:bg-ui-tag-green-icon">
                <div></div>
              </div>
              {category.active ? "Activo" : "Inactivo"}
            </Badge>
          </div>
          <Button 
            type="button" 
            variant="transparent" 
            size="small" 
            onClick={onClose}
            className="h-7 w-7 p-1"
          >
            <XMarkMini />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">ID</p>
              <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle">#{category.id}</p>
            </div>
            <div>
              <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Posición</p>
              <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle">{category.position || "-"}</p>
            </div>
            <div>
              <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Visible</p>
              <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle">{category.visible ? "Sí" : "No"}</p>
            </div>
            <div>
              <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Categoría Padre</p>
              <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle">{category.parent ? `#${category.parent}` : "Raíz"}</p>
            </div>
          </div>

          {/* SEO Information */}
          <div className="space-y-4">
            <h3 className="font-sans font-medium txt-compact-medium text-ui-fg-base">Información SEO</h3>
            <div>
              <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Meta Keywords</p>
              <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle">
                {category.meta_keywords || "No se han definido keywords"}
              </p>
            </div>
            <div>
              <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Meta Description</p>
              <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle">
                {category.meta_description || "No se ha definido una descripción"}
              </p>
            </div>
          </div>

          {/* Attributes Information */}
          <div className="space-y-4">
            <h3 className="font-sans font-medium txt-compact-medium text-ui-fg-base">Atributos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Atributo Primario</p>
                <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle">
                  {category.id_attribute_first ? `ID: ${category.id_attribute_first}` : "No asignado"}
                </p>
              </div>
              <div>
                <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Atributo Secundario</p>
                <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle">
                  {category.id_attribute_second ? `ID: ${category.id_attribute_second}` : "No asignado"}
                </p>
              </div>
            </div>
          </div>

          {/* Tree Structure */}
          {category.tree && (
            <div>
              <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Estructura Jerárquica</p>
              <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle font-mono text-xs bg-ui-bg-subtle p-2 rounded">
                {category.tree}
              </p>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-ui-fg-muted">
            {category.created_at && (
              <div>
                <p className="font-medium">Creado:</p>
                <p>{new Date(category.created_at).toLocaleString('es-ES')}</p>
              </div>
            )}
            {category.updated_at && (
              <div>
                <p className="font-medium">Actualizado:</p>
                <p>{new Date(category.updated_at).toLocaleString('es-ES')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-ui-border-base flex items-center justify-end gap-x-2 border-t p-4">
          <Button 
            type="button" 
            variant="secondary" 
            size="small"
            onClick={onClose}
            className="txt-compact-small-plus gap-x-1.5 px-4 py-2"
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}

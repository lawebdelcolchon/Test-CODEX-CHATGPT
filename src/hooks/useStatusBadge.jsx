import React from 'react';

/**
 * Hook personalizado para generar badges de estado
 * @param {boolean} isActive - Estado activo/inactivo
 * @param {string} label - Texto a mostrar en el badge
 * @returns {JSX.Element} Componente StatusBadge
 */
export const useStatusBadge = (isActive, label) => {
  // Colores del indicador (solo para el pequeño círculo de estado)
  const indicatorColors = {
    active: "bg-ui-tag-green-icon",
    inactive: "bg-ui-tag-red-icon",
    pending: "bg-ui-tag-orange-icon",
    blocked: "bg-ui-tag-red-icon",
  };

  const StatusBadge = React.useMemo(() => (
    <div className="txt-compact-small text-ui-fg-subtle flex h-full items-center gap-x-2">
      <div role="presentation" className="flex h-5 w-2 items-center justify-center">
        <div
          className={`h-2 w-2 rounded-sm shadow-[0px_0px_0px_1px_rgba(0,0,0,0.12)_inset] ${
            isActive ? indicatorColors.active : indicatorColors.inactive
          }`}
        ></div>
      </div>
      <span className="truncate">{label}</span>
    </div>
  ), [isActive, label]);

  return StatusBadge;
};

import React, { useState, useRef, useEffect } from "react";

// Componente StatusBadge
function StatusBadge({ isActive, label }) {
  return (
    <div className="txt-compact-small text-ui-fg-subtle flex h-full w-full items-center gap-x-2 overflow-hidden">
      <div role="presentation" className="flex h-5 w-2 items-center justify-center">
        <div className={`h-2 w-2 rounded-sm shadow-[0px_0px_0px_1px_rgba(0,0,0,0.12)_inset] ${
          isActive ? 'bg-ui-tag-green-icon' : 'bg-ui-tag-red-icon'
        }`}></div>
      </div>
      <span className="truncate">{label}</span>
    </div>
  );
}

// Componente de dropdown de acciones
function CategoryActions({ category, onEdit, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="transition-fg inline-flex items-center justify-center overflow-hidden rounded-md outline-none disabled:bg-ui-bg-disabled disabled:shadow-buttons-neutral disabled:text-ui-fg-disabled text-ui-fg-subtle bg-ui-button-transparent hover:bg-ui-button-transparent-hover active:bg-ui-button-transparent-pressed focus-visible:shadow-buttons-neutral-focus focus-visible:bg-ui-bg-base disabled:!bg-transparent disabled:!shadow-none h-7 w-7 p-1"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none">
          <path fill="currentColor" fillRule="evenodd" d="M6.306 7.5a1.194 1.194 0 1 1 2.389 0 1.194 1.194 0 0 1-2.39 0M1.194 7.5a1.194 1.194 0 1 1 2.39 0 1.194 1.194 0 0 1-2.39 0M11.417 7.5a1.194 1.194 0 1 1 2.389 0 1.194 1.194 0 0 1-2.39 0" clipRule="evenodd"></path>
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[120px] overflow-hidden rounded-md bg-ui-bg-base shadow-elevation-flyout border border-ui-border-base">
          <div className="p-1">
            <button
              onClick={() => {
                onEdit(category);
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-x-2 rounded-sm px-2 py-1.5 text-left text-ui-fg-base hover:bg-ui-bg-base-hover txt-compact-small transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m10.5 3.75-6.75 6.75L2.25 12l1.5-1.5L10.5 3.75zm0 0L12 2.25a1.5 1.5 0 0 1 2.12 2.12L12.75 5.25"></path>
              </svg>
              Editar
            </button>
            <button
              onClick={() => {
                onDelete(category);
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-x-2 rounded-sm px-2 py-1.5 text-left text-ui-fg-error hover:bg-ui-bg-base-hover txt-compact-small transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5.25 3.75V3a1.5 1.5 0 0 1 1.5-1.5h1.5A1.5 1.5 0 0 1 9.75 3v.75m3 0v9a1.5 1.5 0 0 1-1.5 1.5h-6a1.5 1.5 0 0 1-1.5-1.5v-9m3 0V6m0 3v3"></path>
              </svg>
              Eliminar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Hook para organizar categorías en jerarquía
function useCategoryHierarchy(categories) {
  const organizeCategories = (categories) => {
    // Separar categorías padre e hijas
    const parents = categories.filter(cat => !cat.parent_category_id);
    const children = categories.filter(cat => cat.parent_category_id);
    
    // Crear un mapa de hijos por padre
    const childrenByParent = children.reduce((acc, child) => {
      if (!acc[child.parent_category_id]) {
        acc[child.parent_category_id] = [];
      }
      acc[child.parent_category_id].push(child);
      return acc;
    }, {});
    
    // Ordenar hijos por rank
    Object.keys(childrenByParent).forEach(parentId => {
      childrenByParent[parentId].sort((a, b) => a.rank - b.rank);
    });
    
    // Crear estructura jerárquica con información de agrupación
    const hierarchical = [];
    
    parents.sort((a, b) => a.rank - b.rank).forEach(parent => {
      const hasChildren = childrenByParent[parent.id]?.length > 0;
      hierarchical.push({
        ...parent,
        isParent: hasChildren,
        children: childrenByParent[parent.id] || []
      });
    });
    
    return hierarchical;
  };
  
  return organizeCategories(categories);
}

export default function CategoryTable({ categories = [], onEdit, onDelete }) {
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const hierarchicalCategories = useCategoryHierarchy(categories);
  
  const toggleExpanded = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };
  
  const renderTableRows = () => {
    const rows = [];
    
    hierarchicalCategories.forEach((category) => {
      // Renderizar fila padre
      const isExpanded = expandedCategories.has(category.id);
      const hasChildren = category.isParent;
      
      rows.push(
        <tr 
          key={category.id}
          className="bg-ui-bg-base hover:bg-ui-bg-base-hover border-ui-border-base transition-fg border-b [&_td:last-child]:pr-6 [&_th:last-child]:pr-6 [&_td:first-child]:pl-6 [&_th:first-child]:pl-6 transition-fg group/row group relative [&_td:last-of-type]:w-[1%] [&_td:last-of-type]:whitespace-nowrap has-[[data-row-link]:focus-visible]:bg-ui-bg-base-hover cursor-pointer"
          data-selected="false"
        >
          {/* Columna Nombre */}
          <td className="h-12 py-0 pl-0 pr-6 !pl-0 !pr-0 bg-ui-bg-base group-data-[selected=true]/row:bg-ui-bg-highlight group-data-[selected=true]/row:group-hover/row:bg-ui-bg-highlight-hover group-hover/row:bg-ui-bg-base-hover transition-fg group-has-[[data-row-link]:focus-visible]:bg-ui-bg-base-hover sticky left-0 after:absolute after:inset-y-0 after:right-0 after:h-full after:w-px after:bg-transparent after:content-['']">
            <a className="size-full outline-none" data-row-link="true" tabIndex="0" href={`/categories/${category.id}`}>
              <div className="flex size-full items-center pr-6 pl-6">
                <div className="flex size-full items-center gap-x-3 overflow-hidden">
                  <div className="flex size-7 items-center justify-center">
                    {hasChildren && (
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleExpanded(category.id);
                        }}
                        className="transition-fg inline-flex items-center justify-center overflow-hidden rounded-md outline-none disabled:bg-ui-bg-disabled disabled:shadow-buttons-neutral disabled:text-ui-fg-disabled bg-ui-button-transparent hover:bg-ui-button-transparent-hover active:bg-ui-button-transparent-pressed focus-visible:shadow-buttons-neutral-focus focus-visible:bg-ui-bg-base disabled:!bg-transparent disabled:!shadow-none h-7 w-7 p-1 text-ui-fg-subtle"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="15" 
                          height="15" 
                          fill="none" 
                          className={`${isExpanded ? 'rotate-90' : ''} transition-transform will-change-transform`}
                        >
                          <path fill="currentColor" d="M5 4.91c0-.163.037-.323.108-.464a.85.85 0 0 1 .293-.334A.7.7 0 0 1 5.798 4a.7.7 0 0 1 .39.142l3.454 2.59c.11.082.2.195.263.33a1.04 1.04 0 0 1 0 .876.9.9 0 0 1-.263.33l-3.455 2.59a.7.7 0 0 1-.39.141.7.7 0 0 1-.396-.111.85.85 0 0 1-.293-.335c-.07-.14-.108-.3-.108-.464z"></path>
                        </svg>
                      </button>
                    )}
                  </div>
                  <span className="truncate">{category.name}</span>
                </div>
              </div>
            </a>
          </td>
          
          {/* Columna Manejo */}
          <td className="h-12 py-0 pl-0 pr-6 !pl-0 !pr-0">
            <a className="size-full outline-none" data-row-link="true" tabIndex="-1" href={`/categories/${category.id}`}>
              <div className="flex size-full items-center pr-6">
                <div className="flex h-full w-full items-center gap-x-3 overflow-hidden justify-start text-start" style={{maxWidth: '220px'}}>
                  <span className="truncate">/{category.handle}</span>
                </div>
              </div>
            </a>
          </td>
          
          {/* Columna Estado */}
          <td className="h-12 py-0 pl-0 pr-6 !pl-0 !pr-0">
            <a className="size-full outline-none" data-row-link="true" tabIndex="-1" href={`/categories/${category.id}`}>
              <div className="flex size-full items-center pr-6">
                <StatusBadge 
                  isActive={category.is_active} 
                  label={category.is_active ? 'Activa' : 'Inactiva'} 
                />
              </div>
            </a>
          </td>
          
          {/* Columna Visibilidad */}
          <td className="h-12 py-0 pl-0 pr-6 !pl-0 !pr-0">
            <a className="size-full outline-none" data-row-link="true" tabIndex="-1" href={`/categories/${category.id}`}>
              <div className="flex size-full items-center pr-6">
                <StatusBadge 
                  isActive={!category.is_internal} 
                  label={category.is_internal ? 'Privada' : 'Pública'} 
                />
              </div>
            </a>
          </td>
          
          {/* Columna Acciones */}
          <td className="h-12 py-0 pl-0 pr-6 !pl-0 !pr-0">
            
              <div className="flex size-full items-center pr-6">
                <CategoryActions
                  category={category}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </div>
            
          </td>
        </tr>
      );
      
      // Renderizar filas hijas si están expandidas
      if (hasChildren && isExpanded) {
        category.children.forEach((child) => {
          rows.push(
            <tr 
              key={child.id}
              className="border-ui-border-base transition-fg border-b [&_td:last-child]:pr-6 [&_th:last-child]:pr-6 [&_td:first-child]:pl-6 [&_th:first-child]:pl-6 transition-fg group/row group relative [&_td:last-of-type]:w-[1%] [&_td:last-of-type]:whitespace-nowrap has-[[data-row-link]:focus-visible]:bg-ui-bg-base-hover bg-ui-bg-subtle hover:bg-ui-bg-subtle-hover cursor-pointer"
              data-selected="false"
            >
              {/* Columna Nombre con padding adicional */}
              <td 
                className="h-12 py-0 pl-0 pr-6 !pl-0 !pr-0 group-data-[selected=true]/row:bg-ui-bg-highlight group-data-[selected=true]/row:group-hover/row:bg-ui-bg-highlight-hover transition-fg group-has-[[data-row-link]:focus-visible]:bg-ui-bg-base-hover sticky left-0 after:absolute after:inset-y-0 after:right-0 after:h-full after:w-px after:bg-transparent after:content-[''] bg-ui-bg-subtle group-hover/row:bg-ui-bg-subtle-hover"
                style={{paddingLeft: '38px'}}
              >
                <a className="size-full outline-none" data-row-link="true" tabIndex="0" href={`/categories/${child.id}`}>
                  <div className="flex size-full items-center pr-6 pl-6">
                    <div className="flex size-full items-center gap-x-3 overflow-hidden">
                      <div className="flex size-7 items-center justify-center"></div>
                      <span className="truncate">{child.name}</span>
                    </div>
                  </div>
                </a>
              </td>
              
              {/* Columna Manejo */}
              <td className="h-12 py-0 pl-0 pr-6 !pl-0 !pr-0">
                <a className="size-full outline-none" data-row-link="true" tabIndex="-1" href={`/categories/${child.id}`}>
                  <div className="flex size-full items-center pr-6">
                    <div className="flex h-full w-full items-center gap-x-3 overflow-hidden justify-start text-start" style={{maxWidth: '220px'}}>
                      <span className="truncate">/{child.handle}</span>
                    </div>
                  </div>
                </a>
              </td>
              
              {/* Columna Estado */}
              <td className="h-12 py-0 pl-0 pr-6 !pl-0 !pr-0">
                <a className="size-full outline-none" data-row-link="true" tabIndex="-1" href={`/categories/${child.id}`}>
                  <div className="flex size-full items-center pr-6">
                    <StatusBadge 
                      isActive={child.is_active} 
                      label={child.is_active ? 'Activa' : 'Inactiva'} 
                    />
                  </div>
                </a>
              </td>
              
              {/* Columna Visibilidad */}
              <td className="h-12 py-0 pl-0 pr-6 !pl-0 !pr-0">
                <a className="size-full outline-none" data-row-link="true" tabIndex="-1" href={`/categories/${child.id}`}>
                  <div className="flex size-full items-center pr-6">
                    <StatusBadge 
                      isActive={!child.is_internal} 
                      label={child.is_internal ? 'Privada' : 'Pública'} 
                    />
                  </div>
                </a>
              </td>
              
              {/* Columna Acciones */}
              <td className="h-12 py-0 pl-0 pr-6 !pl-0 !pr-0">
                <a className="size-full outline-none" data-row-link="true" tabIndex="-1" href={`/categories/${child.id}`}>
                  <div className="flex size-full items-center pr-6">
                    <CategoryActions
                      category={child}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </div>
                </a>
              </td>
            </tr>
          );
        });
      }
    });
    
    return rows;
  };

  return (
    <div className="flex w-full flex-col overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="text-ui-fg-subtle txt-compact-small relative w-full">
          <thead className="border-ui-border-base txt-compact-small-plus [&_tr]:bg-ui-bg-subtle [&_tr]:hover:bg-ui-bg-subtle border-y border-t-0">
            <tr className="bg-ui-bg-base hover:bg-ui-bg-base-hover border-ui-border-base transition-fg [&_td:last-child]:pr-6 [&_th:last-child]:pr-6 [&_td:first-child]:pl-6 [&_th:first-child]:pl-6 relative border-b-0 [&_th:last-of-type]:w-[1%] [&_th:last-of-type]:whitespace-nowrap">
              <th className="txt-compact-small-plus h-12 py-0 pl-0 pr-6 text-left bg-ui-bg-subtle sticky left-0 after:absolute after:inset-y-0 after:right-0 after:h-full after:w-px after:bg-transparent after:content-['']" data-table-header-id="name" style={{width: '25%'}}>
                <div className="flex h-full w-full items-center justify-start text-start">
                  <span className="truncate">Nombre</span>
                </div>
              </th>
              <th className="txt-compact-small-plus h-12 py-0 pl-0 pr-6 text-left" data-table-header-id="handle" style={{width: '25%'}}>
                <div className="flex h-full w-full items-center justify-start text-start">
                  <span className="truncate">Manejo</span>
                </div>
              </th>
              <th className="txt-compact-small-plus h-12 py-0 pl-0 pr-6 text-left" data-table-header-id="is_active" style={{width: '25%'}}>
                <div className="flex h-full w-full items-center justify-start text-start">
                  <span className="truncate">Estado</span>
                </div>
              </th>
              <th className="txt-compact-small-plus h-12 py-0 pl-0 pr-6 text-left" data-table-header-id="is_internal" style={{width: '25%'}}>
                <div className="flex h-full w-full items-center justify-start text-start">
                  <span className="truncate">Visibilidad</span>
                </div>
              </th>
              <th className="txt-compact-small-plus h-12 py-0 pl-0 pr-6 text-left" data-table-header-id="actions"></th>
            </tr>
          </thead>
          <tbody className="border-ui-border-base border-b-0">
            {renderTableRows()}
          </tbody>
        </table>
      </div>
    </div>
  );
}

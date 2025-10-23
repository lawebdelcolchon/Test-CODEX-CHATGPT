// src/layouts/ContainerLayoutV2.jsx
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../components/Table.jsx";
import Pagination from "../components/Pagination.jsx";
import DeleteConfirmModal from "../components/DeleteConfirmModal.jsx";
import { DropdownMenu, IconButton, Button, Select } from "@medusajs/ui";
import { ArrowUpDown } from "@medusajs/icons";
import { hasPermission } from "../utils/permissions.js";
import { useSelector } from "react-redux";

/**
 * ContainerLayout v2 - Nueva versión que usa TanStack Query
 * Más flexible y escalable que la versión original
 */
export default function ContainerLayoutV2({ 
  // Props de configuración
  resourceName, // Nuevo: nombre del recurso (categories, products, etc.)
  columnsData, 
  orderKeys = [], 
  emptyMessage = "No se encontraron resultados",
  
  // Props de query hooks
  useListQuery, // Hook de query para obtener la lista (ej: useCategoriesQuery)
  useDeleteMutation, // Hook de mutation para eliminar (ej: useDeleteCategoryMutation)
  
  // Props de configuración adicional
  searchEnabled = true,
  filtersEnabled = true,
  defaultPageSize = 10,
  defaultSort = { field: 'created_at', order: 'desc' },
  
  // Props de handlers personalizables
  onNew, // Handler personalizado para el botón "Nuevo" 
  onEdit, // Handler personalizado para el botón "Editar"
  
  // Props de permisos
  requiredPermissions = ['all'],
}) {
  const navigate = useNavigate();
  
  // Función para restaurar el estado guardado
  const restoreListState = () => {
    const savedState = sessionStorage.getItem(`${resourceName}_list_state`);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        console.log(`🔄 ContainerLayoutV2: Restaurando estado guardado para ${resourceName}:`, parsed);
        return {
          q: parsed.search || "",
          currentPage: parsed.page || 1,
          pageSize: parsed.pageSize || defaultPageSize,
          fieldOrder: parsed.sort || defaultSort.field,
          directionOrder: parsed.order || defaultSort.order
        };
      } catch (error) {
        console.warn(`⚠️ ContainerLayoutV2: Error parsing saved state for ${resourceName}:`, error);
      }
    }
    return {
      q: "",
      currentPage: 1,
      pageSize: defaultPageSize,
      fieldOrder: defaultSort.field,
      directionOrder: defaultSort.order
    };
  };
  
  // Estados con valores iniciales desde sessionStorage
  const initialState = restoreListState();
  const [q, setQ] = useState(initialState.q);
  const [currentPage, setCurrentPage] = useState(initialState.currentPage);
  const [pageSize, setPageSize] = useState(initialState.pageSize);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  // Obtener usuario y verificar permisos
  const { user } = useSelector((state) => state.auth);
  const userHasAccess = hasPermission(user, requiredPermissions);
  
  // Obtener las claves de ordenamiento
  const availableOrderKeys = useMemo(() => {
    return orderKeys.length > 0 ? orderKeys : columnsData.map(col => col.label);
  }, [orderKeys, columnsData]);
  
  const [fieldOrder, setFieldOrder] = useState(initialState.fieldOrder || availableOrderKeys[0] || "");
  const [directionOrder, setDirectionOrder] = useState(initialState.directionOrder);
  
  // Limpiar el estado guardado después de restaurarlo (para evitar conflictos en futuras navegaciones)
  useEffect(() => {
    const savedState = sessionStorage.getItem(`${resourceName}_list_state`);
    if (savedState) {
      console.log(`🧹 ContainerLayoutV2: Estado restaurado, limpiando sessionStorage para ${resourceName}`);
      // Limpiar después de un breve delay para asegurar que se haya aplicado
      setTimeout(() => {
        sessionStorage.removeItem(`${resourceName}_list_state`);
      }, 100);
    }
  }, [resourceName]);
  
  // Función auxiliar para guardar el estado actual
  const saveCurrentState = useCallback(() => {
    const currentState = {
      page: currentPage,
      pageSize: pageSize,
      search: q.trim() || undefined,
      sort: fieldOrder,
      order: directionOrder
    };
    sessionStorage.setItem(`${resourceName}_list_state`, JSON.stringify(currentState));
    console.log(`💾 ContainerLayoutV2: Estado guardado para ${resourceName}:`, currentState);
  }, [resourceName, currentPage, pageSize, q, fieldOrder, directionOrder]);

  // Construir filtros y parámetros para la query
  const queryParams = useMemo(() => {
    return {
      page: currentPage,
      pageSize: pageSize,
      sort: fieldOrder,
      order: directionOrder,
      search: q.trim() || undefined,
    };
  }, [currentPage, pageSize, fieldOrder, directionOrder, q]);

  // Usar el hook de query proporcionado
  const { 
    data: queryResult, 
    isLoading, 
    error,
    refetch 
  } = useListQuery(queryParams, {
    enabled: userHasAccess, // Solo ejecutar si tiene permisos
    keepPreviousData: true, // Mantener datos previos durante la carga
  });

  // Usar el hook de mutation para eliminar
  const deleteMutation = useDeleteMutation ? useDeleteMutation({
    onSuccess: () => {
      console.log('✅ Item deleted successfully');
      // La invalidación de queries se maneja automáticamente en el hook
    },
    onError: (error) => {
      console.error('❌ Error deleting item:', error);
      // Aquí podrías mostrar una notificación de error
    }
  }) : null;

  // Extraer datos de la respuesta normalizada
  const items = queryResult?.items || [];
  const pagination = queryResult?.pagination || {
    total: 0,
    page: currentPage,
    pageSize: pageSize,
    totalPages: 1
  };

  // Manejar cambio de página
  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  // Manejar cambio de tamaño de página
  const handlePageSizeChange = useCallback((newPageSize) => {
    console.log('🔄 Changing page size from', pageSize, 'to', newPageSize);
    setPageSize(parseInt(newPageSize));
    setCurrentPage(1); // Reset a página 1 cuando cambia el tamaño
  }, [pageSize]);

  // Handlers de acciones
  const handleView = useCallback((row) => {
    console.log("🔍 handleView ejecutado para:", row);
    
    // Guardar el estado actual antes de navegar
    saveCurrentState();
    
    navigate(`/${resourceName}/${row.id}`);
  }, [navigate, resourceName, saveCurrentState]);
  
  const handleEdit = useCallback((row) => {
    if (onEdit) {
      // Guardar estado antes de usar handler personalizado
      saveCurrentState();
      // Usar handler personalizado si está proporcionado
      onEdit(row);
    } else {
      // Comportamiento por defecto: navegar a la página de edición
      // Guardar el estado actual antes de navegar
      saveCurrentState();
      
      navigate(`/${resourceName}/${row.id}?edit=true`);
    }
  }, [navigate, resourceName, saveCurrentState, onEdit]);
  
  const handleDelete = useCallback(async (row) => {
    console.log("🗑️ handleDelete ejecutado para:", row);
    
    if (deleteMutation) {
      // Abrir modal de confirmación
      setItemToDelete(row);
      setIsDeleteModalOpen(true);
    } else {
      // Fallback - navegar a página de eliminación
      navigate(`/${resourceName}/${row.id}?delete=true`);
    }
  }, [navigate, resourceName, deleteMutation]);
  
  const handleDeleteConfirm = useCallback(async () => {
    if (deleteMutation && itemToDelete) {
      console.log("🗑️ Confirmando eliminación de:", itemToDelete);
      deleteMutation.mutate(itemToDelete.id);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  }, [deleteMutation, itemToDelete]);
  
  const handleDeleteCancel = useCallback(() => {
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  }, []);
  
  const handleNew = useCallback(() => {
    if (onNew) {
      // Guardar estado antes de usar handler personalizado
      saveCurrentState();
      // Usar handler personalizado si está proporcionado
      onNew();
    } else {
      // Comportamiento por defecto: navegar a la página de creación
      // Guardar el estado actual antes de navegar
      saveCurrentState();
      navigate(`/${resourceName}/create`);
    }
  }, [navigate, resourceName, saveCurrentState, onNew]);

  // Manejar búsqueda
  const handleSearchChange = useCallback((e) => {
    setQ(e.target.value);
    setCurrentPage(1); // Reset a página 1 cuando se busca
  }, []);

  // Manejar cambio de ordenamiento
  const handleSortChange = useCallback((field, direction) => {
    setFieldOrder(field);
    setDirectionOrder(direction);
    setCurrentPage(1); // Reset a página 1 cuando cambia orden
  }, []);

  // Componente de filtros
  function FilterDropdown() {
    if (!filtersEnabled) return null;
    
    return (
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button variant="secondary" size="small">
            <span className="hidden sm:inline">Agregar filtro</span>
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content side="bottom" align="right">
          <DropdownMenu.Item>Tipo</DropdownMenu.Item>
          <DropdownMenu.Item>Etiqueta</DropdownMenu.Item>
          <DropdownMenu.Item>Estado</DropdownMenu.Item>
          <DropdownMenu.Item>Fecha de creación</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    );
  }

  // Componente de ordenamiento
  function SortDropdown() {
    const [open, setOpen] = useState(false);
    
    return (
      <div className="flex flex-col items-center gap-y-2">
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenu.Trigger asChild>
            <IconButton size="small">
              <ArrowUpDown />
            </IconButton>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content side="bottom" align="left">
            <DropdownMenu.RadioGroup value={fieldOrder} onValueChange={setFieldOrder}>
              {availableOrderKeys.map((key) => (
                <DropdownMenu.RadioItem
                  key={key}
                  value={key}
                  onSelect={(event) => event.preventDefault()}
                >
                  {key}
                </DropdownMenu.RadioItem>
              ))}
            </DropdownMenu.RadioGroup>
            <DropdownMenu.Separator />
            <DropdownMenu.RadioGroup value={directionOrder} onValueChange={setDirectionOrder}>
              {["asc", "desc"].map((direction) => (
                <DropdownMenu.RadioItem
                  key={direction}
                  value={direction}
                  onSelect={(event) => event.preventDefault()}
                >
                  {direction === "asc" ? "Ascendente" : "Descendente"}
                  <DropdownMenu.Hint>{direction === "asc" ? "1 - 30" : "30 - 1"}</DropdownMenu.Hint>
                </DropdownMenu.RadioItem>
              ))}
            </DropdownMenu.RadioGroup>
          </DropdownMenu.Content>
        </DropdownMenu>
      </div>
    );
  }

  // Si no tiene permisos
  if (!userHasAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="mb-4">
          <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m13-9a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Acceso Denegado</h2>
        <p className="text-gray-500 mb-4">No tienes permisos para acceder a este recurso.</p>
        <p className="text-sm text-gray-400">Permisos requeridos: {requiredPermissions.join(', ')}</p>
      </div>
    );
  }

  // Estado de carga
  if (isLoading) {
    return (
      <div className="flex flex-col gap-y-3">
        <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg divide-y p-0">
          <div className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded-t-lg"></div>
            <div className="h-96 bg-gray-100"></div>
          </div>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="flex flex-col gap-y-3">
        <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg divide-y p-0">
          <div className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar los datos</h3>
            <p className="text-gray-600 mb-4">{error.message || 'Ha ocurrido un error inesperado'}</p>
            <Button onClick={() => refetch()} variant="secondary">
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-3">
      <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg divide-y p-0">
        {/* Filtros y búsqueda */}
        <div className="divide-y">
          <div className="flex items-start justify-between gap-x-4 px-2 py-2">
            <div className="w-full max-w-[60%]">
              <div className="max-w-2/3 flex flex-wrap items-center gap-2">
                <FilterDropdown />
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-x-2">
              {/* Input búsqueda */}
              {searchEnabled && (
                <div className="relative">
                  <input
                    type="search"
                    placeholder="Buscar"
                    value={q}
                    onChange={handleSearchChange}
                    className="caret-ui-fg-base bg-ui-bg-field hover:bg-ui-bg-field-hover shadow-borders-base placeholder-ui-fg-muted text-ui-fg-base transition-fg rounded-md outline-none txt-compact-small h-7 px-2 py-1 pl-7"
                  />
                  <div className="text-ui-fg-muted pointer-events-none absolute bottom-0 left-0 flex items-center justify-center h-7 w-7">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.056 13.056 9.53 9.53M6.389 10.833a4.444 4.444 0 1 0 0-8.888 4.444 4.444 0 0 0 0 8.888"/>
                    </svg>
                  </div>
                </div>
              )}

              <SortDropdown />

              {/* Botón crear */}
              <Button
                variant="secondary"
                size="small"
                onClick={handleNew}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" className="mr-1">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 3.333v9.334M3.333 8h9.334"/>
                </svg>
                <span className="hidden sm:inline">Crear</span>
              </Button>
            </div>
          </div>

          {/* Tabla */}
          <div className="flex w-full flex-col overflow-hidden" style={{borderTopWidth: "0px"}}>
            <Table
              columns={columnsData}
              data={items}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
              fieldOrder={fieldOrder}
              directionOrder={directionOrder}
              emptyMessage={emptyMessage}
              requiredPermissions={requiredPermissions}
            />

            {/* Paginación con selector de registros por página */}
            <div className="flex items-center justify-between px-3 py-4">
              {/* Selector de registros por página */}
              <div className="flex items-center gap-x-2">
                <span className="text-ui-fg-subtle txt-compact-small">Mostrar</span>
                <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                  <Select.Trigger className="w-20 h-7">
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="10">10</Select.Item>
                    <Select.Item value="20">20</Select.Item>
                    <Select.Item value="50">50</Select.Item>
                    <Select.Item value="100">100</Select.Item>
                  </Select.Content>
                </Select>
                <span className="text-ui-fg-subtle txt-compact-small">por página</span>
              </div>

              {/* Información de registros y paginación */}
              <div className="flex items-center gap-x-4">
                {/* Info de registros */}
                <span className="text-ui-fg-subtle txt-compact-small">
                  Mostrando {((pagination.page - 1) * pagination.pageSize) + 1} a {Math.min(pagination.page * pagination.pageSize, pagination.total)} de {pagination.total} registros
                </span>

                {/* Navegación de páginas */}
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                  className=""
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal de confirmación de eliminación */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        entityName={resourceName === 'products' ? 'producto' : resourceName === 'categories' ? 'categoría' : 'elemento'}
        entityValue={itemToDelete?.name || itemToDelete?.title || `Item ${itemToDelete?.id}`}
      />
    </div>
  );
}

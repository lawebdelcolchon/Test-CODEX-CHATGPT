// src/layouts/Container.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../components/Table.jsx";
import Pagination from "../components/Pagination.jsx";
import { DropdownMenu, IconButton, Button } from "@medusajs/ui"
import { ArrowUpDown } from "@medusajs/icons"
import { hasPermission } from "../utils/permissions.js";
import { useSelector } from "react-redux";
import { useGenericCRUD } from "../hooks/useGenericCRUD.js";

export default function Container({ entityName, columnsData, orderKeys = [], DataSet = [], reduxState = null, emptyMessage = "No se encontraron resultados" }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  
  // Usar useGenericCRUD si existe entityName, sino usar el método legacy
  const useApiPagination = !!entityName && !reduxState;
  
  // Hook para manejo de CRUD con paginación de API
  const crudData = useGenericCRUD(entityName, {
    autoFetch: useApiPagination
  });
  
  // Estados legacy para compatibilidad con reduxState
  const [legacyData, setLegacyData] = useState([]);
  const [legacyLoading, setLegacyLoading] = useState(true);
  const [legacyCurrentPage, setLegacyCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Obtener usuario y verificar permisos para la entidad actual
  const { user } = useSelector((state) => state.auth);
  const requiredPermissions = entityName === 'categories' ? ['all', 'categories'] : ['all'];
  
  // Obtener las claves de ordenamiento, usando las etiquetas de columnas como fallback
  const availableOrderKeys = useMemo(() => {
    return orderKeys.length > 0 ? orderKeys : columnsData.map(col => col.label);
  }, [orderKeys, columnsData]);
  
  const [fieldOrder, setFieldOrder] = useState(availableOrderKeys[0] || "");
  const [directionOrder, setDirectionOrder] = useState("asc");
  
  // Lógica legacy para compatibilidad con reduxState
  useEffect(() => {
    if (!useApiPagination && reduxState) {
      // Usar datos del estado de Redux (método legacy)
      const { items, status, error } = reduxState;
      
      if (status === 'loading') {
        setLegacyLoading(true);
      } else if (status === 'succeeded') {
        setLegacyData(items || []);
        setLegacyLoading(false);
      } else if (status === 'failed') {
        console.error('Error loading data:', error);
        setLegacyData([]);
        setLegacyLoading(false);
      }
    } else if (!useApiPagination && !reduxState) {
      // Fallback a usar DataSet (para compatibilidad)
      setTimeout(() => {
        setLegacyData(DataSet);
        setLegacyLoading(false);
      }, 500);
    }
  }, [DataSet, reduxState, useApiPagination]);
  
  // Determinar qué datos usar
  const data = useApiPagination ? crudData.data.items : legacyData;
  const loading = useApiPagination ? crudData.loading.isListLoading : legacyLoading;
  const pagination = useApiPagination ? crudData.data.pagination : null;
  
  // Determinar columna a usar para ordenar
  const fieldAccessor = useMemo(() => {
    return columnsData.find(c => c.label === fieldOrder)?.accessor || fieldOrder;
  }, [columnsData, fieldOrder]);

  // Para paginación de API, solo filtramos localmente
  // Para legacy, mantenemos el filtrado, ordenamiento y paginación local
  const filteredData = useMemo(() => {
    if (useApiPagination) {
      // Con API pagination, solo filtramos los datos actuales de la página
      return data.filter((row) =>
        Object.values(row).some((value) =>
          String(value || "").toLowerCase().includes(q.toLowerCase())
        )
      );
    } else {
      // Legacy: filtrado completo
      return data.filter((row) =>
        Object.values(row).some((value) =>
          String(value || "").toLowerCase().includes(q.toLowerCase())
        )
      );
    }
  }, [data, q, useApiPagination]);

  // Ordenamiento (solo para legacy)
  const sortedData = useMemo(() => {
    if (useApiPagination) {
      // Con API, no ordenamos localmente - esto debería manejarse en la API
      return filteredData;
    } else {
      // Legacy: ordenamiento local
      return [...filteredData].sort((a, b) => {
        const valA = a[fieldAccessor];
        const valB = b[fieldAccessor];

        if (valA == null) return 1;
        if (valB == null) return -1;

        if (typeof valA === "number" && typeof valB === "number") {
          return directionOrder === "asc" ? valA - valB : valB - valA;
        }

        // Si son fechas
        if (!isNaN(Date.parse(valA)) && !isNaN(Date.parse(valB))) {
          return directionOrder === "asc"
            ? new Date(valA) - new Date(valB)
            : new Date(valB) - new Date(valA);
        }

        // Comparación de strings genérica
        return directionOrder === "asc"
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }
  }, [filteredData, fieldAccessor, directionOrder, useApiPagination]);

  // Paginación: API vs Legacy
  const paginationData = useMemo(() => {
    if (useApiPagination) {
      return {
        currentPage: pagination?.page || 1,
        totalPages: pagination?.totalPages || 1,
        total: pagination?.total || 0,
        pageSize: pagination?.pageSize || 20,
        startIndex: ((pagination?.page || 1) - 1) * (pagination?.pageSize || 20),
        endIndex: (pagination?.page || 1) * (pagination?.pageSize || 20),
        currentData: sortedData  // Los datos ya están paginados por la API
      };
    } else {
      // Legacy: paginación local
      const totalPages = Math.ceil(sortedData.length / itemsPerPage);
      const startIndex = (legacyCurrentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const currentData = sortedData.slice(startIndex, endIndex);
      
      return {
        currentPage: legacyCurrentPage,
        totalPages,
        total: sortedData.length,
        pageSize: itemsPerPage,
        startIndex,
        endIndex,
        currentData
      };
    }
  }, [useApiPagination, pagination, sortedData, legacyCurrentPage, itemsPerPage]);

  const handleView = useCallback((row) => {
    console.log("🔍 handleView ejecutado para:", row);
    navigate(`/${entityName}/${row.id}`);
  }, [navigate, entityName]);
  
  const handleEdit = useCallback((row) => {
    console.log("✏️ handleEdit ejecutado para:", row);
    console.log("Navegando a:", `/${entityName}/${row.id}?edit=true`);
    navigate(`/${entityName}/${row.id}?edit=true`);
  }, [navigate, entityName]);
  
  const handleDelete = useCallback(async (row) => {
    console.log("🗑️ handleDelete ejecutado para:", row);
    console.log("Navegando a:", `/${entityName}/${row.id}?delete=true`);
    navigate(`/${entityName}/${row.id}?delete=true`);
  }, [navigate, entityName]);
  
  const handleNew = useCallback(() => {
    navigate(`/${entityName}/create`);
  }, [navigate, entityName]);

  function FilterDropdown() {
    return (
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button variant="secondary" size="small"><span className="hidden sm:inline">Agregar filtro</span></Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content
            side="bottom"
            align="right"
          >
          <DropdownMenu.Item>Tipo</DropdownMenu.Item>
          <DropdownMenu.Item>Etiqueta</DropdownMenu.Item>
          <DropdownMenu.Item>Canal de venta</DropdownMenu.Item>
          <DropdownMenu.Item>Estado</DropdownMenu.Item>
          <DropdownMenu.Item>Creado en</DropdownMenu.Item>
          <DropdownMenu.Item>Actualizado en</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    )
  }

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
              {availableOrderKeys.map((v) => (
                <DropdownMenu.RadioItem
                  key={v}
                  value={v}
                  onSelect={(event) => event.preventDefault()} // evita que se cierre al seleccionar
                >
                  {v}
                </DropdownMenu.RadioItem>
              ))}
            </DropdownMenu.RadioGroup>
            <DropdownMenu.Separator />
            <DropdownMenu.RadioGroup value={directionOrder} onValueChange={setDirectionOrder}>
              {["asc", "desc"].map((v) => (
                <DropdownMenu.RadioItem
                  key={v}
                  value={v}
                  onSelect={(event) => event.preventDefault()} // evita que se cierre al seleccionar
                >
                  {v === "asc" ? "Ascendente" : "Descendente"}
                  <DropdownMenu.Hint>{v === "asc" ? "1 - 30" : "30 - 1"}</DropdownMenu.Hint>
                </DropdownMenu.RadioItem>
              ))}
            </DropdownMenu.RadioGroup>
          </DropdownMenu.Content>
        </DropdownMenu>
      </div>
    );
  }

  if (loading) {
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
              <div className="relative">
                <input
                  type="search"
                  placeholder="Buscar"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="caret-ui-fg-base bg-ui-bg-field hover:bg-ui-bg-field-hover shadow-borders-base placeholder-ui-fg-muted text-ui-fg-base transition-fg rounded-md outline-none txt-compact-small h-7 px-2 py-1 pl-7"
                />
                <div className="text-ui-fg-muted pointer-events-none absolute bottom-0 left-0 flex items-center justify-center h-7 w-7">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.056 13.056 9.53 9.53M6.389 10.833a4.444 4.444 0 1 0 0-8.888 4.444 4.444 0 0 0 0 8.888"/>
                  </svg>
                </div>
              </div>

              <SortDropdown />

              {/* Botón crear */}
              <Button
                variant="secondary"
                size="small"
                onClick={() => handleNew()}
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
              data={paginationData.currentData}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
              fieldOrder={fieldOrder}
              directionOrder={directionOrder}
              emptyMessage={emptyMessage}
              requiredPermissions={requiredPermissions}
            />

            {/* Paginación */}
            {useApiPagination ? (
              <Pagination
                currentPage={paginationData.currentPage}
                totalPages={paginationData.totalPages}
                onPageChange={(page) => crudData.utils.setPage(page)}
                className="px-3 py-4"
              />
            ) : (
              <div className="text-ui-fg-subtle txt-compact-small-plus flex w-full items-center justify-between px-3 py-4">
                <div className="inline-flex items-center gap-x-1 px-3 py-[5px]">
                  <p>{paginationData.startIndex + 1}</p>
                  <span>-</span>
                  <p>{Math.min(paginationData.endIndex, paginationData.total)} de {paginationData.total} resultados</p>
                </div>
                <div className="flex items-center gap-x-2">
                  <p>{paginationData.currentPage} de {paginationData.totalPages} páginas</p>
                  <button
                    type="button"
                    disabled={paginationData.currentPage === 1}
                    onClick={() => setLegacyCurrentPage(paginationData.currentPage - 1)}
                    className="btn-transparent"
                  >
                    Anterior
                  </button>
                  <button
                    type="button"
                    disabled={paginationData.currentPage === paginationData.totalPages}
                    onClick={() => setLegacyCurrentPage(paginationData.currentPage + 1)}
                    className="btn-transparent"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

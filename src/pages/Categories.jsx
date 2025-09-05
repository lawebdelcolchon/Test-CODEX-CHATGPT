// src/pages/Categories.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CategoryTable from "../components/CategoryTable.jsx";
import categoriesData from "../mocks/categories.json";

// Componente para estado vacío
function EmptyState() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ui-bg-subtle">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" className="text-ui-fg-muted">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.833.699 2.532 0l4.318-4.318c.699-.699.699-1.833 0-2.532L10.659 3.659A2.25 2.25 0 0 0 9.068 3z"></path>
          <path fill="currentColor" d="M6.75 7.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5z"></path>
        </svg>
      </div>
      <div className="mt-4 text-center">
        <h3 className="text-ui-fg-base h3-core">No hay categorías</h3>
        <p className="mt-1 text-ui-fg-subtle txt-small">Comienza creando tu primera categoría</p>
      </div>
      <div className="mt-6">
        <button className="transition-fg relative inline-flex w-fit items-center justify-center overflow-hidden rounded-md outline-none disabled:bg-ui-bg-disabled disabled:border-ui-border-base disabled:text-ui-fg-disabled disabled:shadow-buttons-neutral disabled:after:hidden after:transition-fg after:absolute after:inset-0 after:content-[''] shadow-buttons-neutral text-ui-fg-base bg-ui-button-neutral after:button-neutral-gradient hover:bg-ui-button-neutral-hover hover:after:button-neutral-hover-gradient active:bg-ui-button-neutral-pressed active:after:button-neutral-pressed-gradient focus-visible:shadow-buttons-neutral-focus txt-compact-small-plus gap-x-1.5 px-3 py-2">
          Crear categoría
        </button>
      </div>
    </div>
  );
}

export default function Categories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setCategories(categoriesData);
      setLoading(false);
    }, 500);
  }, []);

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(q.toLowerCase()) ||
    category.handle.toLowerCase().includes(q.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCategories = filteredCategories.slice(startIndex, endIndex);

  const handleEdit = (category) => {
    navigate(`/categories/${category.id}/edit`);
  };

  const handleDelete = async (category) => {
    if (window.confirm(`¿Estás seguro de eliminar la categoría "${category.name}"?`)) {
      setCategories(prev => prev.filter(c => c.id !== category.id));
    }
  };

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

  // Mostrar estado vacío si no hay categorías
  if (categories.length === 0) {
    return (
      <div className="flex flex-col gap-y-3">
        <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg divide-y p-0">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="font-sans font-medium h2-core">Categorías</h2>
            <div className="flex items-center justify-center gap-x-2">
              <button className="transition-fg relative inline-flex w-fit items-center justify-center overflow-hidden rounded-md outline-none disabled:bg-ui-bg-disabled disabled:border-ui-border-base disabled:text-ui-fg-disabled disabled:shadow-buttons-neutral disabled:after:hidden after:transition-fg after:absolute after:inset-0 after:content-[''] shadow-buttons-neutral text-ui-fg-base bg-ui-button-neutral after:button-neutral-gradient hover:bg-ui-button-neutral-hover hover:after:button-neutral-hover-gradient active:bg-ui-button-neutral-pressed active:after:button-neutral-pressed-gradient focus-visible:shadow-buttons-neutral-focus txt-compact-small-plus gap-x-1.5 px-2 py-1">
                Exportar
              </button>
              <button className="transition-fg relative inline-flex w-fit items-center justify-center overflow-hidden rounded-md outline-none disabled:bg-ui-bg-disabled disabled:border-ui-border-base disabled:text-ui-fg-disabled disabled:shadow-buttons-neutral disabled:after:hidden after:transition-fg after:absolute after:inset-0 after:content-[''] shadow-buttons-neutral text-ui-fg-base bg-ui-button-neutral after:button-neutral-gradient hover:bg-ui-button-neutral-hover hover:after:button-neutral-hover-gradient active:bg-ui-button-neutral-pressed active:after:button-neutral-pressed-gradient focus-visible:shadow-buttons-neutral-focus txt-compact-small-plus gap-x-1.5 px-2 py-1">
                Importar
              </button>
              <button 
                onClick={() => navigate('/categories/create')}
                className="transition-fg relative inline-flex w-fit items-center justify-center overflow-hidden rounded-md outline-none disabled:bg-ui-bg-disabled disabled:border-ui-border-base disabled:text-ui-fg-disabled disabled:shadow-buttons-neutral disabled:after:hidden after:transition-fg after:absolute after:inset-0 after:content-[''] shadow-buttons-neutral text-ui-fg-base bg-ui-button-neutral after:button-neutral-gradient hover:bg-ui-button-neutral-hover hover:after:button-neutral-hover-gradient active:bg-ui-button-neutral-pressed active:after:button-neutral-pressed-gradient focus-visible:shadow-buttons-neutral-focus txt-compact-small-plus gap-x-1.5 px-2 py-1"
              >
                Crear
              </button>
            </div>
          </div>
          <EmptyState />
        </div>
      </div>
    );
  }

  return (      
    <div className="flex flex-col gap-y-3">
      {/* Card Principal */}
      <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg divide-y p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="font-sans font-medium h2-core">Categorías</h2>
          <div className="flex items-center justify-center gap-x-2">
            <button className="transition-fg relative inline-flex w-fit items-center justify-center overflow-hidden rounded-md outline-none disabled:bg-ui-bg-disabled disabled:border-ui-border-base disabled:text-ui-fg-disabled disabled:shadow-buttons-neutral disabled:after:hidden after:transition-fg after:absolute after:inset-0 after:content-[''] shadow-buttons-neutral text-ui-fg-base bg-ui-button-neutral after:button-neutral-gradient hover:bg-ui-button-neutral-hover hover:after:button-neutral-hover-gradient active:bg-ui-button-neutral-pressed active:after:button-neutral-pressed-gradient focus-visible:shadow-buttons-neutral-focus txt-compact-small-plus gap-x-1.5 px-2 py-1">
              Exportar
            </button>
            <button className="transition-fg relative inline-flex w-fit items-center justify-center overflow-hidden rounded-md outline-none disabled:bg-ui-bg-disabled disabled:border-ui-border-base disabled:text-ui-fg-disabled disabled:shadow-buttons-neutral disabled:after:hidden after:transition-fg after:absolute after:inset-0 after:content-[''] shadow-buttons-neutral text-ui-fg-base bg-ui-button-neutral after:button-neutral-gradient hover:bg-ui-button-neutral-hover hover:after:button-neutral-hover-gradient active:bg-ui-button-neutral-pressed active:after:button-neutral-pressed-gradient focus-visible:shadow-buttons-neutral-focus txt-compact-small-plus gap-x-1.5 px-2 py-1">
              Importar
            </button>
            <button 
              onClick={() => navigate('/categories/create')}
              className="transition-fg relative inline-flex w-fit items-center justify-center overflow-hidden rounded-md outline-none disabled:bg-ui-bg-disabled disabled:border-ui-border-base disabled:text-ui-fg-disabled disabled:shadow-buttons-neutral disabled:after:hidden after:transition-fg after:absolute after:inset-0 after:content-[''] shadow-buttons-neutral text-ui-fg-base bg-ui-button-neutral after:button-neutral-gradient hover:bg-ui-button-neutral-hover hover:after:button-neutral-hover-gradient active:bg-ui-button-neutral-pressed active:after:button-neutral-pressed-gradient focus-visible:shadow-buttons-neutral-focus txt-compact-small-plus gap-x-1.5 px-2 py-1"
            >
              Crear
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="divide-y">
          <div className="flex items-start justify-between gap-x-4 px-6 py-4">
            <div className="w-full max-w-[60%]">
              <div className="max-w-2/3 flex flex-wrap items-center gap-2">
                <button className="transition-fg relative inline-flex w-fit items-center justify-center overflow-hidden rounded-md outline-none disabled:bg-ui-bg-disabled disabled:border-ui-border-base disabled:text-ui-fg-disabled disabled:shadow-buttons-neutral disabled:after:hidden after:transition-fg after:absolute after:inset-0 after:content-[''] shadow-buttons-neutral text-ui-fg-base bg-ui-button-neutral after:button-neutral-gradient hover:bg-ui-button-neutral-hover hover:after:button-neutral-hover-gradient active:bg-ui-button-neutral-pressed active:after:button-neutral-pressed-gradient focus-visible:shadow-buttons-neutral-focus txt-compact-small-plus gap-x-1.5 px-2 py-1">
                  Agregar filtro
                </button>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-x-2">
              <div className="relative">
                <input
                  type="search"
                  className="caret-ui-fg-base bg-ui-bg-field hover:bg-ui-bg-field-hover shadow-borders-base placeholder-ui-fg-muted text-ui-fg-base transition-fg relative w-full appearance-none rounded-md outline-none focus-visible:shadow-borders-interactive-with-active disabled:text-ui-fg-disabled disabled:!bg-ui-bg-disabled disabled:placeholder-ui-fg-disabled disabled:cursor-not-allowed txt-compact-small h-7 px-2 py-1 pl-7"
                  placeholder="Buscar"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
                <div className="text-ui-fg-muted pointer-events-none absolute bottom-0 left-0 flex items-center justify-center h-7 w-7">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.056 13.056 9.53 9.53M6.389 10.833a4.444 4.444 0 1 0 0-8.888 4.444 4.444 0 0 0 0 8.888"></path>
                  </svg>
                </div>
              </div>
              <button className="transition-fg inline-flex items-center justify-center overflow-hidden rounded-md outline-none disabled:bg-ui-bg-disabled disabled:shadow-buttons-neutral disabled:text-ui-fg-disabled shadow-buttons-neutral text-ui-fg-subtle bg-ui-button-neutral hover:bg-ui-button-neutral-hover active:bg-ui-button-neutral-pressed focus-visible:shadow-buttons-neutral-focus h-7 w-7 p-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m8.611 10.833 2.222 2.223 2.223-2.223M10.833 13.056v-8M1.944 8.167h5.778M1.944 5.056h5.778M1.944 1.944h8.89"></path>
                </svg>
              </button>
            </div>
          </div>

          {/* CategoryTable */}
          <CategoryTable 
            categories={currentCategories}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          {/* Pagination */}
          <div className="text-ui-fg-subtle txt-compact-small-plus flex w-full items-center justify-between px-3 py-4 flex-shrink-0">
            <div className="inline-flex items-center gap-x-1 px-3 py-[5px]">
              <p>{startIndex + 1}</p>
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" className="text-ui-fg-muted">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.5 7.5h10"></path>
              </svg>
              <p>{Math.min(endIndex, filteredCategories.length)} de {filteredCategories.length} resultados</p>
            </div>
            <div className="flex items-center gap-x-2">
              <div className="inline-flex items-center gap-x-1 px-3 py-[5px]">
                <p>{currentPage} de {totalPages} páginas</p>
              </div>
              <button 
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="transition-fg relative inline-flex w-fit items-center justify-center overflow-hidden rounded-md outline-none disabled:bg-ui-bg-disabled disabled:border-ui-border-base disabled:text-ui-fg-disabled disabled:shadow-buttons-neutral disabled:after:hidden after:transition-fg after:absolute after:inset-0 after:content-[''] after:hidden text-ui-fg-base bg-ui-button-transparent hover:bg-ui-button-transparent-hover active:bg-ui-button-transparent-pressed focus-visible:shadow-buttons-neutral-focus focus-visible:bg-ui-bg-base disabled:!bg-transparent disabled:!shadow-none txt-compact-small-plus gap-x-1.5 px-3 py-1.5"
              >
                Anterior
              </button>
              <button 
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="transition-fg relative inline-flex w-fit items-center justify-center overflow-hidden rounded-md outline-none disabled:bg-ui-bg-disabled disabled:border-ui-border-base disabled:text-ui-fg-disabled disabled:shadow-buttons-neutral disabled:after:hidden after:transition-fg after:absolute after:inset-0 after:content-[''] after:hidden text-ui-fg-base bg-ui-button-transparent hover:bg-ui-button-transparent-hover active:bg-ui-button-transparent-pressed focus-visible:shadow-buttons-neutral-focus focus-visible:bg-ui-bg-base disabled:!bg-transparent disabled:!shadow-none txt-compact-small-plus gap-x-1.5 px-3 py-1.5"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

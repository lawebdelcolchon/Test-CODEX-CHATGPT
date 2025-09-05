// src/pages/products/Products.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../../components/Table.jsx";
import ProductActions from "../../features/products/product-actions";
import productsData from "../../mocks/products.json";

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setProducts(productsData);
      setLoading(false);
    }, 500);
  }, []);

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(q.toLowerCase()) ||
    product.sku.toLowerCase().includes(q.toLowerCase()) ||
    product.category?.toLowerCase().includes(q.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handleView = (product) => {
    navigate(`/products/${product.id}`);
  };

  const handleEdit = (product) => {
    navigate(`/products/${product.id}/edit`);
  };

  const handleDelete = async (product) => {
    if (window.confirm(`¿Estás seguro de eliminar "${product.title}"?`)) {
      setProducts(prev => prev.filter(p => p.id !== product.id));
    }
  };

  const handleToggleStatus = async (product) => {
    const newStatus = product.status === 'published' ? 'draft' : 'published';
    setProducts(prev => 
      prev.map(p => 
        p.id === product.id ? { ...p, status: newStatus } : p
      )
    );
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

  return (      
    <div className="flex flex-col gap-y-3">
      {/* Card Principal */}
      <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg divide-y p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="font-sans font-medium h2-core">Productos</h2>
          <div className="flex items-center justify-center gap-x-2">
            <button className="transition-fg relative inline-flex w-fit items-center justify-center overflow-hidden rounded-md outline-none disabled:bg-ui-bg-disabled disabled:border-ui-border-base disabled:text-ui-fg-disabled disabled:shadow-buttons-neutral disabled:after:hidden after:transition-fg after:absolute after:inset-0 after:content-[''] shadow-buttons-neutral text-ui-fg-base bg-ui-button-neutral after:button-neutral-gradient hover:bg-ui-button-neutral-hover hover:after:button-neutral-hover-gradient active:bg-ui-button-neutral-pressed active:after:button-neutral-pressed-gradient focus-visible:shadow-buttons-neutral-focus txt-compact-small-plus gap-x-1.5 px-2 py-1">
              Exportar
            </button>
            <button className="transition-fg relative inline-flex w-fit items-center justify-center overflow-hidden rounded-md outline-none disabled:bg-ui-bg-disabled disabled:border-ui-border-base disabled:text-ui-fg-disabled disabled:shadow-buttons-neutral disabled:after:hidden after:transition-fg after:absolute after:inset-0 after:content-[''] shadow-buttons-neutral text-ui-fg-base bg-ui-button-neutral after:button-neutral-gradient hover:bg-ui-button-neutral-hover hover:after:button-neutral-hover-gradient active:bg-ui-button-neutral-pressed active:after:button-neutral-pressed-gradient focus-visible:shadow-buttons-neutral-focus txt-compact-small-plus gap-x-1.5 px-2 py-1">
              Importar
            </button>
            <button 
              onClick={() => navigate('/products/create')}
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

          {/* Table */}
          <div className="flex w-full flex-col overflow-hidden" style={{borderTopWidth: "0px"}}>
            <Table
              columns={[
                { key: "title", title: "Producto", dataIndex: "title", render: (title, row) => (
                  <div class="flex h-full w-full max-w-[250px] items-center gap-x-3 overflow-hidden"><div class="w-fit flex-shrink-0"><div class="bg-ui-bg-component border-ui-border-base flex items-center justify-center overflow-hidden rounded border h-8 w-6"><img src="https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png" class="h-full w-full object-cover object-center"></div></div><span title="Medusa Sweatshirt" class="truncate">Medusa Sweatshirt</span></div>
                  
                )},
                { key: "status", title: "Estado", dataIndex: "status", render: (status) => (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {status === 'published' ? 'Publicado' : 'Borrador'}
                  </span>
                )},
                { key: "price", title: "Precio", dataIndex: "price", render: (price) => `$${(price / 100).toFixed(2)}` },
                { key: "inventory_quantity", title: "Stock", dataIndex: "inventory_quantity" },
                { key: "category", title: "Categoría", dataIndex: "category" },
                { key: "actions", title: "Acciones", dataIndex: "id", render: (_v, product) => (
                  <ProductActions
                    product={product}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                    compact={true}
                  />
                )}
              ]}
              data={filteredProducts}
            />               
            {/* Pagination */}
            <div className="text-ui-fg-subtle txt-compact-small-plus flex w-full items-center justify-between px-3 py-4 flex-shrink-0">
              <div className="inline-flex items-center gap-x-1 px-3 py-[5px]">
                <p>{startIndex + 1}</p>
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" className="text-ui-fg-muted">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.5 7.5h10"></path>
                </svg>
                <p>{Math.min(endIndex, filteredProducts.length)} de {filteredProducts.length} resultados</p>
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
    </div>
  );
}

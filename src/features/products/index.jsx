// src/features/products/index.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input, Badge, Button, Select, Textarea, Switch } from "@medusajs/ui";
import DataLayout from "../../layouts/DataLayout.jsx";
import { hasPermission } from "../../utils/permissions.js";
import { useSelector } from "react-redux";
import {
  useProductQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useToggleProductFeaturedMutation,
  useUpdateProductStatusMutation
} from "../../hooks/queries/useProducts.js";
import { useCategoriesQuery } from "../../hooks/queries/useCategories.js";
import { formatCurrency, formatDate } from "../../utils/formatters.js";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Obtener usuario y verificar permisos
  const { user } = useSelector((state) => state.auth);
  const canEdit = hasPermission(user, ['all', 'products']);
  const canDelete = hasPermission(user, ['all', 'products']);

  // Usar TanStack Query para obtener datos
  const {
    data: categoriesResult,
    isLoading: isCategoriesLoading
  } = useCategoriesQuery({ page: 1, pageSize: 100 });

  const {
    data: product,
    isLoading: isProductLoading,
    error: productError,
    refetch: refetchProduct
  } = useProductQuery(id);

  // Extraer datos para los selectores
  const categoriesData = categoriesResult?.items || [];
  const isLoading = isCategoriesLoading || isProductLoading;
  

  // Hooks de mutación
  const updateProductMutation = useUpdateProductMutation({
    onSuccess: (updatedProduct) => {
      console.log('✅ ProductDetail: Producto actualizado exitosamente:', updatedProduct);
      // Actualizar el formData con los nuevos datos
      setFormData({
        name: updatedProduct.name || "",
        slug: updatedProduct.slug || "",
        description: updatedProduct.description || "",
        short_description: updatedProduct.short_description || "",
        sku: updatedProduct.sku || "",
        price: updatedProduct.price || 0,
        sale_price: updatedProduct.sale_price || null,
        stock: updatedProduct.stock || 0,
        stock_min: updatedProduct.stock_min || 0,
        weight: updatedProduct.weight || null,
        category_id: updatedProduct.category_id || null,
        status: updatedProduct.status || 'draft',
        featured: Boolean(updatedProduct.featured),
        manage_stock: Boolean(updatedProduct.manage_stock),
        meta_title: updatedProduct.meta_title || "",
        meta_description: updatedProduct.meta_description || "",
        meta_keywords: updatedProduct.meta_keywords || ""
      });
    },
    onError: (error) => {
      console.error('❌ ProductDetail: Error al actualizar producto:', error);
      alert('Error al actualizar el producto: ' + error.message);
    }
  });

  const deleteProductMutation = useDeleteProductMutation({
    onSuccess: (result, deletedId) => {
      if (String(deletedId) === String(id)) {
        navigate('/products');
      }
    },
    onError: (error) => {
      alert('Error al eliminar el producto: ' + error.message);
    }
  });

  const toggleFeaturedMutation = useToggleProductFeaturedMutation();
  const updateStatusMutation = useUpdateProductStatusMutation();

  // Estado para el formulario de edición (no se usa en vista de consulta)
  const [formData, setFormData] = useState({});

  // Detectar si venimos de la página de edición y refetch si es necesario
  useEffect(() => {
    const hasRecentEdit = sessionStorage.getItem('product_just_edited');
    if (hasRecentEdit === id) {
      console.log('🔄 ProductDetail: Refetch forzado después de edición');
      refetchProduct();
      sessionStorage.removeItem('product_just_edited');
    }
  }, [id, refetchProduct]);



  // Manejador para eliminar producto
  const handleDelete = async (entity) => {
    console.log('🗑️ Eliminando producto:', entity.id);
    return deleteProductMutation.mutateAsync(entity.id);
  };

  // Custom handlers
  const customHandlers = {
    onEdit: () => {
      if (!canEdit) {
        console.warn('🚫 Usuario no tiene permisos para editar productos');
        alert('No tienes permisos para editar productos');
        return false;
      }
      // Navegar a la página de edición
      navigate(`/products/${id}/edit`);
      return false; // No abrir el drawer
    },
    onDelete: (entity) => {
      if (!canDelete) {
        console.warn('🚫 Usuario no tiene permisos para eliminar productos');
        alert('No tienes permisos para eliminar productos');
        return;
      }
      handleDelete(entity);
    }
  };

  // Obtener nombre de categoría
  const getCategoryName = (categoryId) => {
    if (!categoryId) return 'Sin categoría';
    const category = categoriesData.find(cat => cat.id === categoryId);
    return category ? `#${categoryId} - ${category.name}` : `#${categoryId}`;
  };

  // Render functions for DataLayout
  const renderHeader = ({ entity, ActionsMenu }) => (
    <>
      <h1 className="font-sans font-medium h1-core">{entity.name}</h1>
      <div className="flex items-center gap-x-2">
        <Badge
          variant={entity.active ? "default" : "secondary"}
          size="small"
          className="txt-compact-xsmall-plus bg-ui-bg-subtle text-ui-fg-subtle border-ui-border-base box-border flex w-fit select-none items-center overflow-hidden rounded-md border pl-0 pr-1 leading-none"
        >
          <div className="flex items-center justify-center w-5 h-[18px] [&_div]:w-2 [&_div]:h-2 [&_div]:rounded-sm [&_div]:bg-ui-tag-green-icon">
            <div></div>
          </div>
          {entity.active ? "Activo" : "Inactivo"}
        </Badge>
        {entity.visible && (
          <Badge
            variant="default"
            size="small"
            className="txt-compact-xsmall-plus bg-ui-tag-green-bg text-ui-tag-green-text border-ui-tag-green-border"
          >
            👁 Visible
          </Badge>
        )}
        {entity.marked && (
          <Badge
            variant="default"
            size="small"
            className="txt-compact-xsmall-plus bg-ui-tag-blue-bg text-ui-tag-blue-text border-ui-tag-blue-border"
          >
            ⭐ Marcado
          </Badge>
        )}
        <ActionsMenu />
      </div>
    </>
  );

  renderHeader.additionalRows = ({ entity }) => (
    <>
      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <p className="font-medium font-sans txt-compact-small">ID</p>
        <p className="font-normal font-sans txt-compact-small">#{entity.id}</p>
      </div>
      
      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <p className="font-medium font-sans txt-compact-small">Código</p>
        <p className="font-normal font-sans txt-compact-small">{entity.code || "-"}</p>
      </div>

      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <p className="font-medium font-sans txt-compact-small">Impuesto</p>
        <p className="font-normal font-sans txt-compact-small">
          {entity.tax ? `${entity.tax}%` : "0%"}
        </p>
      </div>

      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <p className="font-medium font-sans txt-compact-small">Unidades</p>
        <p className="font-normal font-sans txt-compact-small">
          {entity.units || "unidad"}
        </p>
      </div>

      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <p className="font-medium font-sans txt-compact-small">Categoría</p>
        <p className="font-normal font-sans txt-compact-small">
          {getCategoryName(entity.id_category)}
        </p>
      </div>
    </>
  );

  const renderMainSections = ({ EmptyState, entity, Link, Button }) => (
    <>
      {/* Description Section */}
      <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="font-sans font-medium h2-core">Descripción</h2>
        </div>
        <div className="px-6 py-4">
          {entity.description ? (
            <div className="prose max-w-none text-ui-fg-base">
              <p>{entity.description}</p>
            </div>
          ) : (
            <EmptyState
              title="Sin descripción"
              description="Este producto no tiene una descripción detallada."
            />
          )}
        </div>
      </div>

      {/* Images Section */}
      <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="font-sans font-medium h2-core">Imágenes</h2>
          <Button variant="secondary" size="small" className="txt-compact-small-plus gap-x-1.5 px-2 py-1">
            Gestionar imágenes
          </Button>
        </div>
        <div className="px-6 py-4">
          {entity.images && entity.images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {entity.images.map((image, index) => (
                <div key={index} className="aspect-square bg-ui-bg-subtle rounded-lg"></div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Sin imágenes"
              description="Este producto no tiene imágenes cargadas."
            />
          )}
        </div>
      </div>
    </>
  );

  const renderSidebar = ({ entity, Link, Button, Badge, PencilSquare, mobile = false }) => (
    <>
      {/* Inventory Section */}
      <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="font-sans font-medium h2-core">Inventario</h2>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Stock actual</p>
            <p className={`font-normal font-sans txt-compact-small ${
              entity.stock <= entity.stock_min ? 'text-ui-tag-red-text' : 'text-ui-fg-base'
            }`}>
              {entity.stock} unidades
            </p>
          </div>
          <div>
            <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Stock mínimo</p>
            <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle">
              {entity.stock_min} unidades
            </p>
          </div>
          <div>
            <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Gestión de stock</p>
            <Badge variant={entity.manage_stock ? "default" : "secondary"} size="small">
              {entity.manage_stock ? "Activada" : "Desactivada"}
            </Badge>
          </div>
        </div>
      </div>

      {/* SEO Section */}
      <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="font-sans font-medium h2-core">SEO</h2>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Meta Title</p>
            <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle">
              {entity.meta_title || "No definido"}
            </p>
          </div>
          <div>
            <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Meta Description</p>
            <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle">
              {entity.meta_description || "No definida"}
            </p>
          </div>
          <div>
            <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Meta Keywords</p>
            <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle">
              {entity.meta_keywords || "No definidas"}
            </p>
          </div>
        </div>
      </div>

      {/* Metadata Section */}
      <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-x-3">
          <h2 className="font-sans font-medium h2-core">Fechas</h2>
        </div>
      </div>
      <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg p-0 -mt-3">
        <div className="px-6 py-4 space-y-3">
          <div>
            <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Creado</p>
            <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle">
              {formatDate(entity.created_at)}
            </p>
          </div>
          <div>
            <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Actualizado</p>
            <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle">
              {formatDate(entity.updated_at)}
            </p>
          </div>
        </div>
      </div>
    </>
  );


  // Debug: mostrar datos en consola
  console.log('🔍 ProductDetail - Debug datos:', {
    id,
    isLoading,
    product,
    productError
  });

  // Mostrar loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full" role="status" aria-label="loading">
            <span className="sr-only">Cargando...</span>
          </div>
          <p className="mt-2 text-ui-fg-muted">Cargando producto...</p>
          <p className="mt-1 text-xs text-ui-fg-muted">ID: {id}</p>
        </div>
      </div>
    );
  }

  // Mostrar error si no hay producto
  if (!product && !isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 text-red-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Producto no encontrado</h2>
          <p className="text-gray-500 mb-4">No se pudo cargar el producto con ID: {id}</p>
          {productError && (
            <p className="text-sm text-red-600">Error: {productError.message}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <DataLayout
      entityName="products"
      entityPluralName="Productos"
      entity={product}
      renderHeader={renderHeader}
      renderMainSections={renderMainSections}
      renderSidebar={renderSidebar}
      deleteVerificationField="name"
      deleteItemText="producto"
      customHandlers={customHandlers}
    />
  );
}
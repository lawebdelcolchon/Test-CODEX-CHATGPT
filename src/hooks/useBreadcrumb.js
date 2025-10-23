import { useLocation } from 'react-router-dom';

// Mapeo de rutas a nombres de navegación
const navigationMapping = {
  '/': { name: 'Dashboard', parent: null },
  '/orders': { name: 'Pedidos', parent: null },
  '/products': { name: 'Productos', parent: null },
  '/products/create': { name: 'Nuevo Producto', parent: 'Productos' },
  '/collections': { name: 'Colecciones', parent: 'Productos' },
  '/categories': { name: 'Categorías', parent: null },
  '/categories/create': { name: 'Nueva Categoría', parent: 'Categorías' },
  '/attributes': { name: 'Atributos', parent: null },
  '/attributes/create': { name: 'Nuevo Atributo', parent: 'Atributos' },
  '/options': { name: 'Opciones', parent: null },
  '/options/create': { name: 'Nueva Opción', parent: 'Opciones' },
  '/inventory': { name: 'Inventario', parent: null },
  '/suppliers': { name: 'Proveedores', parent: null },
  '/suppliers/create': { name: 'Nuevo Proveedor', parent: 'Proveedores' },
  '/reserves': { name: 'Reservas', parent: 'Inventario' },
  '/inputs': { name: 'Insumos', parent: 'Inventario' },
  '/purchase-orders': { name: 'Órdenes de Compra', parent: 'Inventario' },
  '/stores': { name: 'Tiendas', parent: null },
  '/stores/create': { name: 'Nueva Tienda', parent: 'Tiendas' },
  '/admin-accounts': { name: 'Administradores', parent: null },
  '/admin-accounts/create': { name: 'Nuevo Administrador', parent: 'Administradores' },
  '/clients': { name: 'Clientes', parent: null },
  '/clients/create': { name: 'Nuevo Cliente', parent: 'Clientes' },
  '/marketplace': { name: 'Marketplace', parent: null },
  '/marketplace/create': { name: 'Nuevo Marketplace', parent: 'Marketplace' },
  '/customers': { name: 'Clientes', parent: null },
  '/customer-groups': { name: 'Grupos de Clientes', parent: 'Clientes' },
  '/campaigns': { name: 'Promociones', parent: null },
  '/settings': { name: 'Configuración', parent: null },
  '/profile': { name: 'Perfil', parent: null }
};

export const useBreadcrumb = () => {
  const location = useLocation();
  
  const generateBreadcrumb = () => {
    const currentPath = location.pathname;
    
    // Verificar rutas exactas primero
    if (navigationMapping[currentPath]) {
      const current = navigationMapping[currentPath];
      const breadcrumb = [];
      
      // Si tiene padre, agregarlo primero
      if (current.parent) {
        breadcrumb.push({ name: current.parent });
      }
      
      // Agregar la página actual
      breadcrumb.push({ name: current.name });
      
      return breadcrumb;
    }
    
    // Manejar rutas dinámicas de administradores
    if (currentPath.startsWith('/admin-accounts/')) {
      if (currentPath.includes('/edit')) {
        return [
          { name: 'Administradores' },
          { name: 'Editar Administrador' }
        ];
      } else if (currentPath.match(/\/admin-accounts\/\d+$/)) {
        return [
          { name: 'Administradores' },
          { name: 'Detalle Administrador' }
        ];
      }
    }
    
    // Manejar rutas dinámicas de tiendas
    if (currentPath.startsWith('/stores/')) {
      if (currentPath.includes('/edit')) {
        return [
          { name: 'Tiendas' },
          { name: 'Editar Tienda' }
        ];
      } else if (currentPath.match(/\/stores\/\d+$/)) {
        return [
          { name: 'Tiendas' },
          { name: 'Detalle Tienda' }
        ];
      }
    }
    
    // Manejar rutas dinámicas de productos
    if (currentPath.startsWith('/products/')) {
      if (currentPath.includes('/edit')) {
        return [
          { name: 'Productos' },
          { name: 'Editar Producto' }
        ];
      } else if (currentPath.match(/\/products\/\d+$/)) {
        return [
          { name: 'Productos' },
          { name: 'Detalle Producto' }
        ];
      }
    }
    
    // Manejar rutas dinámicas de categorías
    if (currentPath.startsWith('/categories/')) {
      if (currentPath.includes('/edit')) {
        return [
          { name: 'Categorías' },
          { name: 'Editar Categoría' }
        ];
      } else if (currentPath.match(/\/categories\/\d+$/)) {
        return [
          { name: 'Categorías' },
          { name: 'Detalle Categoría' }
        ];
      }
    }
    
    // Manejar rutas dinámicas de atributos
    if (currentPath.startsWith('/attributes/')) {
      if (currentPath.includes('/edit')) {
        return [
          { name: 'Atributos' },
          { name: 'Editar Atributo' }
        ];
      } else if (currentPath.match(/\/attributes\/\d+$/)) {
        return [
          { name: 'Atributos' },
          { name: 'Detalle Atributo' }
        ];
      }
    }
    
    // Manejar rutas dinámicas de opciones
    if (currentPath.startsWith('/options/')) {
      if (currentPath.includes('/edit')) {
        return [
          { name: 'Opciones' },
          { name: 'Editar Opción' }
        ];
      } else if (currentPath.match(/\/options\/\d+$/)) {
        return [
          { name: 'Opciones' },
          { name: 'Detalle Opción' }
        ];
      }
    }
    
    // Manejar rutas dinámicas de clientes
    if (currentPath.startsWith('/clients/')) {
      if (currentPath.includes('/edit')) {
        return [
          { name: 'Clientes' },
          { name: 'Editar Cliente' }
        ];
      } else if (currentPath.match(/\/clients\/\d+$/)) {
        return [
          { name: 'Clientes' },
          { name: 'Detalle Cliente' }
        ];
      }
    }
    
    // Manejar rutas dinámicas de marketplace
    if (currentPath.startsWith('/marketplace/')) {
      if (currentPath.includes('/edit')) {
        return [
          { name: 'Marketplace' },
          { name: 'Editar Marketplace' }
        ];
      } else if (currentPath.match(/\/marketplace\/\d+$/)) {
        return [
          { name: 'Marketplace' },
          { name: 'Detalle Marketplace' }
        ];
      }
    }
    
    // Manejar rutas dinámicas de proveedores
    if (currentPath.startsWith('/suppliers/')) {
      if (currentPath.includes('/edit')) {
        return [
          { name: 'Proveedores' },
          { name: 'Editar Proveedor' }
        ];
      } else if (currentPath.match(/\/suppliers\/\d+$/)) {
        return [
          { name: 'Proveedores' },
          { name: 'Detalle Proveedor' }
        ];
      }
    }
    
    // Si no encontramos la ruta en el mapeo, usar Dashboard por defecto
    return [{ name: 'Dashboard' }];
  };
  
  return generateBreadcrumb();
};

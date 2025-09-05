import { useLocation } from 'react-router-dom';

// Mapeo de rutas a nombres de navegación
const navigationMapping = {
  '/': { name: 'Dashboard', parent: null },
  '/orders': { name: 'Pedidos', parent: null },
  '/products': { name: 'Productos', parent: null },
  '/collections': { name: 'Colecciones', parent: 'Productos' },
  '/categories': { name: 'Categorías', parent: 'Productos' },
  '/inventory': { name: 'Inventario', parent: null },
  '/suppliers': { name: 'Proveedores', parent: 'Inventario' },
  '/reserves': { name: 'Reservas', parent: 'Inventario' },
  '/inputs': { name: 'Insumos', parent: 'Inventario' },
  '/purchase-orders': { name: 'Órdenes de Compra', parent: 'Inventario' },
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
    
    // Si no encontramos la ruta en el mapeo, usar Dashboard por defecto
    if (!navigationMapping[currentPath]) {
      return [{ name: 'Dashboard' }];
    }
    
    const current = navigationMapping[currentPath];
    const breadcrumb = [];
    
    // Si tiene padre, agregarlo primero
    if (current.parent) {
      breadcrumb.push({ name: current.parent });
    }
    
    // Agregar la página actual
    breadcrumb.push({ name: current.name });
    
    return breadcrumb;
  };
  
  return generateBreadcrumb();
};

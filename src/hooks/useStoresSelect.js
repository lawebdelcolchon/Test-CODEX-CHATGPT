// src/hooks/useStoresSelect.js
import { useMemo } from 'react';
import { useStoresQuery } from './queries/useStores.js';

/**
 * Hook para obtener las tiendas para select/dropdown
 * @returns {Object} Lista de tiendas formateada para select y estado de carga
 */
export const useStoresSelect = () => {
  const { 
    data: storesData, 
    isLoading, 
    error 
  } = useStoresQuery({
    // Sin paginación para obtener todas las tiendas
    pageSize: 1000,
    sort: 'name',
    order: 'asc'
  });

  const storesOptions = useMemo(() => {
    if (!storesData?.items) return [];
    
    return storesData.items.map(store => ({
      value: store.id.toString(),
      label: store.name,
      store: store // Incluir objeto completo por si se necesita
    }));
  }, [storesData?.items]);

  return {
    storesOptions,
    isLoading,
    error,
    stores: storesData?.items || []
  };
};

export default useStoresSelect;
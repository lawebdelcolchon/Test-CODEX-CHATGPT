import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

/**
 * Hook personalizado que wrappea useMutation con logging detallado
 * para rastrear problemas de edición
 */
export function useTrackedMutation({
  mutationFn,
  mutationKey,
  queryKeysToInvalidate = [],
  onSuccess,
  onError,
  optimisticUpdates = []
}) {
  const queryClient = useQueryClient();
  const [operationLog, setOperationLog] = useState([]);

  // Función para agregar logs
  const addLog = (level, message, data = null) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data: data ? JSON.parse(JSON.stringify(data)) : null,
      id: Math.random().toString(36).substring(2, 11)
    };
    
    setOperationLog(prev => [...prev.slice(-20), logEntry]); // Keep last 20 logs
    
    // Log para consola en desarrollo
    if (import.meta.env.DEV) {
      console.log(`🛠️ [${level.toUpperCase()}] ${mutationKey?.join('.') || 'mutation'}: ${message}`, data);
    }
  };

  const mutation = useMutation({
    mutationKey,
    mutationFn: async (variables) => {
      addLog('info', 'Iniciando mutación', variables);
      
      try {
        // Validar variables antes de enviar
        if (!variables) {
          throw new Error('Variables de mutación son undefined o null');
        }

        if (typeof variables.id !== 'undefined' && (typeof variables.id !== 'number' && isNaN(parseInt(variables.id)))) {
          addLog('warn', 'ID no es un número válido', { id: variables.id, type: typeof variables.id });
        }

        // Hacer snapshot del cache antes de la mutación
        const cacheSnapshot = {};
        queryKeysToInvalidate.forEach(queryKey => {
          const queryData = queryClient.getQueryData(queryKey);
          if (queryData) {
            cacheSnapshot[queryKey.join('.')] = JSON.parse(JSON.stringify(queryData));
          }
        });
        
        addLog('info', 'Snapshot del cache tomado', { 
          keys: Object.keys(cacheSnapshot),
          snapshot: cacheSnapshot 
        });

        const result = await mutationFn(variables);
        
        addLog('info', 'Mutación completada exitosamente', {
          variables,
          result,
          resultType: typeof result,
          hasId: !!result?.id
        });
        
        return result;
      } catch (error) {
        addLog('error', 'Error en mutación', {
          variables,
          error: error.message,
          stack: error.stack
        });
        throw error;
      }
    },
    onMutate: async (variables) => {
      addLog('info', 'onMutate ejecutándose', variables);
      
      // Cancelar queries pendientes
      await Promise.all(
        queryKeysToInvalidate.map(queryKey => queryClient.cancelQueries({ queryKey }))
      );

      // Hacer snapshot para rollback
      const previousData = {};
      queryKeysToInvalidate.forEach(queryKey => {
        previousData[queryKey.join('.')] = queryClient.getQueryData(queryKey);
      });

      // Aplicar actualizaciones optimistas
      optimisticUpdates.forEach(({ queryKey, updater }) => {
        queryClient.setQueryData(queryKey, old => {
          const updated = updater(old, variables);
          addLog('info', 'Actualización optimista aplicada', {
            queryKey,
            oldData: old,
            newData: updated
          });
          return updated;
        });
      });

      addLog('info', 'onMutate completado', { previousData });
      return { previousData };
    },
    onSuccess: (data, variables, context) => {
      addLog('info', 'onSuccess ejecutándose', { data, variables, context });
      
      // Invalidar queries relacionadas
      const invalidationPromises = queryKeysToInvalidate.map(async (queryKey) => {
        try {
          addLog('info', `Invalidando query: ${queryKey.join('.')}`);
          await queryClient.invalidateQueries({ queryKey });
          
          // Verificar que los datos se actualizaron
          setTimeout(() => {
            const newData = queryClient.getQueryData(queryKey);
            addLog('info', `Datos después de invalidación: ${queryKey.join('.')}`, newData);
          }, 100);
        } catch (error) {
          addLog('error', `Error al invalidar query: ${queryKey.join('.')}`, error);
        }
      });

      Promise.all(invalidationPromises).then(() => {
        addLog('info', 'Todas las invalidaciones completadas');
      });

      if (onSuccess) {
        try {
          onSuccess(data, variables, context);
        } catch (error) {
          addLog('error', 'Error en callback onSuccess personalizado', error);
        }
      }
    },
    onError: (error, variables, context) => {
      addLog('error', 'onError ejecutándose', { error: error.message, variables, context });

      // Hacer rollback usando el context
      if (context?.previousData) {
        Object.entries(context.previousData).forEach(([keyStr, data]) => {
          const queryKey = keyStr.split('.');
          queryClient.setQueryData(queryKey, data);
          addLog('info', `Rollback aplicado para: ${keyStr}`, data);
        });
      }

      if (onError) {
        try {
          onError(error, variables, context);
        } catch (callbackError) {
          addLog('error', 'Error en callback onError personalizado', callbackError);
        }
      }
    },
    onSettled: (data, error, variables, context) => {
      addLog('info', 'onSettled ejecutándose', { 
        success: !error,
        hasData: !!data,
        errorMessage: error?.message,
        variables 
      });

      // Refetch final de las queries importantes
      setTimeout(() => {
        queryKeysToInvalidate.forEach(async (queryKey) => {
          try {
            await queryClient.refetchQueries({ queryKey });
            addLog('info', `Refetch completado para: ${queryKey.join('.')}`);
          } catch (refetchError) {
            addLog('error', `Error en refetch: ${queryKey.join('.')}`, refetchError);
          }
        });
      }, 500);
    }
  });

  // Log del estado de la mutación cuando cambia (solo cambios importantes)
  useEffect(() => {
    // Solo loggear cambios de estado significativos, no el estado 'idle' inicial
    if (mutation.status !== 'idle') {
      addLog('info', 'Estado de mutación cambió', {
        status: mutation.status,
        isLoading: mutation.isPending,
        isError: mutation.isError,
        isSuccess: mutation.isSuccess,
        error: mutation.error?.message
      });
    }
  }, [mutation.status, mutation.isPending, mutation.isError, mutation.isSuccess]);

  // Función para obtener los logs
  const getLogs = () => operationLog;

  // Función para limpiar logs
  const clearLogs = () => setOperationLog([]);

  // Función para exportar logs
  const exportLogs = () => {
    const logsJson = JSON.stringify(operationLog, null, 2);
    const blob = new Blob([logsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mutation-logs-${mutationKey?.join('-') || 'unknown'}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    ...mutation,
    logs: operationLog,
    getLogs,
    clearLogs,
    exportLogs,
    addLog // Para logging personalizado desde componentes
  };
}

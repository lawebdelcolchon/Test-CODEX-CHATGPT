// src/contexts/CategoryEditModalContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';

// Crear el contexto
const CategoryEditModalContext = createContext();

// Provider del contexto
export function CategoryEditModalProvider({ children }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);

  // Handler para abrir el modal de edición
  const openEditModal = useCallback((category) => {
    console.log('🟢 CategoryEditModalContext: Abriendo modal para categoría:', category);
    setCategoryToEdit(category);
    setIsEditModalOpen(true);
  }, []);

  // Handler para cerrar el modal de edición
  const closeEditModal = useCallback(() => {
    console.log('🔴 CategoryEditModalContext: Cerrando modal de edición');
    setIsEditModalOpen(false);
    setCategoryToEdit(null);
  }, []);

  const contextValue = {
    isEditModalOpen,
    categoryToEdit,
    openEditModal,
    closeEditModal
  };

  return (
    <CategoryEditModalContext.Provider value={contextValue}>
      {children}
    </CategoryEditModalContext.Provider>
  );
}

// Hook personalizado para usar el contexto
export function useCategoryEditModal() {
  const context = useContext(CategoryEditModalContext);
  
  if (context === undefined) {
    throw new Error('useCategoryEditModal debe ser usado dentro de un CategoryEditModalProvider');
  }
  
  return context;
}

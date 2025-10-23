// src/components/GlobalCategoryEditModal.jsx
import React from 'react';
import { useCategoryEditModal } from '../contexts/CategoryEditModalContext.jsx';
import EditCategoryModal from './EditCategoryModal.jsx';

export default function GlobalCategoryEditModal() {
  const { isEditModalOpen, categoryToEdit, closeEditModal } = useCategoryEditModal();

  return (
    <EditCategoryModal
      isOpen={isEditModalOpen}
      onClose={closeEditModal}
      category={categoryToEdit}
      onSuccess={() => {
        console.log('✅ Categoría actualizada exitosamente desde el modal global');
        // El modal se cerrará automáticamente a través del contexto
        // No es necesario refrescar manualmente ya que
        // el hook useUpdateCategoryMutation se encarga de invalidar las queries
      }}
    />
  );
}

import React, { useState } from 'react';

const DeleteButton = ({ 
  onDelete, 
  disabled = false, 
  confirmMessage = '¿Estás seguro de que deseas eliminar este elemento?',
  className = '',
  children = 'Eliminar',
  showConfirm = true
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClick = async () => {
    if (showConfirm && !window.confirm(confirmMessage)) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete();
    } catch (error) {
      console.error('Error al eliminar:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isDeleting}
      className={`
        inline-flex items-center px-3 py-2 text-sm font-medium rounded-md
        text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 
        focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200 ${className}
      `}
    >
      {isDeleting ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Eliminando...
        </>
      ) : (
        <>
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          {children}
        </>
      )}
    </button>
  );
};

export default DeleteButton;

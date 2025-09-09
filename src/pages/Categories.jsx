// src/pages/Categories.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ContainerLayout from "../layouts/ContainerLayout.jsx";
import { useStatusBadge } from "../hooks/useStatusBadge.jsx";
import { categoriesActions } from "../store/slices/index.js";

// Componente separado para el StatusBadge
function StatusBadge({ isActive }) {
  return useStatusBadge(isActive, isActive ? "Activo" : "Inactivo");
}

export default function Categories() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state) => state.categories);

  useEffect(() => {
    // Cargar categorías al montar el componente
    if (status === 'idle') {
      dispatch(categoriesActions.fetchList());
    }
  }, [dispatch, status]);

  const columnsData = [
    {
      key: "name",
      label: "Categoría",
      accessor: "name",
      render: (row) => <span className="truncate">{row.name || "-"}</span>,
    },
    {
      key: "active",
      label: "Estado",
      accessor: "active",
      render: (row) => (
        <StatusBadge isActive={row.active} />
      ),
    },
    {
      key: "created_at",
      label: "Fecha de Creación",
      accessor: "created_at",
      render: (row) => row.created_at
        ? new Date(row.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })
        : "-",
    },
  ];

  return (
    <ContainerLayout
      entityName="categories"
      columnsData={columnsData}
      orderKeys={["Categoria", "Estado", "Fecha de Creación"]}
      reduxState={{ items, status, error }}
      emptyMessage="No se encontraron categorías"
    />
  );
}

// src/pages/Catetgories.jsx
import ContainerLayout from "../layouts/ContainerLayout.jsx";
import DataSet from "../mocks/options.json";
import { useStatusBadge } from "../hooks/useStatusBadge.jsx";

// Componente separado para el StatusBadge
function StatusBadge({ isActive }) {
  return useStatusBadge(isActive, isActive ? "Activo" : "Inactivo");
}

export default function Options() {

  const columnsData = [
    {
      key: "name",
      label: "Opción",
      accessor: "name",
      render: (row) => <span className="truncate">{row.name || "-"}</span>,
    },
    {
      key: "utilities",
      label: "Utilidades",
      accessor: "utilities",
      render: (row) => <span className="truncate">{row.utilities || "-"}</span>,
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
      entityName="options"
      columnsData={columnsData}
      orderKeys={["Opciones", "Estado", "Fecha de Creación"]}
      DataSet={DataSet}
      emptyMessage="No se encontraron opciones"
    />
  );
}

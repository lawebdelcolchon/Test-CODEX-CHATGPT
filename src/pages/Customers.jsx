// src/pages/Customers.jsx
import ContainerLayout from "../layouts/ContainerLayout.jsx";
import DataSet from "../mocks/customers.json";
import { useStatusBadge } from "../hooks/useStatusBadge.jsx";

// Componente separado para el StatusBadge de customers
function CustomerStatusBadge({ hasAccount }) {
  return useStatusBadge(hasAccount, hasAccount ? "Activo" : "Inactivo");
}

export default function Customers() {
  const getInitials = (row) => {
    if (!row) return "C";
    const first = row.first_name?.charAt(0).toUpperCase() || "";
    const last = row.last_name?.charAt(0).toUpperCase() || "";
    return first + last || "C";
  };

  const getAvatarColor = (row) => {
    const colors = ["bg-blue-500","bg-green-500","bg-purple-500","bg-pink-500","bg-indigo-500","bg-yellow-500","bg-red-500","bg-gray-500"];
    if (!row?.id) return colors[0];
    const index = row.id.toString().charCodeAt(row.id.toString().length - 1) % colors.length;
    return colors[index];
  };

  const columnsData = [
    {
      key: "avatar",
      label: "Cliente",
      accessor: "first_name", // Ordenar por nombre
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm ${getAvatarColor(row)}`}>
            {getInitials(row)}
          </div>
          <div>
            <div className="font-medium text-gray-900">{row.first_name} {row.last_name}</div>
            <div className="text-xs text-gray-500">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "company_name",
      label: "Empresa",
      accessor: "company_name",
      render: (row) => <span className="truncate">{row.company_name || "-"}</span>,
    },
    {
      key: "has_account",
      label: "Estado",
      accessor: "has_account",
      render: (row) => (
        <CustomerStatusBadge hasAccount={row.has_account} />
      ),
    },
    { 
      key: "phone", 
      label: "Teléfono", 
      accessor: "phone",
      render: (row) => row.phone || "-" 
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
      entityName="customers"
      columnsData={columnsData}
      orderKeys={["Cliente", "Empresa", "Estado", "Fecha de Creación"]}
      DataSet={DataSet}
      emptyMessage="No se encontraron clientes"
    />
  );
}

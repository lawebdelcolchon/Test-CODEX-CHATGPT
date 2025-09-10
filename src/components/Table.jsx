// src/components/Table.jsx
import React, { useState, useRef, useEffect } from "react";
import { Table } from "@medusajs/ui"
import { Button, DropdownMenu } from "@medusajs/ui";
import { EllipsisHorizontal, PencilSquare, } from "@medusajs/icons";
import { hasPermission } from "../utils/permissions.js";
import { useSelector } from "react-redux";

export default function DataTable({
  columns = [],
  data = [],
  onEdit,
  onDelete,
  onView,
  emptyMessage = "No hay datos para mostrar",
  requiredPermissions = [] // Array de permisos requeridos para editar/eliminar
 }) {

  const [openRowId, setOpenRowId] = useState(null); // ✅ Guardamos el ID del row abierto
  const dropdownRef = useRef(null);
  
  // Obtener usuario y verificar permisos
  const { user } = useSelector((state) => state.auth);
  const canEdit = hasPermission(user, requiredPermissions.length > 0 ? requiredPermissions : ['all']);
  const canDelete = hasPermission(user, requiredPermissions.length > 0 ? requiredPermissions : ['all']);
  const ActionsMenu = ({ row }) => (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="transparent"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            const newState = openRowId === row.id ? null : row.id;
            console.log("🔰 Nuevo estado:", newState);
            setOpenRowId(newState);
          }}
        >
          <EllipsisHorizontal />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        {canEdit && (
          <DropdownMenu.Item onClick={() => onEdit(row)}>
            <PencilSquare className="mr-2" />
            Editar
          </DropdownMenu.Item>
        )}
        {canEdit && canDelete && <DropdownMenu.Separator />}
        {canDelete && (
          <DropdownMenu.Item onClick={() => onDelete(row)} className="text-ui-fg-error">
            Eliminar
          </DropdownMenu.Item>
        )}
        {!canEdit && !canDelete && (
          <DropdownMenu.Item disabled>
            Sin permisos
          </DropdownMenu.Item>
        )}
      </DropdownMenu.Content>
    </DropdownMenu>
  );

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenRowId(null); // ✅ Cerramos si se hace clic afuera
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-auto">
      <Table>
        <Table.Header>
          <Table.Row >
            {columns.map((column) => (
              <Table.HeaderCell 
                key={column.key}
                className="h-10">
                {column.label}
              </Table.HeaderCell>
            ))}
            <Table.HeaderCell className="h-10"></Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data.map((row, index) => (
            <Table.Row key={row.id || index} className="hover:bg-ui-bg-base-hover cursor-pointer">
              {columns.map((column) => (
                <Table.Cell
                  key={column.key}
                  className="px-2 py-2 whitespace-nowrap"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(row);
                    setOpenRowId(openRowId === row.id ? null : row.id);
                  }}
                >
                  {column.render ? column.render(row) : row[column.key]}
                </Table.Cell>
              ))}
              <Table.Cell className="px-2 py-2 whitespace-nowrap text-right text-sm font-medium">

                <div className="relative" ref={dropdownRef}>
                  <ActionsMenu row={row} />
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>    
      </Table>
    </div>
  );
}

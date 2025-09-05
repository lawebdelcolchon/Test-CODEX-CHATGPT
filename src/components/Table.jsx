// src/components/Table.jsx
import React, { useState, useRef, useEffect } from "react";
import { Table } from "@medusajs/ui"
import { Button, DropdownMenu } from "@medusajs/ui";
import { EllipsisHorizontal, PencilSquare, } from "@medusajs/icons";

export default function DataTable({
  columns = [],
  data = [],
  onEdit,
  onDelete,
  onView,
  emptyMessage = "No hay datos para mostrar"
 }) {

  const [openRowId, setOpenRowId] = useState(null); // ✅ Guardamos el ID del row abierto
  const dropdownRef = useRef(null);
  const ActionsMenu = () => (
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
        <DropdownMenu.Item onClick={onEdit}>
          <PencilSquare className="mr-2" />
          Editar
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item onClick={onDelete} className="text-ui-fg-error">
          Eliminar
        </DropdownMenu.Item>
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
                  <ActionsMenu />
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>    
      </Table>
    </div>
  );
}

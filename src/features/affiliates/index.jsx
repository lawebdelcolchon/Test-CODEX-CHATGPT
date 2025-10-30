// src/features/affiliates/index.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge, Tabs } from "@medusajs/ui";
import DataLayout from "../../layouts/DataLayout.jsx";
import { hasPermission } from "../../utils/permissions.js";
import { useSelector } from "react-redux";
import {
  useAffiliateQuery,
  useDeleteAffiliateMutation,
  useAffiliateContactsQuery,
  useAffiliateZonesQuery,
  useDeleteContactMutation,
  useDeleteZoneMutation
} from "../../hooks/queries/useAffiliates.js";
import { formatDate } from "../../utils/formatters.js";

// Componente para la tabla de contactos
function ContactsTable({ contacts, affiliateId, onDelete }) {
  if (!contacts || contacts.length === 0) {
    return (
      <div className="text-center py-8 text-ui-fg-muted">
        No hay contactos registrados
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-ui-border-base">
            <th className="text-left p-3 text-ui-fg-subtle txt-compact-small-plus">Nombre</th>
            <th className="text-left p-3 text-ui-fg-subtle txt-compact-small-plus">Email</th>
            <th className="text-left p-3 text-ui-fg-subtle txt-compact-small-plus">Teléfono</th>
            <th className="text-left p-3 text-ui-fg-subtle txt-compact-small-plus">Cargo</th>
            <th className="text-center p-3 text-ui-fg-subtle txt-compact-small-plus">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr key={contact.id} className="border-b border-ui-border-base hover:bg-ui-bg-subtle">
              <td className="p-3 txt-compact-small">{contact.name || "-"}</td>
              <td className="p-3 txt-compact-small">{contact.email || "-"}</td>
              <td className="p-3 txt-compact-small">{contact.phone || "-"}</td>
              <td className="p-3 txt-compact-small">{contact.position || "-"}</td>
              <td className="p-3 text-center">
                <button
                  onClick={() => onDelete(contact.id)}
                  className="text-ui-fg-error hover:text-ui-fg-error-hover txt-compact-small"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Componente para la tabla de zonas
function ZonesTable({ zones, affiliateId, onDelete }) {
  if (!zones || zones.length === 0) {
    return (
      <div className="text-center py-8 text-ui-fg-muted">
        No hay zonas registradas
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-ui-border-base">
            <th className="text-left p-3 text-ui-fg-subtle txt-compact-small-plus">Nombre</th>
            <th className="text-left p-3 text-ui-fg-subtle txt-compact-small-plus">Código Postal</th>
            <th className="text-left p-3 text-ui-fg-subtle txt-compact-small-plus">Ciudad</th>
            <th className="text-left p-3 text-ui-fg-subtle txt-compact-small-plus">Provincia</th>
            <th className="text-center p-3 text-ui-fg-subtle txt-compact-small-plus">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {zones.map((zone) => (
            <tr key={zone.id} className="border-b border-ui-border-base hover:bg-ui-bg-subtle">
              <td className="p-3 txt-compact-small">{zone.name || "-"}</td>
              <td className="p-3 txt-compact-small">{zone.postal_code || "-"}</td>
              <td className="p-3 txt-compact-small">{zone.city || "-"}</td>
              <td className="p-3 txt-compact-small">{zone.province || "-"}</td>
              <td className="p-3 text-center">
                <button
                  onClick={() => onDelete(zone.id)}
                  className="text-ui-fg-error hover:text-ui-fg-error-hover txt-compact-small"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AffiliateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Obtener usuario y verificar permisos
  const { user } = useSelector((state) => state.auth);
  const canEdit = hasPermission(user, ['all', 'affiliates']);
  const canDelete = hasPermission(user, ['all', 'affiliates']);

  // Estado para la pestaña activa
  const [activeTab, setActiveTab] = useState("info");

  // Queries
  const {
    data: affiliate,
    isLoading: isAffiliateLoading,
    error: affiliateError,
  } = useAffiliateQuery(id);

  const {
    data: contactsResult,
    isLoading: isContactsLoading,
  } = useAffiliateContactsQuery(id);

  const {
    data: zonesResult,
    isLoading: isZonesLoading,
  } = useAffiliateZonesQuery(id);

  const contacts = contactsResult?.items || contactsResult || [];
  const zones = zonesResult?.items || zonesResult || [];

  // Mutations
  const deleteAffiliateMutation = useDeleteAffiliateMutation({
    onSuccess: (result, deletedId) => {
      if (String(deletedId) === String(id)) {
        navigate('/affiliates');
      }
    },
    onError: (error) => {
      alert('Error al eliminar el afiliado: ' + error.message);
    }
  });

  const deleteContactMutation = useDeleteContactMutation({
    onSuccess: () => {
      alert('Contacto eliminado exitosamente');
    },
    onError: (error) => {
      alert('Error al eliminar contacto: ' + error.message);
    }
  });

  const deleteZoneMutation = useDeleteZoneMutation({
    onSuccess: () => {
      alert('Zona eliminada exitosamente');
    },
    onError: (error) => {
      alert('Error al eliminar zona: ' + error.message);
    }
  });

  // Manejador para eliminar afiliado
  const handleDelete = async (entity) => {
    console.log('🗑️ Eliminando afiliado:', entity.id);
    return deleteAffiliateMutation.mutateAsync(entity.id);
  };

  // Manejador para eliminar contacto
  const handleDeleteContact = async (contactId) => {
    if (!confirm('¿Estás seguro de eliminar este contacto?')) return;
    return deleteContactMutation.mutateAsync({ affiliateId: id, contactId });
  };

  // Manejador para eliminar zona
  const handleDeleteZone = async (zoneId) => {
    if (!confirm('¿Estás seguro de eliminar esta zona?')) return;
    return deleteZoneMutation.mutateAsync({ affiliateId: id, zoneId });
  };

  // Custom handlers
  const customHandlers = {
    onEdit: () => {
      if (!canEdit) {
        console.warn('🚫 Usuario no tiene permisos para editar afiliados');
        alert('No tienes permisos para editar afiliados');
        return false;
      }
      navigate(`/affiliates/${id}/edit`);
      return false; // No abrir el drawer
    },
    onDelete: (entity) => {
      if (!canDelete) {
        console.warn('🚫 Usuario no tiene permisos para eliminar afiliados');
        alert('No tienes permisos para eliminar afiliados');
        return;
      }
      handleDelete(entity);
    }
  };

  // Render functions for DataLayout
  const renderHeader = ({ entity, ActionsMenu }) => {
    if (!entity) return null;
    
    return (
      <>
        <h1 className="font-sans font-medium h1-core">{entity.name}</h1>
      <div className="flex items-center gap-x-2">
        <Badge
          variant={entity.active ? "default" : "secondary"}
          size="small"
          className="txt-compact-xsmall-plus bg-ui-bg-subtle text-ui-fg-subtle border-ui-border-base box-border flex w-fit select-none items-center overflow-hidden rounded-md border pl-0 pr-1 leading-none"
        >
          <div className="flex items-center justify-center w-5 h-[18px] [&_div]:w-2 [&_div]:h-2 [&_div]:rounded-sm [&_div]:bg-ui-tag-green-icon">
            <div></div>
          </div>
          {entity.active ? "Activo" : "Inactivo"}
        </Badge>
        <ActionsMenu />
      </div>
    </>
    );
  };

  renderHeader.additionalRows = ({ entity }) => {
    if (!entity) return null;
    
    return (
    <>
      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <p className="font-medium font-sans txt-compact-small">ID</p>
        <p className="font-normal font-sans txt-compact-small">#{entity.id}</p>
      </div>
      
      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <p className="font-medium font-sans txt-compact-small">Email</p>
        <p className="font-normal font-sans txt-compact-small">{entity.email || "-"}</p>
      </div>

      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <p className="font-medium font-sans txt-compact-small">Teléfono</p>
        <p className="font-normal font-sans txt-compact-small">{entity.phone || "-"}</p>
      </div>

      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <p className="font-medium font-sans txt-compact-small">Empresa</p>
        <p className="font-normal font-sans txt-compact-small">{entity.company || "-"}</p>
      </div>

      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <p className="font-medium font-sans txt-compact-small">Fecha de Creación</p>
        <p className="font-normal font-sans txt-compact-small">
          {entity.created_at ? formatDate(entity.created_at) : "-"}
        </p>
      </div>
    </>
    );
  };

  const renderMainSections = ({ entity }) => {
    if (!entity) return null;
    
    return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Trigger value="info">Información General</Tabs.Trigger>
          <Tabs.Trigger value="contacts">
            Contactos ({contacts.length})
          </Tabs.Trigger>
          <Tabs.Trigger value="zones">
            Zonas ({zones.length})
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="info" className="mt-6">
          <div className="bg-ui-bg-subtle rounded-lg p-6 space-y-4">
            <h3 className="font-sans font-medium txt-large mb-4">Detalles del Afiliado</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-ui-fg-muted txt-compact-small mb-1">Nombre</p>
                <p className="txt-compact-medium">{entity.name || "-"}</p>
              </div>
              
              <div>
                <p className="text-ui-fg-muted txt-compact-small mb-1">Email</p>
                <p className="txt-compact-medium">{entity.email || "-"}</p>
              </div>
              
              <div>
                <p className="text-ui-fg-muted txt-compact-small mb-1">Teléfono</p>
                <p className="txt-compact-medium">{entity.phone || "-"}</p>
              </div>
              
              <div>
                <p className="text-ui-fg-muted txt-compact-small mb-1">Empresa</p>
                <p className="txt-compact-medium">{entity.company || "-"}</p>
              </div>
              
              <div>
                <p className="text-ui-fg-muted txt-compact-small mb-1">Dirección</p>
                <p className="txt-compact-medium">{entity.address || "-"}</p>
              </div>
              
              <div>
                <p className="text-ui-fg-muted txt-compact-small mb-1">Ciudad</p>
                <p className="txt-compact-medium">{entity.city || "-"}</p>
              </div>
              
              <div>
                <p className="text-ui-fg-muted txt-compact-small mb-1">Código Postal</p>
                <p className="txt-compact-medium">{entity.postal_code || "-"}</p>
              </div>
              
              <div>
                <p className="text-ui-fg-muted txt-compact-small mb-1">País</p>
                <p className="txt-compact-medium">{entity.country || "-"}</p>
              </div>
            </div>

            {entity.notes && (
              <div className="mt-4">
                <p className="text-ui-fg-muted txt-compact-small mb-1">Notas</p>
                <p className="txt-compact-medium whitespace-pre-wrap">{entity.notes}</p>
              </div>
            )}
          </div>
        </Tabs.Content>

        <Tabs.Content value="contacts" className="mt-6">
          <div className="bg-ui-bg-subtle rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-sans font-medium txt-large">Contactos</h3>
              {canEdit && (
                <button
                  onClick={() => navigate(`/affiliates/${id}/contacts/create`)}
                  className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover txt-compact-small"
                >
                  + Agregar Contacto
                </button>
              )}
            </div>
            
            {isContactsLoading ? (
              <div className="text-center py-8 text-ui-fg-muted">Cargando contactos...</div>
            ) : (
              <ContactsTable
                contacts={contacts}
                affiliateId={id}
                onDelete={handleDeleteContact}
              />
            )}
          </div>
        </Tabs.Content>

        <Tabs.Content value="zones" className="mt-6">
          <div className="bg-ui-bg-subtle rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-sans font-medium txt-large">Zonas</h3>
              {canEdit && (
                <button
                  onClick={() => navigate(`/affiliates/${id}/zones/create`)}
                  className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover txt-compact-small"
                >
                  + Agregar Zona
                </button>
              )}
            </div>
            
            {isZonesLoading ? (
              <div className="text-center py-8 text-ui-fg-muted">Cargando zonas...</div>
            ) : (
              <ZonesTable
                zones={zones}
                affiliateId={id}
                onDelete={handleDeleteZone}
              />
            )}
          </div>
        </Tabs.Content>
      </Tabs>
    </div>
    );
  };

  return (
    <DataLayout
      entityName="affiliates"
      entityPluralName="Afiliados"
      entity={affiliate}
      renderHeader={renderHeader}
      renderMainSections={renderMainSections}
      renderSidebar={() => null}
      customHandlers={customHandlers}
    />
  );
}

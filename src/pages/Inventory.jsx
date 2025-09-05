import React, { useEffect } from "react";
import Card from "../components/Card.jsx";


export default function Inventory() {
  return (
    <div className="space-y-4">
      <Card title="Inventario">
        <p className="text-gray-600">Página de Inventario (datos simulados).</p>
      </Card>
    </div>
  );
}

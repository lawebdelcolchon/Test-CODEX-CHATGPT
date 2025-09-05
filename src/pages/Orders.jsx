import React, { useEffect } from "react";
import Card from "../components/Card.jsx";
import Table from "../components/Table.jsx";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "../store/slices/ordersSlice.js";

export default function Orders() {
  const dispatch = useDispatch();
  const { items, status } = useSelector((s) => s.orders);
  useEffect(() => { dispatch(fetchOrders()); }, [dispatch]);

  return (
    <Card title="Pedidos">
      <Table
        columns={[
          { key: "id", title: "ID", dataIndex: "id" },
          { key: "customer", title: "Cliente", dataIndex: "customer_name" },
          { key: "status", title: "Estado", dataIndex: "status" },
          { key: "total", title: "Total", dataIndex: "total" }
        ]}
        data={items}
      />
      {status === "loading" && <div className="text-sm text-gray-500 mt-2">Cargando...</div>}
    </Card>
  );
}

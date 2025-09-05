import React, { useEffect } from "react";
import Card from "../components/Card.jsx";
import Table from "../components/Table.jsx";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "../store/slices/ordersSlice.js";
import { fetchProducts } from "../store/slices/productsSlice.js";

export default function Dashboard() {
  const dispatch = useDispatch();
  const orders = useSelector((s) => s.orders);
  const products = useSelector((s) => s.products);

  useEffect(() => {
    dispatch(fetchOrders({ pageSize: 5 }));
    dispatch(fetchProducts({ pageSize: 5 }));
  }, [dispatch]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card title="Últimos pedidos">
        <Table
          columns={[
            { key: "id", title: "ID", dataIndex: "id" },
            { key: "customer", title: "Cliente", dataIndex: "customer_name" },
            { key: "total", title: "Total", dataIndex: "total" }
          ]}
          data={orders.items}
        />
      </Card>
      <Card title="Productos recientes">
        <Table
          columns={[
            { key: "sku", title: "SKU", dataIndex: "sku" },
            { key: "name", title: "Nombre", dataIndex: "name" },
            { key: "stock", title: "Stock", dataIndex: "stock" }
          ]}
          data={products.items}
        />
      </Card>
    </div>
  );
}

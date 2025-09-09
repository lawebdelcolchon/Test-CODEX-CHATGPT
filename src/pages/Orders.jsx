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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      
    </div>
  );
}

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import Login from "./pages/Login.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Logout from "./pages/Logout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Products from "./pages/Products.jsx";
import Categories from "./pages/Categories.jsx";
import Attributes from "./pages/Attributes.jsx";
import Options from "./pages/Options.jsx";
import Orders from "./pages/Orders.jsx";
import Inventory from "./pages/Inventory.jsx";
import Suppliers from "./pages/Suppliers.jsx";
import Reserves from "./pages/Reserves.jsx";
import Inputs from "./pages/Inputs.jsx";
import PurchaseOrders from "./pages/PurchaseOrders.jsx";
import Customers from "./pages/Customers.jsx";
import CustomersIndex from "./features/customers/index.jsx";
import CustomersNew from "./features/customers/new.jsx";
import CategoriesIndex from "./features/categories/index.jsx";
import CategoriesNew from "./features/categories/new.jsx";
import AttributesIndex from "./features/attributes/index.jsx";
import AttributesNew from "./features/attributes/new.jsx";
import OptionsIndex from "./features/options/index.jsx";
import OptionsNew from "./features/options/new.jsx";
import CustomerGroups from "./pages/CustomerGroups.jsx";
import Campaigns from "./pages/Campaigns.jsx";
import PriceList from "./pages/PriceList.jsx";
import Settings from "./pages/Settings.jsx";
import Profile from "./pages/Profile.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
  return (
    <Routes>
      {/* Auth area */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/logout" element={<Logout />} />
      </Route>

      {/* App area */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        <Route path="attributes" element={<Attributes />} />
        <Route path="options" element={<Options />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="reserves" element={<Reserves />} />
        <Route path="inputs" element={<Inputs />} />
        <Route path="purchase-orders" element={<PurchaseOrders />} />
        <Route path="customers" element={<Customers />} />
        <Route path="customers/:id" element={<CustomersIndex />} />
        <Route path="customers/create" element={<CustomersNew />} />
        <Route path="categories/:id" element={<CategoriesIndex />} />
        <Route path="categories/create" element={<CategoriesNew />} />
        <Route path="attributes/:id" element={<AttributesIndex />} />
        <Route path="attributes/create" element={<AttributesNew />} />
        <Route path="options/:id" element={<OptionsIndex />} />
        <Route path="options/create" element={<OptionsNew />} />
        <Route path="customer-groups" element={<CustomerGroups />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="pricelist" element={<PriceList />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
}

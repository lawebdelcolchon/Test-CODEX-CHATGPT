import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import Login from "./pages/Login.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Logout from "./pages/Logout.jsx";
import Categories from "./pages/Categories.jsx";
import Attributes from "./pages/Attributes.jsx";
import Options from "./pages/Options.jsx";
import Inventory from "./pages/Inventory.jsx";
import Suppliers from "./pages/Suppliers.jsx";
import Reserves from "./pages/Reserves.jsx";
import Inputs from "./pages/Inputs.jsx";
import PurchaseOrders from "./pages/PurchaseOrders.jsx";
import Products from "./pages/Products.jsx";
import Stores from "./pages/Stores.jsx";
import AdminAccounts from "./pages/AdminAccounts.jsx";
import Clients from "./pages/Clients.jsx";
import CategoriesIndex from "./features/categories/index.jsx";
import CategoriesNew from "./features/categories/new.jsx";
import AttributesIndex from "./features/attributes/index.jsx";
import AttributesNew from "./features/attributes/new.jsx";
import OptionsIndex from "./features/options/index.jsx";
import OptionsNew from "./features/options/new.jsx";
import ProductsIndex from "./features/products/index.jsx";
import ProductsCreate from "./features/products/create.jsx";
import ProductsEdit from "./features/products/edit.jsx";
import StoresIndex from "./features/stores/index.jsx";
import StoresCreate from "./features/stores/create.jsx";
import StoresEdit from "./features/stores/edit.jsx";
import ClientsIndex from "./features/clients/index.jsx";
import ClientsCreate from "./features/clients/create_new.jsx";
import ClientsEdit from "./features/clients/edit.jsx";
import AdminAccountDetail from "./features/admin_accounts/index.jsx";
import AdminAccountsCreate from "./features/admin_accounts/create.jsx";
import AdminAccountsEdit from "./features/admin_accounts/edit.jsx";
import Marketplace from "./pages/Marketplace.jsx";
import MarketplaceIndex from "./features/marketplace/index.jsx";
import MarketplaceCreate from "./features/marketplace/create.jsx";
import MarketplaceEdit from "./features/marketplace/edit.jsx";
import SuppliersIndex from "./features/suppliers/index.jsx";
import SuppliersCreate from "./features/suppliers/create.jsx";
import SuppliersEdit from "./features/suppliers/edit.jsx";
import CustomerGroups from "./pages/CustomerGroups.jsx";
import Campaigns from "./pages/Campaigns.jsx";
import PriceList from "./pages/PriceList.jsx";
import Settings from "./pages/Settings.jsx";
import Profile from "./pages/Profile.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import GlobalCategoryEditModal from "./components/GlobalCategoryEditModal.jsx";

export default function App() {
  return (
    <>
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
        <Route index element={<Navigate to="/categories" />} />
        
        {/* Admin Accounts Management Routes - Moved to top to avoid conflicts */}
        <Route path="admin-accounts" element={<AdminAccounts />} />
        <Route path="admin-accounts/create" element={<AdminAccountsCreate />} />
        <Route path="admin-accounts/:id/edit" element={<AdminAccountsEdit />} />
        <Route path="admin-accounts/:id" element={<AdminAccountDetail />} />
        
        {/* Products Management Routes */}
        <Route path="products" element={<Products />} />
        <Route path="products/create" element={<ProductsCreate />} />
        <Route path="products/:id/edit" element={<ProductsEdit />} />
        <Route path="products/:id" element={<ProductsIndex />} />
        
        {/* Stores Management Routes */}
        <Route path="stores" element={<Stores />} />
        <Route path="stores/create" element={<StoresCreate />} />
        <Route path="stores/:id/edit" element={<StoresEdit />} />
        <Route path="stores/:id" element={<StoresIndex />} />
        
        {/* Clients Management Routes */}
        <Route path="clients" element={<Clients />} />
        <Route path="clients/create" element={<ClientsCreate />} />
        <Route path="clients/:id/edit" element={<ClientsEdit />} />
        <Route path="clients/:id" element={<ClientsIndex />} />
        
        {/* Marketplace Management Routes */}
        <Route path="marketplace" element={<Marketplace />} />
        <Route path="marketplace/create" element={<MarketplaceCreate />} />
        <Route path="marketplace/:id/edit" element={<MarketplaceEdit />} />
        <Route path="marketplace/:id" element={<MarketplaceIndex />} />
        
        {/* Suppliers Management Routes */}
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="suppliers/create" element={<SuppliersCreate />} />
        <Route path="suppliers/:id/edit" element={<SuppliersEdit />} />
        <Route path="suppliers/:id" element={<SuppliersIndex />} />
        
        {/* Categories Management Routes */}
        <Route path="categories" element={<Categories />} />
        <Route path="categories/create" element={<Navigate to="/categories" replace />} />
        <Route path="categories/:id" element={<CategoriesIndex />} />
        
        {/* Attributes Management Routes */}
        <Route path="attributes" element={<Attributes />} />
        <Route path="attributes/create" element={<AttributesNew />} />
        <Route path="attributes/:id" element={<AttributesIndex />} />
        
        {/* Options Management Routes */}
        <Route path="options" element={<Options />} />
        <Route path="options/create" element={<OptionsNew />} />
        <Route path="options/:id" element={<OptionsIndex />} />
        
        {/* Other Routes */}
        <Route path="inventory" element={<Inventory />} />
        <Route path="reserves" element={<Reserves />} />
        <Route path="inputs" element={<Inputs />} />
        <Route path="purchase-orders" element={<PurchaseOrders />} />
        <Route path="customer-groups" element={<CustomerGroups />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="pricelist" element={<PriceList />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
      </Routes>
      
      {/* Modal global de edición de categorías */}
      <GlobalCategoryEditModal />
    </>
  );
}

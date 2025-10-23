import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from "./App.jsx";
import { CategoryEditModalProvider } from "./contexts/CategoryEditModalContext.jsx";
import "./styles.css";
import './index.css';
import { store } from "./store/index.js";

// Configurar TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Debug helpers (solo en desarrollo)
if (import.meta.env.DEV) {
  import('./utils/updatePermissions.js');
  import('./utils/permissions.js'); // Sistema de permisos
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <CategoryEditModalProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </CategoryEditModalProvider>
      </Provider>
    </QueryClientProvider>
  </React.StrictMode>
);

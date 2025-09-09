import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import App from "./App.jsx";
import "./styles.css";
import './index.css';
import { store } from "./store/index.js";

// Debug helpers (solo en desarrollo)
if (import.meta.env.DEV) {
  import('./utils/debugAuth.js');
  import('./utils/updatePermissions.js');
  import('./utils/permissions.js'); // Sistema de permisos
  import('./utils/tokenDebug.js'); // Debug específico del token
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);

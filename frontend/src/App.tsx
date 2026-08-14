import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { PosPage } from "./pages/PosPage";
import { ActiveOrdersPage } from "./pages/ActiveOrdersPage";
import { HistoryPage } from "./pages/HistoryPage";
import { MenuPage } from "./pages/MenuPage";
import { SalesPage } from "./pages/SalesPage";
import { InventoryPage } from "./pages/InventoryPage";

// All pages of the application and who is allowed to open them.

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Everything below needs a login. Layout draws the top bar. */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Navigate to="/pos" replace />} />
              <Route path="/pos" element={<PosPage />} />
              <Route path="/orders" element={<ActiveOrdersPage />} />
              <Route path="/history" element={<HistoryPage />} />

              {/* Owner only. */}
              <Route
                path="/menu"
                element={
                  <ProtectedRoute adminOnly>
                    <MenuPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sales"
                element={
                  <ProtectedRoute adminOnly>
                    <SalesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inventory"
                element={
                  <ProtectedRoute adminOnly>
                    <InventoryPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Unknown address: back to the POS. */}
            <Route path="*" element={<Navigate to="/pos" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Layout from "./components/layout/Layout";
import SettingsLayout from "./components/layout/SettingsLayout";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Metas from "./pages/Metas";
import Tools from "./pages/Tools";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />

          {/* Protected — main layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="movimientos" element={<Transactions />} />
            <Route path="metas" element={<Metas />} />
            <Route path="herramientas" element={<Tools />} />
          </Route>

          {/* Protected — settings layout */}
          <Route
            path="/configuracion"
            element={
              <ProtectedRoute>
                <SettingsLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Settings />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

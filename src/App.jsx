import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
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
  const [dark, setDark] = useState(
    () => localStorage.getItem("theme") === "dark",
  );

  // Sync when the html class changes (toggled from Settings)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        closeButton
        theme={dark ? "dark" : "light"}
        toastOptions={{
          style: {
            fontFamily: "Manrope, sans-serif",
            borderRadius: "1rem",
            fontSize: "0.8125rem",
            fontWeight: "600",
          },
        }}
      />
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

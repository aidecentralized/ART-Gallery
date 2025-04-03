// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Layout component
import MainLayout from "./components/layout/MainLayout";

// Pages
import HomePage from "./components/pages/home/HomePage";
import ExplorerPage from "./components/pages/explorer/ExplorerPage";
import ServerDetailPage from "./components/pages/server/ServerDetailPage";
import RegistryPage from "./components/pages/registry/RegistryPage";
import LoginPage from "./components/pages/auth/LoginPage";
import RegisterPage from "./components/pages/auth/RegisterPage";
import DashboardPage from "./components/pages/dashboard/DashboardPage";
import NotFoundPage from "./components/pages/NotFoundPage";

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading-centered">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            {/* Public routes */}
            <Route index element={<HomePage />} />
            <Route path="explorer" element={<ExplorerPage />} />
            <Route path="servers/:id" element={<ServerDetailPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />

            {/* Protected routes */}
            <Route
              path="registry"
              element={
                <ProtectedRoute>
                  <RegistryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="dashboard/*"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="servers/:id/edit"
              element={
                <ProtectedRoute>
                  <RegistryPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback route */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;

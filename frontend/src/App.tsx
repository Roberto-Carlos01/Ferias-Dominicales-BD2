import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { FeriasPage } from './pages/public/FeriasPage';
import { FeriaDetailPage } from './pages/public/FeriaDetailPage';
import { UbicacionesPage } from './pages/public/UbicacionesPage';
import { ProductosPage } from './pages/public/ProductosPage';
import { EstadisticasPage } from './pages/public/EstadisticasPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Exhibitor Pages
import { PerfilExpositorPage } from './pages/expositor/PerfilExpositorPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminFeriasPage } from './pages/admin/AdminFeriasPage';
import { AdminUsuariosPage } from './pages/admin/AdminUsuariosPage';
import { AdminExpositoresPage } from './pages/admin/AdminExpositoresPage';
import { AdminProductosPage } from './pages/admin/AdminProductosPage';
import { AdminInstitucionesPage } from './pages/admin/AdminInstitucionesPage';
import { AdminPatrocinadoresPage } from './pages/admin/AdminPatrocinadoresPage';
import { AdminOrganizadoresPage } from './pages/admin/AdminOrganizadoresPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/ferias" element={<FeriasPage />} />
              <Route path="/ferias/:id" element={<FeriaDetailPage />} />
              <Route path="/ubicaciones" element={<UbicacionesPage />} />
              <Route path="/productos" element={<ProductosPage />} />
              <Route path="/estadisticas" element={<EstadisticasPage />} />

              {/* Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/registro" element={<RegisterPage />} />

              {/* Exhibitor Private Area */}
              <Route
                path="/mis-participaciones"
                element={
                  <ProtectedRoute>
                    <PerfilExpositorPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/ferias"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminFeriasPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/usuarios"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminUsuariosPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/expositores"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminExpositoresPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/productos"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminProductosPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/instituciones"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminInstitucionesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/patrocinadores"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminPatrocinadoresPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/organizadores"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminOrganizadoresPage />
                  </ProtectedRoute>
                }
              />

              {/* 404 Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;

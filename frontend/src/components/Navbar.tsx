import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  MapPin,
  Package,
  BarChart3,
  User,
  Shield,
  LogOut,
  LogIn,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, isExpositor, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="glass-header">
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1, #f59e0b)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)'
          }}>
            <Sparkles size={22} />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff', letterSpacing: '-0.02em', display: 'block' }}>
              Ferias<span style={{ color: '#f59e0b' }}>Dominicales</span>
            </span>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginTop: '-2px' }}>
              La Paz • Cultura y Comercio
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div style={{ display: 'none', gap: '1.75rem', alignItems: 'center' }} className="desktop-links">
          <Link to="/ferias" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#cbd5e1', fontSize: '0.92rem', fontWeight: 500 }}>
            <Calendar size={16} /> Catálogo de Ferias
          </Link>
          <Link to="/ubicaciones" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#cbd5e1', fontSize: '0.92rem', fontWeight: 500 }}>
            <MapPin size={16} /> Recintos Feriales
          </Link>
          <Link to="/estadisticas" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#cbd5e1', fontSize: '0.92rem', fontWeight: 500 }}>
            <BarChart3 size={16} /> Métricas y Estadísticas
          </Link>
        </div>

        {/* User / Auth Section */}
        <div style={{ display: 'none', alignItems: 'center', gap: '0.85rem' }} className="desktop-auth">
          {isAuthenticated ? (
            <>
              {isExpositor && (
                <Link to="/mis-participaciones" className="btn btn-secondary btn-sm" style={{ borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fcd34d' }}>
                  <User size={14} /> Mis Participaciones
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" className="btn btn-primary btn-sm" style={{ background: 'linear-gradient(135deg, #4f46e5, #9333ea)' }}>
                  <Shield size={14} /> Panel Admin
                </Link>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.3rem 0.75rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '9999px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 500 }}>
                  {user?.correo}
                </span>
                <span className={`badge ${isAdmin ? 'badge-warning' : isExpositor ? 'badge-success' : 'badge-primary'}`} style={{ padding: '0.15rem 0.45rem', fontSize: '0.65rem' }}>
                  {isAdmin ? 'ADMIN' : isExpositor ? 'EXPOSITOR' : 'USUARIO'}
                </span>
              </div>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm" title="Cerrar sesión" style={{ padding: '0.4rem 0.6rem' }}>
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">
                <LogIn size={15} /> Iniciar Sesión
              </Link>
              <Link to="/registro" className="btn btn-primary btn-sm">
                Registrarse
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex' }}
          className="mobile-btn"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{ padding: '1rem 1.5rem', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link to="/ferias" onClick={() => setMobileMenuOpen(false)} style={{ color: '#cbd5e1' }}>Catálogo de Ferias</Link>
          <Link to="/ubicaciones" onClick={() => setMobileMenuOpen(false)} style={{ color: '#cbd5e1' }}>Recintos Feriales</Link>
          <Link to="/estadisticas" onClick={() => setMobileMenuOpen(false)} style={{ color: '#cbd5e1' }}>Métricas y Estadísticas</Link>
          <div style={{ height: '1px', background: 'var(--border)', margin: '0.5rem 0' }} />
          {isAuthenticated ? (
            <>
              {isExpositor && (
                <Link to="/mis-participaciones" onClick={() => setMobileMenuOpen(false)} style={{ color: '#fcd34d' }}>
                  Mis Participaciones
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} style={{ color: '#818cf8' }}>
                  Panel Admin
                </Link>
              )}
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{user?.correo}</div>
              <button onClick={handleLogout} className="btn btn-danger btn-sm" style={{ width: '100%' }}>
                Cerrar Sesión
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                Ingresar
              </Link>
              <Link to="/registro" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                Registrarse
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Responsive media query helper via inline style element */}
      <style>{`
        @media (min-width: 768px) {
          .desktop-links { display: flex !important; }
          .desktop-auth { display: flex !important; }
          .mobile-btn { display: none !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;

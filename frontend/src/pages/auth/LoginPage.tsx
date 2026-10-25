import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn, Sparkles, AlertCircle, Shield, CheckCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(correo, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Error al iniciar sesión:', err);
      const msg = err.response?.data?.message || 'Credenciales inválidas o usuario inactivo';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFillAdmin = () => {
    setCorreo('admin@ferias.gob.bo');
    setPassword('Admin1234!');
  };

  return (
    <div style={{ maxWidth: '440px', margin: '4rem auto', padding: '0 1rem', width: '100%' }}>
      <div className="glass-card animate-fade-in" style={{ padding: '2.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1, #f59e0b)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            marginBottom: '1rem',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
          }}>
            <LogIn size={24} />
          </div>
          <h2 style={{ fontSize: '1.75rem', color: '#fff', marginBottom: '0.4rem' }}>
            Iniciar Sesión
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Ingresa a tu cuenta de Ferias Dominicales
          </p>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.75rem 1rem',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#fca5a5',
            fontSize: '0.88rem',
            marginBottom: '1.5rem',
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="input-label">Correo Electrónico</label>
            <input
              type="email"
              required
              placeholder="tu@correo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label className="input-label" style={{ margin: 0 }}>Contraseña</label>
            </div>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem' }}
          >
            {loading ? 'Validando...' : 'Entrar al Sistema'}
          </button>
        </form>

        {/* Quick Fill Credentials Helper */}
        <div style={{ marginTop: '1.75rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.6rem', textAlign: 'center' }}>
            Credenciales de prueba rápida:
          </div>
          <button
            type="button"
            onClick={handleQuickFillAdmin}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.8rem' }}
          >
            <Shield size={14} style={{ color: '#f59e0b' }} /> Autocompletar Administrador (admin@ferias.gob.bo)
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>
          ¿No tienes una cuenta?{' '}
          <Link to="/registro" style={{ color: '#818cf8', fontWeight: 500 }}>
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

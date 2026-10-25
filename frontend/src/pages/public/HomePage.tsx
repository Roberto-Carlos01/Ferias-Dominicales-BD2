import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import {
  Calendar,
  MapPin,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Package,
  Users,
  Search,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [recentFerias, setRecentFerias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, feriasRes] = await Promise.all([
          apiClient.get('/dashboard/stats'),
          apiClient.get('/ferias?limit=6'),
        ]);
        setStats(statsRes.data);
        setRecentFerias(feriasRes.data.data || []);
      } catch (err) {
        console.error('Error cargando datos de inicio:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.5rem', width: '100%' }}>
      {/* Hero Section */}
      <section style={{ textAlign: 'center', padding: '3.5rem 1rem 4.5rem', position: 'relative' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 1rem',
          borderRadius: '9999px',
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          color: '#a5b4fc',
          fontSize: '0.85rem',
          fontWeight: 500,
          marginBottom: '1.5rem',
        }}>
          <Sparkles size={16} style={{ color: '#f59e0b' }} />
          Plataforma Oficial de Ferias Dominicales de La Paz
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          fontWeight: 800,
          lineHeight: 1.15,
          color: '#ffffff',
          marginBottom: '1.25rem',
          letterSpacing: '-0.03em',
        }}>
          Cultura, Tradición y <br />
          <span style={{
            background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f59e0b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Emprendimiento Paceño
          </span>
        </h1>

        <p style={{
          maxWidth: '680px',
          margin: '0 auto 2.5rem',
          fontSize: '1.15rem',
          color: '#94a3b8',
          lineHeight: 1.6,
        }}>
          Explora los stands, artesanos, productores y eventos culturales que dan vida a los
          espacios feriales dominicales en el corazón de nuestra ciudad.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/ferias" className="btn btn-primary" style={{ padding: '0.8rem 1.75rem', fontSize: '1rem' }}>
            Explorar Ferias <ArrowRight size={18} />
          </Link>
          <Link to="/estadisticas" className="btn btn-secondary" style={{ padding: '0.8rem 1.75rem', fontSize: '1rem' }}>
            <TrendingUp size={18} /> Ver Estadísticas
          </Link>
        </div>
      </section>

      {/* Metrics Grid */}
      <section style={{ marginBottom: '4.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ color: '#818cf8', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
              <Calendar size={28} />
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: 700, color: '#fff' }}>
              {stats?.totalFerias ?? (loading ? '...' : 0)}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Ferias Registradas</div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ color: '#10b981', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
              <Sparkles size={28} />
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: 700, color: '#10b981' }}>
              {stats?.feriasActivas ?? (loading ? '...' : 0)}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Ferias en Curso / Activas</div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ color: '#f59e0b', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
              <Users size={28} />
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: 700, color: '#fff' }}>
              {stats?.totalExpositores ?? (loading ? '...' : 0)}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Expositores Participantes</div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ color: '#0ea5e9', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
              <Package size={28} />
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: 700, color: '#fff' }}>
              {stats?.totalProductos ?? (loading ? '...' : 0)}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Productos Ofrecidos</div>
          </div>
        </div>
      </section>

      {/* Featured Ferias Section */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.85rem', color: '#fff', marginBottom: '0.35rem' }}>Ferias Destacadas</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
              Consulta las ferias dominicales activas y programadas en la ciudad
            </p>
          </div>
          <Link to="/ferias" className="btn btn-secondary btn-sm">
            Ver todas <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            Cargando ferias...
          </div>
        ) : recentFerias.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            No hay ferias registradas actualmente.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {recentFerias.map((f) => (
              <div
                key={f.idFeria}
                className="glass-card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                    <span className={`badge ${f.estado === 'ACTIVA' ? 'badge-success' : 'badge-primary'}`}>
                      {f.estado || 'PLANIFICADA'}
                    </span>
                    <span className="badge badge-info">{f.tipo || 'CULTURAL'}</span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.6rem' }}>
                    {f.nombre}
                  </h3>

                  <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '1.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {f.descripcion || 'Sin descripción disponible.'}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                    <Calendar size={15} style={{ color: '#818cf8' }} />
                    <span>{f.fechaInicio} al {f.fechaFin}</span>
                  </div>

                  {f.ubicacion && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '1rem' }}>
                      <MapPin size={15} style={{ color: '#f59e0b' }} />
                      <span>{f.ubicacion.nombre} ({f.ubicacion.zona})</span>
                    </div>
                  )}

                  <Link to={`/ferias/${f.idFeria}`} className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: '0.5rem' }}>
                    Ver Stands y Expositores <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Info Callout Section */}
      <section className="glass-card" style={{ padding: '2.5rem', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))' }}>
        <div style={{ maxWidth: '700px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontWeight: 600, marginBottom: '0.5rem' }}>
            <ShieldCheck size={20} />
            <span>¿Deseas participar como Expositor?</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', color: '#fff', marginBottom: '0.75rem' }}>
            Crea tu cuenta de usuario y solicita tu acreditación
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Los usuarios pueden registrarse gratuitamente en la plataforma. Una vez creada tu cuenta,
            los administradores vinculan tu perfil a un registro oficial de expositor con tu CI para asignarte
            stands y productos en las ferias activas.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/registro" className="btn btn-primary btn-sm">
              Crear Cuenta Gratis
            </Link>
            <Link to="/login" className="btn btn-secondary btn-sm">
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

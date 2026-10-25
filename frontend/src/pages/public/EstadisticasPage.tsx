import React, { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import {
  Calendar,
  Sparkles,
  Users,
  Building,
  Package,
  Store,
  Clock,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export const EstadisticasPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiClient.get('/dashboard/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Error cargando estadísticas:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.5rem', width: '100%' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '0.5rem' }}>
          Métricas y Estadísticas del Sistema
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.05rem' }}>
          Resumen consolidado de la actividad ferial, participación ciudadana y desarrollo económico en La Paz
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
          Cargando métricas...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>Total de Ferias</span>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
                <Calendar size={20} />
              </div>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
              {stats?.totalFerias || 0}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#10b981' }}>
              {stats?.feriasActivas || 0} ferias actualmente activas
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>Próximas Ferias</span>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                <Clock size={20} />
              </div>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
              {stats?.feriasProximas || 0}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Programadas en el calendario
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>Expositores Oficiales</span>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                <Users size={20} />
              </div>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
              {stats?.totalExpositores || 0}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Artesanos, productores y gestores
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>Total de Stands</span>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(14, 165, 233, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9' }}>
                <Store size={20} />
              </div>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
              {stats?.totalStands || 0}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Puestos de exhibición y venta
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>Productos Catalogados</span>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc' }}>
                <Package size={20} />
              </div>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
              {stats?.totalProductos || 0}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Obras de arte, alimentos y manufacturas
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>Instituciones & Aliados</span>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(236, 72, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f472b6' }}>
                <Building size={20} />
              </div>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
              {stats?.totalInstituciones || 0}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Organizadores y empresas patrocinadoras
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EstadisticasPage;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import {
  Calendar,
  Users,
  Store,
  Package,
  Building,
  UserCheck,
  Shield,
  ArrowRight,
  TrendingUp,
  Award,
  Building2,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiClient.get('/dashboard/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Error cargando stats de admin:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const adminModules = [
    {
      title: 'Gestión de Ferias',
      desc: 'Crear, editar fechas, estados, recintos y supervisar stands de ferias dominicales.',
      icon: <Calendar size={24} style={{ color: '#818cf8' }} />,
      link: '/admin/ferias',
      count: stats?.totalFerias ?? 0,
      label: 'Ferias',
    },
    {
      title: 'Usuarios y Acceso',
      desc: 'Administrar roles (ADMIN/USUARIO), estados y convertir usuarios en expositores.',
      icon: <UserCheck size={24} style={{ color: '#10b981' }} />,
      link: '/admin/usuarios',
      count: stats?.totalUsuarios ?? 0,
      label: 'Usuarios',
    },
    {
      title: 'Gestión de Expositores',
      desc: 'Acreditar artesanos y consultar su historial de participación en múltiples ferias.',
      icon: <Users size={24} style={{ color: '#f59e0b' }} />,
      link: '/admin/expositores',
      count: stats?.totalExpositores ?? 0,
      label: 'Expositores',
    },
    {
      title: 'Catálogo de Productos',
      desc: 'Registrar productos, asignación de precios y consultar disponibilidad en stands.',
      icon: <Package size={24} style={{ color: '#c084fc' }} />,
      link: '/admin/productos',
      count: stats?.totalProductos ?? 0,
      label: 'Productos',
    },
    {
      title: 'Patrocinadores y Auspicios',
      desc: 'Asignar patrocinios por feria, tipo de apoyo (económico/logístico) y montos en Bs.',
      icon: <Award size={24} style={{ color: '#f59e0b' }} />,
      link: '/admin/patrocinadores',
      count: 'Auspicios',
      label: 'Convenios',
    },
    {
      title: 'Organizadores de Ferias',
      desc: 'Vincular instituciones organizadoras a cada feria y asignar roles de gestión.',
      icon: <Building2 size={24} style={{ color: '#0ea5e9' }} />,
      link: '/admin/organizadores',
      count: 'Comités',
      label: 'Roles',
    },
    {
      title: 'Directorio de Instituciones',
      desc: 'Base de datos central de empresas, alcaldías, asociaciones y entidades con NIT.',
      icon: <Building size={24} style={{ color: '#64748b' }} />,
      link: '/admin/instituciones',
      count: stats?.totalInstituciones ?? 0,
      label: 'Instituciones',
    },
  ];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.5rem', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span className="badge badge-warning">Área Restringida</span>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Panel de Control Central</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', color: '#fff' }}>Panel Administrativo</h1>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/ferias" className="btn btn-secondary btn-sm">
            Ver Portal Público
          </Link>
        </div>
      </div>

      {/* Modules Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {adminModules.map((m, idx) => (
          <Link
            key={idx}
            to={m.link}
            className="glass-card"
            style={{
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {m.icon}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff' }}>
                    {loading ? '...' : m.count}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                    {m.label}
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '0.5rem' }}>
                {m.title}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                {m.desc}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#818cf8', fontSize: '0.9rem', fontWeight: 600, borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <span>Administrar módulo</span>
              <ArrowRight size={16} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboardPage;

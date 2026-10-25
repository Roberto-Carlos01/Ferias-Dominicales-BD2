import React, { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Calendar,
  Store,
  Package,
  Sparkles,
  Info,
  Clock,
  MapPin,
  Shield,
  Building,
} from 'lucide-react';

export const PerfilExpositorPage: React.FC = () => {
  const { user } = useAuth();
  const [participaciones, setParticipaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParticipaciones = async () => {
      try {
        const res = await apiClient.get('/me/participaciones');
        setParticipaciones(res.data.data || []);
      } catch (err) {
        console.error('Error cargando participaciones:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipaciones();
  }, []);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.5rem', width: '100%' }}>
      {/* Exhibitor Profile Card */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2.5rem', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.95))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #f59e0b, #6366f1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 0 20px rgba(245, 158, 11, 0.3)'
          }}>
            <User size={32} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
              <h1 style={{ fontSize: '1.75rem', color: '#fff', margin: 0 }}>
                {user?.expositor ? `${user.expositor.nombre} ${user.expositor.paterno || ''}` : user?.correo}
              </h1>
              <span className="badge badge-warning">Expositor Oficial</span>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', color: '#94a3b8', fontSize: '0.9rem', flexWrap: 'wrap' }}>
              {user?.ciExpositor && (
                <div>CI: <strong style={{ color: '#fff' }}>{user.ciExpositor}</strong></div>
              )}
              <div>Correo de Cuenta: <strong style={{ color: '#fff' }}>{user?.correo}</strong></div>
              {user?.expositor?.telefono && (
                <div>Teléfono: <strong style={{ color: '#fff' }}>{user.expositor.telefono}</strong></div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Participations Title */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', color: '#fff', marginBottom: '0.35rem' }}>
          Mis Participaciones en Ferias
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
          Historial y stands asignados donde presentas tus productos o exposiciones
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
          Cargando participaciones...
        </div>
      ) : !user?.ciExpositor ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <Info size={40} style={{ color: '#f59e0b', marginBottom: '1rem' }} />
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Cuenta sin Expositor Asociado</h3>
          <p style={{ color: '#94a3b8', maxWidth: '540px', margin: '0 auto', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Tu cuenta actualmente opera como <strong>Usuario General</strong>. Para habilitarte como expositor,
            un administrador debe vincular tu CI oficial en el panel de usuarios.
          </p>
        </div>
      ) : participaciones.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <Store size={40} style={{ color: '#818cf8', marginBottom: '1rem' }} />
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Sin Participaciones Asignadas</h3>
          <p style={{ color: '#94a3b8', maxWidth: '500px', margin: '0 auto' }}>
            Actualmente tu perfil de expositor (CI {user.ciExpositor}) no cuenta con stands asignados en ferias activas.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {participaciones.map((p, index) => (
            <div key={index} className="glass-card" style={{ padding: '2rem' }}>
              {/* Feria info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span className="badge badge-success">{p.feria?.estado || 'ACTIVA'}</span>
                    <span className="badge badge-info">{p.feria?.tipo || 'CULTURAL'}</span>
                  </div>
                  <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '0.35rem' }}>
                    {p.feria?.nombre}
                  </h3>
                  <div style={{ display: 'flex', gap: '1.25rem', color: '#94a3b8', fontSize: '0.88rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={15} style={{ color: '#818cf8' }} /> {p.feria?.fechaInicio} al {p.feria?.fechaFin}
                    </span>
                    {p.ubicacion && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <MapPin size={15} style={{ color: '#f59e0b' }} /> {p.ubicacion.nombre} ({p.ubicacion.zona})
                      </span>
                    )}
                  </div>
                </div>

                {/* Stand Badge */}
                <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#a5b4fc', textTransform: 'uppercase' }}>Stand Asignado</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fff' }}>#{p.stand?.numero}</div>
                  <div style={{ fontSize: '0.8rem', color: '#f59e0b' }}>Rol: {p.cargo || 'Responsable'}</div>
                </div>
              </div>

              {/* Products offered in this participation */}
              <div style={{ marginBottom: '1.75rem' }}>
                <h4 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Package size={17} style={{ color: '#10b981' }} /> Productos en exhibición / venta en este stand
                </h4>
                {p.productos && p.productos.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                    {p.productos.map((prod: any, idx: number) => (
                      <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                          <span style={{ fontWeight: 600, color: '#fff' }}>{prod.nombre}</span>
                          <span style={{ color: '#10b981', fontWeight: 700 }}>BOB {Number(prod.precio).toFixed(2)}</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                          Stock: <strong>{prod.stock}</strong> ({prod.unidadMedida || 'unidad'})
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.88rem', color: '#64748b', fontStyle: 'italic' }}>
                    No hay productos asociados registrados en este stand.
                  </div>
                )}
              </div>

              {/* Exhibitions */}
              {p.exposiciones && p.exposiciones.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Sparkles size={17} style={{ color: '#f59e0b' }} /> Exposiciones programadas
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {p.exposiciones.map((expo: any, idx: number) => (
                      <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                        <div style={{ fontWeight: 600, color: '#fff', marginBottom: '0.25rem' }}>{expo.titulo}</div>
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{expo.descripcion}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PerfilExpositorPage;

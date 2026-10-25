import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../../api/client';
import {
  Calendar,
  MapPin,
  Clock,
  Package,
  Users,
  Store,
  Sparkles,
  Building,
  Award,
  ArrowLeft,
  Tag,
  Crown,
  Search,
  ShoppingBag,
  Palette,
  CheckCircle,
} from 'lucide-react';

export const FeriaDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [feria, setFeria] = useState<any>(null);
  const [stands, setStands] = useState<any[]>([]);
  const [participantes, setParticipantes] = useState<any[]>([]);
  const [exposiciones, setExposiciones] = useState<any[]>([]);
  const [organizadores, setOrganizadores] = useState<any[]>([]);
  const [patrocinadores, setPatrocinadores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stands' | 'participantes' | 'exposiciones' | 'instituciones'>('stands');
  const [standFilter, setStandFilter] = useState<'ALL' | 'SOLO_VENTA' | 'SOLO_EXPOSICION' | 'MIXTO'>('ALL');
  const [standSearch, setStandSearch] = useState('');

  const filteredStands = stands.filter((s) => {
    if (standFilter !== 'ALL' && s.tipoStand !== standFilter) return false;
    if (standSearch.trim()) {
      const q = standSearch.toLowerCase();
      const matchNum = s.nroStand?.toString().includes(q);
      const matchLoc = s.ubicacionInterna?.toLowerCase().includes(q);
      const matchExp = s.expositores?.some((e: any) => e.nombre?.toLowerCase().includes(q) || e.ci?.toLowerCase().includes(q));
      const matchProd = s.productos?.some((p: any) => p.nombre?.toLowerCase().includes(q) || p.categoria?.toLowerCase().includes(q));
      const matchExpo = s.exposiciones?.some((e: any) => e.titulo?.toLowerCase().includes(q));
      return matchNum || matchLoc || matchExp || matchProd || matchExpo;
    }
    return true;
  });

  useEffect(() => {
    const fetchFeriaDetails = async () => {
      setLoading(true);
      try {
        const [fRes, sRes, pRes, eRes, oRes, patRes] = await Promise.all([
          apiClient.get(`/ferias/${id}`),
          apiClient.get(`/ferias/${id}/stands`).catch(() => ({ data: [] })),
          apiClient.get(`/ferias/${id}/participantes`).catch(() => ({ data: { data: [] } })),
          apiClient.get(`/ferias/${id}/exposiciones`).catch(() => ({ data: { data: [] } })),
          apiClient.get(`/ferias/${id}/organizadores`).catch(() => ({ data: { data: [] } })),
          apiClient.get(`/ferias/${id}/patrocinadores`).catch(() => ({ data: { data: [] } })),
        ]);

        setFeria(fRes.data);
        setStands(sRes.data || []);
        setParticipantes(pRes.data?.data || []);
        setExposiciones(eRes.data?.data || []);
        setOrganizadores(oRes.data?.data || []);
        setPatrocinadores(patRes.data?.data || []);
      } catch (err) {
        console.error('Error al cargar detalle de feria:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchFeriaDetails();
  }, [id]);

  if (loading) {
    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '4rem 1.5rem', textAlign: 'center', color: '#94a3b8' }}>
        Cargando detalles de la feria...
      </div>
    );
  }

  if (!feria) {
    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Feria no encontrada</h2>
        <Link to="/ferias" className="btn btn-secondary">
          <ArrowLeft size={16} /> Volver a las ferias
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.5rem', width: '100%' }}>
      {/* Navigation Breadcrumb */}
      <Link to="/ferias" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Volver al listado de ferias
      </Link>

      {/* Main Hero Header */}
      <div className="glass-card" style={{ padding: '2.5rem', marginBottom: '2.5rem', position: 'relative' }}>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <span className={`badge ${feria.estado === 'ACTIVA' ? 'badge-success' : feria.estado === 'FINALIZADA' ? 'badge-warning' : 'badge-primary'}`}>
            {feria.estado || 'PLANIFICADA'}
          </span>
          <span className="badge badge-info">{feria.tipo || 'CULTURAL'}</span>
        </div>

        <h1 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '1rem' }}>
          {feria.nombre}
        </h1>

        <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: 1.6, maxWidth: '850px', marginBottom: '2rem' }}>
          {feria.descripcion || 'Sin descripción detallada registrada.'}
        </p>

        {/* Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
              <Calendar size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Fechas del Evento</div>
              <div style={{ color: '#fff', fontWeight: 500 }}>{feria.fechaInicio} al {feria.fechaFin}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
              <Clock size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Horario de Atención</div>
              <div style={{ color: '#fff', fontWeight: 500 }}>{feria.horaInicio || '09:00'} - {feria.horaFin || '18:00'}</div>
            </div>
          </div>

          {feria.ubicacion && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                <MapPin size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Lugar / Recinto</div>
                <div style={{ color: '#fff', fontWeight: 500 }}>{feria.ubicacion.nombre} ({feria.ubicacion.ciudad})</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{feria.ubicacion.referencia || feria.ubicacion.zona}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border)', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('stands')}
          className={`btn ${activeTab === 'stands' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          <Store size={16} /> Stands ({stands.length})
        </button>
        <button
          onClick={() => setActiveTab('participantes')}
          className={`btn ${activeTab === 'participantes' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          <Users size={16} /> Expositores ({participantes.length})
        </button>
        <button
          onClick={() => setActiveTab('exposiciones')}
          className={`btn ${activeTab === 'exposiciones' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          <Sparkles size={16} /> Exposiciones ({exposiciones.length})
        </button>
        <button
          onClick={() => setActiveTab('instituciones')}
          className={`btn ${activeTab === 'instituciones' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          <Building size={16} /> Organizadores y Patrocinadores ({organizadores.length + patrocinadores.length})
        </button>
      </div>

      {/* Tab 1: Stands */}
      {activeTab === 'stands' && (
        <div>
          {/* Stands Filters & Search Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setStandFilter('ALL')}
                className={`btn btn-sm ${standFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Todos ({stands.length})
              </button>
              <button
                onClick={() => setStandFilter('SOLO_VENTA')}
                className={`btn btn-sm ${standFilter === 'SOLO_VENTA' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <ShoppingBag size={14} /> Solo Venta ({stands.filter((s) => s.tipoStand === 'SOLO_VENTA').length})
              </button>
              <button
                onClick={() => setStandFilter('SOLO_EXPOSICION')}
                className={`btn btn-sm ${standFilter === 'SOLO_EXPOSICION' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Palette size={14} /> Solo Exposición ({stands.filter((s) => s.tipoStand === 'SOLO_EXPOSICION').length})
              </button>
              <button
                onClick={() => setStandFilter('MIXTO')}
                className={`btn btn-sm ${standFilter === 'MIXTO' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Sparkles size={14} /> Mixto ({stands.filter((s) => s.tipoStand === 'MIXTO').length})
              </button>
            </div>

            <div style={{ position: 'relative', minWidth: '260px' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                placeholder="Buscar stand, producto, expositor..."
                value={standSearch}
                onChange={(e) => setStandSearch(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {stands.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
              No se han registrado stands para esta feria.
            </div>
          ) : filteredStands.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
              No se encontraron stands con los criterios seleccionados.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
              {filteredStands.map((s) => (
                <div key={s.nroStand} className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column' }}>
                  {/* Stand Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Store size={20} style={{ color: '#818cf8' }} />
                      <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                        Stand #{s.nroStand}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      {s.tipoStand === 'SOLO_VENTA' && (
                        <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <ShoppingBag size={12} /> Solo Venta
                        </span>
                      )}
                      {s.tipoStand === 'SOLO_EXPOSICION' && (
                        <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Palette size={12} /> Solo Exposición
                        </span>
                      )}
                      {s.tipoStand === 'MIXTO' && (
                        <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Sparkles size={12} /> Mixto
                        </span>
                      )}
                      <span className={`badge ${s.estado === 'DISPONIBLE' ? 'badge-success' : 'badge-warning'}`}>
                        {s.estado || 'DISPONIBLE'}
                      </span>
                    </div>
                  </div>

                  {/* Dimensions & Ubicación */}
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.2rem', background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div><strong>Ubicación interna:</strong> {s.ubicacionInterna || 'Sector general'}</div>
                    {s.ancho && s.largo && <div><strong>Dimensiones:</strong> {s.ancho}m ancho × {s.largo}m largo</div>}
                  </div>

                  {/* Encargado del Stand Destacado */}
                  {s.encargado && (
                    <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '8px', padding: '0.85rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                        <Crown size={14} /> Encargado del Stand
                      </div>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.98rem' }}>
                        {s.encargado.nombre}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                        CI: {s.encargado.ci} {s.encargado.telefono && `• Tel: ${s.encargado.telefono}`}
                      </div>
                    </div>
                  )}

                  {/* Otros Expositores del Stand */}
                  {s.expositores && s.expositores.length > 1 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 600 }}>
                        Otros Miembros ({s.expositores.length - 1})
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {s.expositores
                          .filter((exp: any) => exp.ci !== s.encargado?.ci)
                          .map((exp: any, idx: number) => (
                            <div key={idx} style={{ fontSize: '0.85rem', color: '#e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                              <span>{exp.nombre}</span>
                              <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{exp.cargo}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Productos del Stand */}
                  {s.productos && s.productos.length > 0 && (
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: 'auto' }}>
                      <div style={{ fontSize: '0.8rem', color: '#818cf8', textTransform: 'uppercase', marginBottom: '0.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <ShoppingBag size={14} /> Productos en Venta ({s.productos.length})
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {s.productos.map((prod: any) => (
                          <div key={prod.id} style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                              <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.92rem' }}>{prod.nombre}</span>
                              <span style={{ fontWeight: 700, color: '#10b981', fontSize: '0.92rem' }}>
                                Bs. {prod.precio ? Number(prod.precio).toFixed(2) : '0.00'}
                              </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                              <span className="badge badge-sm badge-secondary">{prod.categoria || 'Artesanía'}</span>
                              <span>Stock: <strong>{prod.stock} {prod.unidadMedida || 'unid.'}</strong></span>
                            </div>
                            {prod.descripcion && (
                              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.25rem', fontStyle: 'italic' }}>
                                {prod.descripcion}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Exposiciones del Stand */}
                  {s.exposiciones && s.exposiciones.length > 0 && (
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: s.productos?.length ? '1rem' : 'auto' }}>
                      <div style={{ fontSize: '0.8rem', color: '#c084fc', textTransform: 'uppercase', marginBottom: '0.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Palette size={14} /> Exposición Temática
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {s.exposiciones.map((expo: any) => (
                          <div key={expo.id} style={{ background: 'rgba(192, 132, 252, 0.08)', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(192, 132, 252, 0.2)' }}>
                            <div style={{ fontWeight: 600, color: '#e9d5ff', fontSize: '0.92rem' }}>
                              {expo.titulo}
                            </div>
                            {expo.descripcion && (
                              <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '0.3rem', lineHeight: 1.4 }}>
                                {expo.descripcion}
                              </div>
                            )}
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
      )}

      {/* Tab 2: Participantes */}
      {activeTab === 'participantes' && (
        <div className="table-container glass-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Expositor</th>
                <th>CI</th>
                <th>Stand</th>
                <th>Cargo / Rol</th>
                <th>Contacto</th>
              </tr>
            </thead>
            <tbody>
              {participantes.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    No hay participantes registrados.
                  </td>
                </tr>
              ) : (
                participantes.map((p, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, color: '#fff' }}>
                      {p.expositor ? `${p.expositor.nombre} ${p.expositor.paterno || ''}` : 'Sin datos'}
                    </td>
                    <td>{p.expositor?.ci}</td>
                    <td>
                      <span className="badge badge-info">Stand #{p.stand?.numero}</span>
                    </td>
                    <td>
                      <span className="badge badge-primary">{p.cargo || 'Participante'}</span>
                    </td>
                    <td>{p.expositor?.telefono || p.expositor?.correo || 'No disponible'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Exposiciones */}
      {activeTab === 'exposiciones' && (
        <div>
          {exposiciones.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
              No hay actividades ni exposiciones registradas para esta feria.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {exposiciones.map((e) => (
                <div key={e.idExposicion} className="glass-card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className="badge badge-primary">Stand #{e.nroStand}</span>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem' }}>
                    {e.tituloExposicion}
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    {e.descripcion || 'Sin descripción.'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Instituciones */}
      {activeTab === 'instituciones' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Organizadores */}
          <div>
            <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building size={18} style={{ color: '#818cf8' }} /> Organizadores
            </h3>
            {organizadores.length === 0 ? (
              <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                Sin organizadores registrados.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {organizadores.map((org, i) => (
                  <div key={i} className="glass-card" style={{ padding: '1.25rem' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: '#fff' }}>
                      {org.razonSocial || org.nit}
                    </div>
                    <div style={{ color: '#f59e0b', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                      Rol: {org.rol || 'Organizador'}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.35rem' }}>
                      NIT: {org.nit} {org.telefono && `• Tel: ${org.telefono}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Patrocinadores */}
          <div>
            <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={18} style={{ color: '#f59e0b' }} /> Patrocinadores y Auspicios
            </h3>
            {patrocinadores.length === 0 ? (
              <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                Sin patrocinadores registrados.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {patrocinadores.map((pat, i) => (
                  <div key={i} className="glass-card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 600, color: '#fff' }}>
                        {pat.razonSocial || pat.nit}
                      </div>
                      <span className="badge badge-success">{pat.tipoApoyo || 'APOYO'}</span>
                    </div>
                    {pat.cantidad > 0 && (
                      <div style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: 600, marginTop: '0.35rem' }}>
                        Aporte: BOB {Number(pat.cantidad).toFixed(2)}
                      </div>
                    )}
                    {pat.detalles && (
                      <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.3rem' }}>
                        {pat.detalles}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeriaDetailPage;

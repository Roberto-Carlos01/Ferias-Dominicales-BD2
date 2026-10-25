import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import {
  Calendar,
  MapPin,
  Search,
  Filter,
  ArrowRight,
  Clock,
} from 'lucide-react';

export const FeriasPage: React.FC = () => {
  const [ferias, setFerias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');
  const [tipo, setTipo] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>({ total: 0, totalPages: 1 });

  const fetchFerias = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 12 };
      if (search) params.search = search;
      if (estado) params.estado = estado;
      if (tipo) params.tipo = tipo;

      const res = await apiClient.get('/ferias', { params });
      setFerias(res.data.data || []);
      setMeta(res.data.meta || { total: 0, totalPages: 1 });
    } catch (err) {
      console.error('Error cargando ferias:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFerias();
  }, [page, estado, tipo]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchFerias();
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.5rem', width: '100%' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '0.5rem' }}>
          Cartelera de Ferias Dominicales
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.05rem' }}>
          Encuentra eventos dominicales activos, culturales, gastronómicos y artesanales en La Paz
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '2.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 280px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <div style={{ flex: '0 1 180px' }}>
            <select
              value={estado}
              onChange={(e) => { setEstado(e.target.value); setPage(1); }}
              className="input-field"
            >
              <option value="">Todos los estados</option>
              <option value="ACTIVA">ACTIVA</option>
              <option value="PLANIFICADA">PLANIFICADA</option>
              <option value="FINALIZADA">FINALIZADA</option>
            </select>
          </div>

          <div style={{ flex: '0 1 180px' }}>
            <select
              value={tipo}
              onChange={(e) => { setTipo(e.target.value); setPage(1); }}
              className="input-field"
            >
              <option value="">Todos los tipos</option>
              <option value="CULTURAL">CULTURAL</option>
              <option value="GASTRONOMICA">GASTRONÓMICA</option>
              <option value="ARTESANAL">ARTESANAL</option>
              <option value="TECNOLOGICA">TECNOLÓGICA</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '0.7rem 1.25rem' }}>
            <Filter size={16} /> Filtrar
          </button>
        </form>
      </div>

      {/* Grid of Ferias */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
          Cargando ferias...
        </div>
      ) : ferias.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
          No se encontraron ferias con los criterios seleccionados.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {ferias.map((f) => (
            <div
              key={f.idFeria}
              className="glass-card"
              style={{
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span className={`badge ${f.estado === 'ACTIVA' ? 'badge-success' : f.estado === 'FINALIZADA' ? 'badge-warning' : 'badge-primary'}`}>
                    {f.estado || 'PLANIFICADA'}
                  </span>
                  <span className="badge badge-info">{f.tipo || 'GENERAL'}</span>
                </div>

                <h3 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: '0.65rem' }}>
                  {f.nombre}
                </h3>

                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {f.descripcion || 'Sin descripción detallada.'}
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '0.45rem' }}>
                  <Calendar size={15} style={{ color: '#818cf8' }} />
                  <span>{f.fechaInicio} al {f.fechaFin}</span>
                </div>

                {f.horaInicio && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.45rem' }}>
                    <Clock size={15} style={{ color: '#a5b4fc' }} />
                    <span>{f.horaInicio} - {f.horaFin}</span>
                  </div>
                )}

                {f.ubicacion && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                    <MapPin size={15} style={{ color: '#f59e0b' }} />
                    <span>{f.ubicacion.nombre} ({f.ubicacion.zona})</span>
                  </div>
                )}

                <Link to={`/ferias/${f.idFeria}`} className="btn btn-primary" style={{ width: '100%' }}>
                  Explorar Feria <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {meta.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center', marginTop: '2rem' }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn btn-secondary btn-sm"
          >
            Anterior
          </button>
          <span style={{ color: '#94a3b8', fontSize: '0.9rem', padding: '0 0.5rem' }}>
            Página {page} de {meta.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            disabled={page === meta.totalPages}
            className="btn btn-secondary btn-sm"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default FeriasPage;

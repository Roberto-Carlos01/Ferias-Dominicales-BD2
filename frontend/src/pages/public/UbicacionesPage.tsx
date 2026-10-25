import React, { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { MapPin, Users, Info, Search } from 'lucide-react';

export const UbicacionesPage: React.FC = () => {
  const [ubicaciones, setUbicaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUbicaciones = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/ubicaciones', { params: { search } });
      setUbicaciones(res.data.data || []);
    } catch (err) {
      console.error('Error cargando ubicaciones:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUbicaciones();
  }, []);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.5rem', width: '100%' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '0.5rem' }}>
          Recintos y Ubicaciones Feriales
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.05rem' }}>
          Conoce los predios habilitados para ferias dominicales, campos feriales y avenidas culturales en La Paz
        </p>
      </div>

      {/* Search Input */}
      <div className="glass-card" style={{ padding: '1rem', marginBottom: '2.5rem' }}>
        <form
          onSubmit={(e) => { e.preventDefault(); fetchUbicaciones(); }}
          style={{ display: 'flex', gap: '1rem' }}
        >
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Buscar recinto por nombre, zona o ciudad..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Buscar
          </button>
        </form>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
          Cargando ubicaciones...
        </div>
      ) : ubicaciones.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
          No se encontraron ubicaciones.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {ubicaciones.map((u) => (
            <div key={u.idUbicacion} className="glass-card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>{u.nombre}</h3>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{u.ciudad} • {u.zona}</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
                {u.capacidad && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1' }}>
                    <Users size={16} style={{ color: '#818cf8' }} />
                    <span>Capacidad: <strong>{Number(u.capacidad).toLocaleString()} personas</strong></span>
                  </div>
                )}
                {u.referencia && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: '#94a3b8' }}>
                    <Info size={16} style={{ color: '#0ea5e9', flexShrink: 0, marginTop: '2px' }} />
                    <span>{u.referencia}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UbicacionesPage;

import React, { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { Package, Search, Tag, DollarSign } from 'lucide-react';

export const ProductosPage: React.FC = () => {
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>({ total: 0, totalPages: 1 });

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 12 };
      if (search) params.search = search;
      if (categoria) params.categoria = categoria;

      const res = await apiClient.get('/productos', { params });
      setProductos(res.data.data || []);
      setMeta(res.data.meta || { total: 0, totalPages: 1 });
    } catch (err) {
      console.error('Error cargando productos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, [page, categoria]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProductos();
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.5rem', width: '100%' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '0.5rem' }}>
          Catálogo de Productos y Artesanías
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.05rem' }}>
          Descubre los artículos, textiles, piezas de arte y delicias gastronómicas que ofrecen los artesanos
        </p>
      </div>

      {/* Filter and Search */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '2.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 280px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Buscar producto por nombre o descripción..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <div style={{ flex: '0 1 220px' }}>
            <select
              value={categoria}
              onChange={(e) => { setCategoria(e.target.value); setPage(1); }}
              className="input-field"
            >
              <option value="">Todas las categorías</option>
              <option value="Artesanía">Artesanía</option>
              <option value="Textilería">Textilería</option>
              <option value="Gastronomía">Gastronomía</option>
              <option value="Joyería">Joyería</option>
              <option value="Madera">Madera y Tallados</option>
              <option value="Cerámica">Cerámica</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary">
            Buscar
          </button>
        </form>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
          Cargando catálogo...
        </div>
      ) : productos.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
          No se encontraron productos con los criterios ingresados.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {productos.map((p) => (
            <div
              key={p.idProducto}
              className="glass-card"
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>
                    {p.categoria || 'General'}
                  </span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981' }}>
                    BOB {Number(p.precio).toFixed(2)}
                  </div>
                </div>

                <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem' }}>
                  {p.nombreProd}
                </h3>

                <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                  {p.descripcionProd || 'Sin descripción adicional.'}
                </p>

                {/* Ofertas en Ferias y Stands */}
                {p.ofertas && p.ofertas.length > 0 ? (
                  <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '0.6rem 0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                      Disponible en Stands:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {p.ofertas.slice(0, 2).map((of: any, idx: number) => (
                        <a
                          key={idx}
                          href={`/ferias/${of.idFeria}`}
                          style={{ color: '#e2e8f0', fontSize: '0.82rem', textDecoration: 'none', display: 'flex', justifyContent: 'space-between' }}
                        >
                          <span style={{ color: '#a5b4fc', textDecoration: 'underline' }}>{of.nombreFeria}</span>
                          <span style={{ color: '#cbd5e1' }}>Stand #{of.nroStand}</span>
                        </a>
                      ))}
                      {p.ofertas.length > 2 && (
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          +{p.ofertas.length - 2} ferias adicionales
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic', marginBottom: '1rem' }}>
                    Disponible por rotación en stands feriales
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.8rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Tag size={14} /> ID #{p.idProducto}
                </span>
                {p.standsCount > 0 && (
                  <span style={{ color: '#10b981', fontWeight: 600 }}>
                    En {p.standsCount} {p.standsCount === 1 ? 'stand' : 'stands'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
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

export default ProductosPage;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import Modal from '../../components/Modal';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  Search,
  Tag,
  Store,
  ExternalLink,
  Layers,
} from 'lucide-react';

export const AdminProductosPage: React.FC = () => {
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);

  // Modal: Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProd, setEditingProd] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    nombreProd: '',
    precio: '',
    categoria: 'Artesanía',
    descripcionProd: '',
  });

  // Modal: Ver Ofertas en Stands y Ferias
  const [offersModalOpen, setOffersModalOpen] = useState(false);
  const [selectedProdOffers, setSelectedProdOffers] = useState<any | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = {
        search: search || undefined,
        categoria: categoriaFilter || undefined,
        page,
        limit: 25,
      };

      const res = await apiClient.get('/productos', { params });
      setProductos(res.data.data || []);
      setMeta(res.data.meta || null);
    } catch (err) {
      console.error('Error cargando productos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, categoriaFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const handleOpenCreate = () => {
    setEditingProd(null);
    setFormData({
      nombreProd: '',
      precio: '',
      categoria: 'Artesanía',
      descripcionProd: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: any) => {
    setEditingProd(p);
    setFormData({
      nombreProd: p.nombreProd || '',
      precio: p.precio?.toString() || '0',
      categoria: p.categoria || 'Artesanía',
      descripcionProd: p.descripcionProd || '',
    });
    setIsModalOpen(true);
  };

  const handleOpenOffers = (p: any) => {
    setSelectedProdOffers(p);
    setOffersModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        precio: parseFloat(formData.precio) || 0,
      };

      if (editingProd) {
        await apiClient.patch(`/productos/${editingProd.idProducto}`, payload);
      } else {
        await apiClient.post('/productos', payload);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar producto');
    }
  };

  const handleDelete = async (id: number, nombre: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar el producto "${nombre}" (#${id})?`)) return;
    try {
      await apiClient.delete(`/productos/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar producto');
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.5rem', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            <ArrowLeft size={15} /> Volver al panel de control
          </Link>
          <h1 style={{ fontSize: '2.25rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Package size={32} style={{ color: '#c084fc' }} /> Catálogo de Productos y Oferta en Stands
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Gestiona los productos autorizados, su precio oficial y visualiza en qué ferias y stands se comercializan
          </p>
        </div>

        <button onClick={handleOpenCreate} className="btn btn-primary">
          <Plus size={16} /> Nuevo Producto
        </button>
      </div>

      {/* Filters Bar */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Buscar producto por nombre o descripción..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
          <button type="submit" className="btn btn-secondary">
            Buscar
          </button>
        </form>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Categoría:</span>
          <select
            value={categoriaFilter}
            onChange={(e) => {
              setCategoriaFilter(e.target.value);
              setPage(1);
            }}
            className="input-field"
            style={{ width: 'auto' }}
          >
            <option value="">Todas las categorías</option>
            <option value="Artesanía">Artesanía</option>
            <option value="Gastronomía">Gastronomía</option>
            <option value="Textil">Textil</option>
            <option value="Orfebrería">Orfebrería</option>
            <option value="Plantas y Flores">Plantas y Flores</option>
            <option value="Cerámica">Cerámica</option>
            <option value="Repostería">Repostería</option>
            <option value="Cuero y Calzados">Cuero y Calzados</option>
            <option value="Pintura y Escultura">Pintura y Escultura</option>
            <option value="Madera y Muebles">Madera y Muebles</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container glass-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre de Producto</th>
              <th>Categoría</th>
              <th>Precio Referencial</th>
              <th>Disponibilidad en Stands</th>
              <th>Descripción</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  Cargando catálogo de productos...
                </td>
              </tr>
            ) : productos.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  No se encontraron productos.
                </td>
              </tr>
            ) : (
              productos.map((p) => {
                const standsCount = p.standsCount ?? (p.ofertas?.length || 0);
                return (
                  <tr key={p.idProducto}>
                    <td style={{ color: '#64748b', fontWeight: 600 }}>#{p.idProducto}</td>
                    <td style={{ fontWeight: 600, color: '#fff' }}>{p.nombreProd}</td>
                    <td>
                      <span className="badge badge-info">{p.categoria || 'General'}</span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#10b981' }}>
                      Bs. {p.precio ? Number(p.precio).toFixed(2) : '0.00'}
                    </td>
                    <td>
                      {standsCount > 0 ? (
                        <button
                          onClick={() => handleOpenOffers(p)}
                          className="badge badge-primary"
                          style={{ cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                          title="Ver en qué stands y ferias se ofrece"
                        >
                          <Store size={12} /> {standsCount} {standsCount === 1 ? 'Stand' : 'Stands'} (Ver)
                        </button>
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '0.82rem', fontStyle: 'italic' }}>
                          Sin oferta activa
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#cbd5e1', maxWidth: '280px' }}>
                      {p.descripcionProd || <span style={{ color: '#64748b', fontStyle: 'italic' }}>Sin descripción</span>}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="btn btn-secondary btn-sm"
                          title="Editar producto"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.idProducto, p.nombreProd)}
                          className="btn btn-danger btn-sm"
                          title="Eliminar producto"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
          <div>
            Mostrando página {meta.page} de {meta.totalPages} ({meta.total} productos en total)
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              disabled={meta.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="btn btn-secondary btn-sm"
            >
              Anterior
            </button>
            <button
              disabled={meta.page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="btn btn-secondary btn-sm"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Modal: Ofertas en Ferias y Stands */}
      <Modal
        isOpen={offersModalOpen}
        onClose={() => setOffersModalOpen(false)}
        title={`Oferta de "${selectedProdOffers?.nombreProd}" en Stands de Ferias`}
      >
        <div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Este producto se encuentra disponible para venta en los siguientes stands y ferias:
          </p>

          {(!selectedProdOffers?.ofertas || selectedProdOffers.ofertas.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px' }}>
              No hay stands que ofrezcan este producto actualmente.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '420px', overflowY: 'auto' }}>
              {selectedProdOffers.ofertas.map((of: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>
                      {of.nombreFeria}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                      Stock disponible: <strong style={{ color: '#10b981' }}>{of.stock} {of.unidadMedida || 'unid.'}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className="badge badge-info">
                      Stand #{of.nroStand}
                    </span>
                    <Link
                      to={`/ferias/${of.idFeria}`}
                      target="_blank"
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      <ExternalLink size={12} /> Ver en Feria
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button onClick={() => setOffersModalOpen(false)} className="btn btn-secondary">
              Cerrar
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Create / Edit Product */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProd ? `Editar Producto: ${editingProd.nombreProd}` : 'Registrar Nuevo Producto'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="input-label">Nombre del Producto</label>
            <input
              type="text"
              required
              value={formData.nombreProd}
              onChange={(e) => setFormData({ ...formData, nombreProd: e.target.value })}
              className="input-field"
              placeholder="Ej. Poncho de Alpaca Tradicional"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="input-label">Categoría</label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="input-field"
              >
                <option value="Artesanía">Artesanía</option>
                <option value="Gastronomía">Gastronomía</option>
                <option value="Textil">Textil</option>
                <option value="Orfebrería">Orfebrería</option>
                <option value="Plantas y Flores">Plantas y Flores</option>
                <option value="Cerámica">Cerámica</option>
                <option value="Repostería">Repostería</option>
                <option value="Cuero y Calzados">Cuero y Calzados</option>
                <option value="Pintura y Escultura">Pintura y Escultura</option>
                <option value="Madera y Muebles">Madera y Muebles</option>
              </select>
            </div>

            <div className="form-group">
              <label className="input-label">Precio Referencial (BOB)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                className="input-field"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="input-label">Descripción</label>
            <textarea
              value={formData.descripcionProd}
              onChange={(e) => setFormData({ ...formData, descripcionProd: e.target.value })}
              className="input-field"
              rows={3}
              placeholder="Detalles sobre el material, técnica de elaboración, etc."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editingProd ? 'Guardar Cambios' : 'Registrar Producto'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminProductosPage;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import Modal from '../../components/Modal';
import {
  Award,
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  Search,
  Building,
  Calendar,
  Filter,
} from 'lucide-react';

export const AdminPatrocinadoresPage: React.FC = () => {
  const [patrocinios, setPatrocinios] = useState<any[]>([]);
  const [ferias, setFerias] = useState<any[]>([]);
  const [instituciones, setInstituciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tipoApoyoFilter, setTipoApoyoFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    idFeria: '',
    nit: '',
    tipoApoyo: 'ECONOMICO',
    cantidad: '',
    detalles: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/patrocinadores', {
        params: {
          search: search || undefined,
          tipoApoyo: tipoApoyoFilter || undefined,
          page,
          limit: 25,
        },
      });
      setPatrocinios(res.data.data || []);
      setMeta(res.data.meta || null);
    } catch (err) {
      console.error('Error cargando patrocinios:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuxData = async () => {
    try {
      const [fRes, iRes] = await Promise.all([
        apiClient.get('/ferias?limit=200'),
        apiClient.get('/instituciones?limit=200'),
      ]);
      setFerias(fRes.data.data || []);
      setInstituciones(iRes.data.data || []);
    } catch (err) {
      console.error('Error cargando ferias o instituciones:', err);
    }
  };

  useEffect(() => {
    fetchAuxData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [page, tipoApoyoFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      idFeria: ferias[0]?.idFeria?.toString() || '',
      nit: instituciones[0]?.nit || '',
      tipoApoyo: 'ECONOMICO',
      cantidad: '0',
      detalles: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      idFeria: item.idFeria?.toString() || '',
      nit: item.nit || '',
      tipoApoyo: item.tipoApoyo || 'ECONOMICO',
      cantidad: item.cantidad?.toString() || '0',
      detalles: item.detalles || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await apiClient.patch(`/patrocinadores/${editingItem.idFeria}/${editingItem.nit}`, {
          tipoApoyo: formData.tipoApoyo,
          cantidad: parseFloat(formData.cantidad) || 0,
          detalles: formData.detalles || null,
        });
      } else {
        await apiClient.post('/patrocinadores', {
          idFeria: parseInt(formData.idFeria, 10),
          nit: formData.nit,
          tipoApoyo: formData.tipoApoyo,
          cantidad: parseFloat(formData.cantidad) || 0,
          detalles: formData.detalles || null,
        });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar patrocinio');
    }
  };

  const handleDelete = async (idFeria: number, nit: string, feriaNom: string, instNom: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar el patrocinio de "${instNom}" en la feria "${feriaNom}"?`)) {
      return;
    }
    try {
      await apiClient.delete(`/patrocinadores/${idFeria}/${nit}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar patrocinio');
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
            <Award size={32} style={{ color: '#f59e0b' }} /> Gestión de Patrocinadores
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Administra los convenios de patrocinio, auspicios económicos y logísticos por feria
          </p>
        </div>

        <button onClick={handleOpenCreate} className="btn btn-primary">
          <Plus size={16} /> Asignar Patrocinio
        </button>
      </div>

      {/* Filters Bar */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Buscar por feria, institución o NIT..."
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
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Tipo de Apoyo:</span>
          <select
            value={tipoApoyoFilter}
            onChange={(e) => {
              setTipoApoyoFilter(e.target.value);
              setPage(1);
            }}
            className="input-field"
            style={{ width: 'auto' }}
          >
            <option value="">Todos los tipos</option>
            <option value="ECONOMICO">Económico</option>
            <option value="LOGISTICA">Logística</option>
            <option value="DIFUSION">Difusión / Medios</option>
            <option value="PREMIOS">Premios / Reconocimientos</option>
            <option value="OTRO">Otro</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container glass-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Feria</th>
              <th>Institución Patrocinadora</th>
              <th>Tipo de Apoyo</th>
              <th>Monto / Aporte</th>
              <th>Detalles / Observaciones</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  Cargando patrocinios...
                </td>
              </tr>
            ) : patrocinios.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  No se encontraron patrocinios registrados.
                </td>
              </tr>
            ) : (
              patrocinios.map((p) => {
                const feriaNom = p.feria?.nombre || `Feria #${p.idFeria}`;
                const instNom = p.institucion?.razonSocial || `NIT: ${p.nit}`;
                return (
                  <tr key={`${p.idFeria}-${p.nit}`}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>
                        <Link to={`/ferias/${p.idFeria}`} style={{ color: '#818cf8', textDecoration: 'none' }}>
                          {feriaNom}
                        </Link>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        ID #{p.idFeria} {p.feria?.fechaInicio && `• ${p.feria.fechaInicio}`}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{instNom}</div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        NIT: <span style={{ color: '#cbd5e1' }}>{p.nit}</span>
                        {p.institucion?.telefono && ` • Tel: ${p.institucion.telefono}`}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${p.tipoApoyo === 'ECONOMICO' ? 'badge-success' : p.tipoApoyo === 'LOGISTICA' ? 'badge-primary' : 'badge-info'}`}>
                        {p.tipoApoyo}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: p.cantidad > 0 ? '#10b981' : '#64748b' }}>
                      {p.cantidad > 0 ? `Bs. ${Number(p.cantidad).toFixed(2)}` : 'En especie / Sin costo'}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#cbd5e1', maxWidth: '280px' }}>
                      {p.detalles || <span style={{ color: '#64748b', fontStyle: 'italic' }}>Sin observaciones</span>}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="btn btn-secondary btn-sm"
                          title="Editar patrocinio"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.idFeria, p.nit, feriaNom, instNom)}
                          className="btn btn-danger btn-sm"
                          title="Eliminar patrocinio"
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
            Mostrando página {meta.page} de {meta.totalPages} ({meta.total} registros en total)
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

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Editar Patrocinio' : 'Asignar Nuevo Patrocinio a Feria'}
      >
        <form onSubmit={handleSubmit}>
          {!editingItem ? (
            <>
              <div className="form-group">
                <label className="input-label">Feria Destino</label>
                <select
                  required
                  value={formData.idFeria}
                  onChange={(e) => setFormData({ ...formData, idFeria: e.target.value })}
                  className="input-field"
                >
                  {ferias.map((f) => (
                    <option key={f.idFeria} value={f.idFeria}>
                      #{f.idFeria} - {f.nombre} ({f.fechaInicio})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="input-label">Institución Patrocinadora</label>
                <select
                  required
                  value={formData.nit}
                  onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
                  className="input-field"
                >
                  {instituciones.map((i) => (
                    <option key={i.nit} value={i.nit}>
                      NIT {i.nit} — {i.razonSocial}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '0.85rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Feria: <strong style={{ color: '#fff' }}>{editingItem.feria?.nombre} (#{editingItem.idFeria})</strong></div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.2rem' }}>Institución: <strong style={{ color: '#fff' }}>{editingItem.institucion?.razonSocial} (NIT {editingItem.nit})</strong></div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="input-label">Tipo de Apoyo</label>
              <select
                value={formData.tipoApoyo}
                onChange={(e) => setFormData({ ...formData, tipoApoyo: e.target.value })}
                className="input-field"
              >
                <option value="ECONOMICO">Económico (Dinero)</option>
                <option value="LOGISTICA">Logística / Estructura</option>
                <option value="DIFUSION">Difusión / Publicidad</option>
                <option value="PREMIOS">Premios / Concursos</option>
                <option value="OTRO">Otro tipo</option>
              </select>
            </div>

            <div className="form-group">
              <label className="input-label">Monto Aportado (BOB)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.cantidad}
                onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                className="input-field"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="input-label">Detalles / Observaciones</label>
            <textarea
              value={formData.detalles}
              onChange={(e) => setFormData({ ...formData, detalles: e.target.value })}
              className="input-field"
              rows={3}
              placeholder="Descripción del apoyo o convenio..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editingItem ? 'Guardar Cambios' : 'Registrar Patrocinio'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminPatrocinadoresPage;

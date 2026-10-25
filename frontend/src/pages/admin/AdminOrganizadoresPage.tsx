import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import Modal from '../../components/Modal';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  Search,
  Building,
  Calendar,
  Users,
} from 'lucide-react';

export const AdminOrganizadoresPage: React.FC = () => {
  const [organizadores, setOrganizadores] = useState<any[]>([]);
  const [ferias, setFerias] = useState<any[]>([]);
  const [instituciones, setInstituciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [rolFilter, setRolFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    idFeria: '',
    nit: '',
    rol: 'Principal',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/organizadores', {
        params: {
          search: search || undefined,
          rol: rolFilter || undefined,
          page,
          limit: 25,
        },
      });
      setOrganizadores(res.data.data || []);
      setMeta(res.data.meta || null);
    } catch (err) {
      console.error('Error cargando organizadores:', err);
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
  }, [page, rolFilter]);

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
      rol: 'Principal',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      idFeria: item.idFeria?.toString() || '',
      nit: item.nit || '',
      rol: item.rol || 'Principal',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await apiClient.patch(`/organizadores/${editingItem.idFeria}/${editingItem.nit}`, {
          rol: formData.rol,
        });
      } else {
        await apiClient.post('/organizadores', {
          idFeria: parseInt(formData.idFeria, 10),
          nit: formData.nit,
          rol: formData.rol,
        });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar organizador');
    }
  };

  const handleDelete = async (idFeria: number, nit: string, feriaNom: string, instNom: string) => {
    if (!window.confirm(`¿Estás seguro de desvincular como organizador a "${instNom}" de la feria "${feriaNom}"?`)) {
      return;
    }
    try {
      await apiClient.delete(`/organizadores/${idFeria}/${nit}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al desvincular organizador');
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
            <Building2 size={32} style={{ color: '#0ea5e9' }} /> Gestión de Organizadores
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Asigna y supervisa las instituciones y comités responsables de cada feria dominical
          </p>
        </div>

        <button onClick={handleOpenCreate} className="btn btn-primary">
          <Plus size={16} /> Asignar Organizador
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
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Filtrar Rol:</span>
          <select
            value={rolFilter}
            onChange={(e) => {
              setRolFilter(e.target.value);
              setPage(1);
            }}
            className="input-field"
            style={{ width: 'auto' }}
          >
            <option value="">Todos los roles</option>
            <option value="Principal">Principal</option>
            <option value="Coordinador">Coordinador</option>
            <option value="Logística">Logística</option>
            <option value="Comité Organizador">Comité Organizador</option>
            <option value="Apoyo">Apoyo</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container glass-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Feria</th>
              <th>Institución Organizadora</th>
              <th>Rol en la Organización</th>
              <th>Datos de Contacto</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  Cargando organizadores...
                </td>
              </tr>
            ) : organizadores.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  No se encontraron organizadores registrados.
                </td>
              </tr>
            ) : (
              organizadores.map((o) => {
                const feriaNom = o.feria?.nombre || `Feria #${o.idFeria}`;
                const instNom = o.institucion?.razonSocial || `NIT: ${o.nit}`;
                return (
                  <tr key={`${o.idFeria}-${o.nit}`}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>
                        <Link to={`/ferias/${o.idFeria}`} style={{ color: '#818cf8', textDecoration: 'none' }}>
                          {feriaNom}
                        </Link>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        ID #{o.idFeria} {o.feria?.fechaInicio && `• ${o.feria.fechaInicio}`}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{instNom}</div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        NIT: <span style={{ color: '#cbd5e1' }}>{o.nit}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-primary">
                        {o.rol || 'Organizador'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                      {o.institucion?.telefono && <div>Tel: {o.institucion.telefono}</div>}
                      {o.institucion?.correo && <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{o.institucion.correo}</div>}
                      {!o.institucion?.telefono && !o.institucion?.correo && (
                        <span style={{ color: '#64748b', fontStyle: 'italic' }}>Sin contacto</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => handleOpenEdit(o)}
                          className="btn btn-secondary btn-sm"
                          title="Editar rol"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(o.idFeria, o.nit, feriaNom, instNom)}
                          className="btn btn-danger btn-sm"
                          title="Desvincular organizador"
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
        title={editingItem ? 'Editar Rol de Organizador' : 'Asignar Nuevo Organizador a Feria'}
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
                <label className="input-label">Institución Organizadora</label>
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

          <div className="form-group">
            <label className="input-label">Rol en la Organización</label>
            <input
              type="text"
              required
              value={formData.rol}
              onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
              className="input-field"
              placeholder="Ej. Principal, Coordinador General, Logística, Apoyo..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editingItem ? 'Guardar Cambios' : 'Registrar Organizador'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminOrganizadoresPage;

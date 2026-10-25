import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import Modal from '../../components/Modal';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  Search,
  Star,
  Calendar,
  Store,
  Eye,
  Award,
} from 'lucide-react';

export const AdminExpositoresPage: React.FC = () => {
  const [expositores, setExpositores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [multiplesOnly, setMultiplesOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);

  // Modal: Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    ciExpositor: '',
    nombre: '',
    paterno: '',
    materno: '',
    correo: '',
    telefono: '',
  });

  // Modal: Historial de Participaciones
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedExpHistory, setSelectedExpHistory] = useState<any | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = {
        search: search || undefined,
        multiples: multiplesOnly ? 'true' : undefined,
        page,
        limit: 25,
      };

      const res = await apiClient.get('/expositores', { params });
      setExpositores(res.data.data || []);
      setMeta(res.data.meta || null);
    } catch (err) {
      console.error('Error cargando expositores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, multiplesOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const handleOpenCreate = () => {
    setEditingExp(null);
    setFormData({
      ciExpositor: '',
      nombre: '',
      paterno: '',
      materno: '',
      correo: '',
      telefono: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exp: any) => {
    setEditingExp(exp);
    setFormData({
      ciExpositor: exp.ci,
      nombre: exp.nombre || '',
      paterno: exp.paterno || '',
      materno: exp.materno || '',
      correo: exp.correo || '',
      telefono: exp.telefono || '',
    });
    setIsModalOpen(true);
  };

  const handleOpenHistory = (exp: any) => {
    setSelectedExpHistory(exp);
    setHistoryModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingExp) {
        await apiClient.patch(`/expositores/${editingExp.ci}`, {
          nombre: formData.nombre,
          paterno: formData.paterno,
          materno: formData.materno,
          correo: formData.correo,
          telefono: formData.telefono,
        });
      } else {
        await apiClient.post('/expositores', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar expositor');
    }
  };

  const handleDelete = async (ci: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar permanentemente al expositor con CI ${ci}?`)) return;
    try {
      await apiClient.delete(`/expositores/${ci}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar expositor');
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
            <Users size={32} style={{ color: '#f59e0b' }} /> Gestión de Expositores
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Registro oficial de artesanos y productores con historial de participación en ferias y stands
          </p>
        </div>

        <button onClick={handleOpenCreate} className="btn btn-primary">
          <Plus size={16} /> Registrar Expositor
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => {
              setMultiplesOnly(false);
              setPage(1);
            }}
            className={`btn btn-sm ${!multiplesOnly ? 'btn-primary' : 'btn-secondary'}`}
          >
            Todos los Expositores
          </button>
          <button
            onClick={() => {
              setMultiplesOnly(true);
              setPage(1);
            }}
            className={`btn btn-sm ${multiplesOnly ? 'btn-primary' : 'btn-secondary'}`}
            style={{ color: multiplesOnly ? '#fff' : '#f59e0b' }}
          >
            <Star size={14} /> Participó en Múltiples Ferias (&gt;1)
          </button>
        </div>

        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', minWidth: '280px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Buscar por nombre, CI o correo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
            />
          </div>
          <button type="submit" className="btn btn-secondary btn-sm">
            Buscar
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="table-container glass-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>CI</th>
              <th>Nombre Completo</th>
              <th>Contacto</th>
              <th>Participaciones</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  Cargando expositores...
                </td>
              </tr>
            ) : expositores.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  No se encontraron expositores.
                </td>
              </tr>
            ) : (
              expositores.map((exp) => (
                <tr key={exp.ci}>
                  <td style={{ fontWeight: 700, color: '#f59e0b' }}>{exp.ci}</td>
                  <td style={{ fontWeight: 600, color: '#fff' }}>
                    {exp.nombre} {exp.paterno} {exp.materno || ''}
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                    <div>{exp.correo || <span style={{ color: '#64748b' }}>Sin correo</span>}</div>
                    {exp.telefono && <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Tel: {exp.telefono}</div>}
                  </td>
                  <td>
                    {exp.participoMasDeUnaVez ? (
                      <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 700 }}>
                        <Star size={12} fill="#f59e0b" /> {exp.totalParticipaciones} Ferias
                      </span>
                    ) : exp.totalParticipaciones === 1 ? (
                      <span className="badge badge-primary">
                        1 Feria
                      </span>
                    ) : (
                      <span className="badge badge-secondary" style={{ opacity: 0.7 }}>
                        Sin participaciones
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => handleOpenHistory(exp)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#818cf8' }}
                        title="Ver historial de ferias y stands"
                      >
                        <Calendar size={14} /> Historial ({exp.totalParticipaciones})
                      </button>
                      <button
                        onClick={() => handleOpenEdit(exp)}
                        className="btn btn-secondary btn-sm"
                        title="Editar datos del expositor"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(exp.ci)}
                        className="btn btn-danger btn-sm"
                        title="Eliminar expositor"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
          <div>
            Mostrando página {meta.page} de {meta.totalPages} ({meta.total} expositores en total)
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

      {/* Modal: Historial de Participaciones */}
      <Modal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title={`Historial de Ferias: ${selectedExpHistory?.nombre} ${selectedExpHistory?.paterno || ''} (CI ${selectedExpHistory?.ci})`}
      >
        <div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Este expositor ha participado en un total de <strong>{selectedExpHistory?.totalParticipaciones || 0}</strong> eventos feriales con los siguientes cargos y stands:
          </p>

          {(!selectedExpHistory?.participaciones || selectedExpHistory.participaciones.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px' }}>
              No tiene stands asignados formalmente en ferias registradas.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '420px', overflowY: 'auto' }}>
              {selectedExpHistory.participaciones.map((part: any, idx: number) => (
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
                      <Link to={`/ferias/${part.idFeria}`} target="_blank" style={{ color: '#818cf8', textDecoration: 'none' }}>
                        {part.nombreFeria}
                      </Link>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                      Fechas: {part.fechaInicio || 'N/A'} al {part.fechaFin || 'N/A'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Store size={12} /> Stand #{part.nroStand}
                    </span>
                    <span className="badge badge-primary">
                      {part.cargo || 'Expositor'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button onClick={() => setHistoryModalOpen(false)} className="btn btn-secondary">
              Cerrar
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Create / Edit Expositor */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExp ? `Editar Expositor: CI ${editingExp.ci}` : 'Registrar Nuevo Expositor'}
      >
        <form onSubmit={handleSubmit}>
          {!editingExp && (
            <div className="form-group">
              <label className="input-label">Cédula de Identidad (CI)</label>
              <input
                type="text"
                required
                value={formData.ciExpositor}
                onChange={(e) => setFormData({ ...formData, ciExpositor: e.target.value })}
                className="input-field"
                placeholder="Ej. 12345678"
              />
            </div>
          )}

          <div className="form-group">
            <label className="input-label">Nombres</label>
            <input
              type="text"
              required
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="input-field"
              placeholder="Ej. Juan Carlos"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="input-label">Apellido Paterno</label>
              <input
                type="text"
                value={formData.paterno}
                onChange={(e) => setFormData({ ...formData, paterno: e.target.value })}
                className="input-field"
                placeholder="Perez"
              />
            </div>
            <div className="form-group">
              <label className="input-label">Apellido Materno</label>
              <input
                type="text"
                value={formData.materno}
                onChange={(e) => setFormData({ ...formData, materno: e.target.value })}
                className="input-field"
                placeholder="Lopez"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="input-label">Correo Electrónico</label>
              <input
                type="email"
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                className="input-field"
                placeholder="juan@email.com"
              />
            </div>
            <div className="form-group">
              <label className="input-label">Teléfono de Contacto</label>
              <input
                type="text"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="input-field"
                placeholder="71234567"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editingExp ? 'Guardar Cambios' : 'Registrar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminExpositoresPage;

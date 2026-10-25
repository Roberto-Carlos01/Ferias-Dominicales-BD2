import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import Modal from '../../components/Modal';
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  Store,
  MapPin,
  Search,
} from 'lucide-react';

export const AdminFeriasPage: React.FC = () => {
  const [ferias, setFerias] = useState<any[]>([]);
  const [ubicaciones, setUbicaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFeria, setEditingFeria] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    fechaIni: '',
    fechaFin: '',
    horaInicio: '09:00:00',
    horaFin: '18:00:00',
    estado: 'PLANIFICADA',
    tipo: 'CULTURAL',
    idUbicacion: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [feriasRes, ubRes] = await Promise.all([
        apiClient.get('/ferias?limit=50', { params: { search } }),
        apiClient.get('/ubicaciones'),
      ]);
      setFerias(feriasRes.data.data || []);
      setUbicaciones(ubRes.data.data || []);
    } catch (err) {
      console.error('Error cargando ferias:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setEditingFeria(null);
    setFormData({
      nombre: '',
      descripcion: '',
      fechaIni: '',
      fechaFin: '',
      horaInicio: '09:00:00',
      horaFin: '18:00:00',
      estado: 'PLANIFICADA',
      tipo: 'CULTURAL',
      idUbicacion: ubicaciones[0]?.idUbicacion?.toString() || '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (f: any) => {
    setEditingFeria(f);
    setFormData({
      nombre: f.nombre || '',
      descripcion: f.descripcion || '',
      fechaIni: f.fechaInicio || '',
      fechaFin: f.fechaFin || '',
      horaInicio: f.horaInicio || '09:00:00',
      horaFin: f.horaFin || '18:00:00',
      estado: f.estado || 'PLANIFICADA',
      tipo: f.tipo || 'CULTURAL',
      idUbicacion: f.ubicacion?.id?.toString() || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        ...formData,
        idUbicacion: formData.idUbicacion ? Number(formData.idUbicacion) : null,
      };

      if (editingFeria) {
        await apiClient.patch(`/ferias/${editingFeria.idFeria}`, payload);
      } else {
        await apiClient.post('/ferias', payload);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar la feria');
    }
  };

  const handleDelete = async (idFeria: number) => {
    if (!window.confirm('¿Estás seguro de eliminar esta feria y sus registros asociados?')) {
      return;
    }

    try {
      await apiClient.delete(`/ferias/${idFeria}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar la feria');
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
          <h1 style={{ fontSize: '2.25rem', color: '#fff' }}>Gestión de Ferias Dominicales</h1>
        </div>

        <button onClick={handleOpenCreate} className="btn btn-primary">
          <Plus size={16} /> Nueva Feria
        </button>
      </div>

      {/* Table */}
      <div className="table-container glass-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre de Feria</th>
              <th>Fechas</th>
              <th>Horario</th>
              <th>Estado</th>
              <th>Tipo</th>
              <th>Ubicación</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  Cargando ferias...
                </td>
              </tr>
            ) : ferias.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  No hay ferias registradas.
                </td>
              </tr>
            ) : (
              ferias.map((f) => (
                <tr key={f.idFeria}>
                  <td style={{ color: '#64748b', fontWeight: 600 }}>#{f.idFeria}</td>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{f.nombre}</td>
                  <td style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                    {f.fechaInicio} al {f.fechaFin}
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    {f.horaInicio} - {f.horaFin}
                  </td>
                  <td>
                    <span className={`badge ${f.estado === 'ACTIVA' ? 'badge-success' : f.estado === 'FINALIZADA' ? 'badge-warning' : 'badge-primary'}`}>
                      {f.estado || 'PLANIFICADA'}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-info">{f.tipo || 'GENERAL'}</span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                    {f.ubicacion ? `${f.ubicacion.nombre} (${f.ubicacion.zona})` : 'Sin asignar'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <Link to={`/ferias/${f.idFeria}`} className="btn btn-secondary btn-sm" title="Ver detalle público">
                        <Store size={14} />
                      </Link>
                      <button onClick={() => handleOpenEdit(f)} className="btn btn-secondary btn-sm" title="Editar">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(f.idFeria)} className="btn btn-danger btn-sm" title="Eliminar">
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

      {/* Modal Create/Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFeria ? `Editar Feria #${editingFeria.idFeria}` : 'Crear Nueva Feria Dominical'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="input-label">Nombre de la Feria</label>
            <input
              type="text"
              required
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="input-field"
              placeholder="Ej. Feria de las Culturas 2026"
            />
          </div>

          <div className="form-group">
            <label className="input-label">Descripción</label>
            <textarea
              rows={3}
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="input-field"
              placeholder="Breve reseña sobre las actividades y stands"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="input-label">Fecha de Inicio</label>
              <input
                type="date"
                required
                value={formData.fechaIni}
                onChange={(e) => setFormData({ ...formData, fechaIni: e.target.value })}
                className="input-field"
              />
            </div>
            <div className="form-group">
              <label className="input-label">Fecha de Fin</label>
              <input
                type="date"
                required
                value={formData.fechaFin}
                onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="input-label">Hora Inicio</label>
              <input
                type="text"
                value={formData.horaInicio}
                onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                className="input-field"
                placeholder="09:00:00"
              />
            </div>
            <div className="form-group">
              <label className="input-label">Hora Fin</label>
              <input
                type="text"
                value={formData.horaFin}
                onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })}
                className="input-field"
                placeholder="18:00:00"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="input-label">Estado</label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                className="input-field"
              >
                <option value="PLANIFICADA">PLANIFICADA</option>
                <option value="ACTIVA">ACTIVA</option>
                <option value="FINALIZADA">FINALIZADA</option>
              </select>
            </div>

            <div className="form-group">
              <label className="input-label">Tipo de Feria</label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                className="input-field"
              >
                <option value="CULTURAL">CULTURAL</option>
                <option value="GASTRONOMICA">GASTRONOMICA</option>
                <option value="ARTESANAL">ARTESANAL</option>
                <option value="TECNOLOGICA">TECNOLOGICA</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="input-label">Recinto / Ubicación</label>
            <select
              value={formData.idUbicacion}
              onChange={(e) => setFormData({ ...formData, idUbicacion: e.target.value })}
              className="input-field"
            >
              <option value="">Selecciona una ubicación</option>
              {ubicaciones.map((u) => (
                <option key={u.idUbicacion} value={u.idUbicacion}>
                  {u.nombre} ({u.ciudad} - {u.zona})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editingFeria ? 'Guardar Cambios' : 'Crear Feria'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminFeriasPage;

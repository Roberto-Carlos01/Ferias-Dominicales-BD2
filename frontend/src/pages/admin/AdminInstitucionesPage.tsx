import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import Modal from '../../components/Modal';
import {
  Building,
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  Mail,
  Phone,
} from 'lucide-react';

export const AdminInstitucionesPage: React.FC = () => {
  const [instituciones, setInstituciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInst, setEditingInst] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    nit: '',
    razonSocial: '',
    correo: '',
    telefono: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/instituciones', { params: { search, limit: 50 } });
      setInstituciones(res.data.data || []);
    } catch (err) {
      console.error('Error cargando instituciones:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setEditingInst(null);
    setFormData({ nit: '', razonSocial: '', correo: '', telefono: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (i: any) => {
    setEditingInst(i);
    setFormData({
      nit: i.nit,
      razonSocial: i.razonSocial || '',
      correo: i.correo || '',
      telefono: i.telefono || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingInst) {
        await apiClient.patch(`/instituciones/${editingInst.nit}`, {
          razonSocial: formData.razonSocial,
          correo: formData.correo,
          telefono: formData.telefono,
        });
      } else {
        await apiClient.post('/instituciones', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar institución');
    }
  };

  const handleDelete = async (nit: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar la institución con NIT ${nit}?`)) return;
    try {
      await apiClient.delete(`/instituciones/${nit}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar institución');
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
          <h1 style={{ fontSize: '2.25rem', color: '#fff' }}>Gestión de Instituciones</h1>
        </div>

        <button onClick={handleOpenCreate} className="btn btn-primary">
          <Plus size={16} /> Registrar Institución
        </button>
      </div>

      {/* Table */}
      <div className="table-container glass-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>NIT</th>
              <th>Razón Social</th>
              <th>Correo Electrónico</th>
              <th>Teléfono</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  Cargando instituciones...
                </td>
              </tr>
            ) : instituciones.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  No hay instituciones registradas.
                </td>
              </tr>
            ) : (
              instituciones.map((inst) => (
                <tr key={inst.nit}>
                  <td style={{ fontWeight: 700, color: '#f59e0b' }}>{inst.nit}</td>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{inst.razonSocial}</td>
                  <td style={{ color: '#cbd5e1' }}>{inst.correo || '-'}</td>
                  <td style={{ color: '#cbd5e1' }}>{inst.telefono || '-'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <button onClick={() => handleOpenEdit(inst)} className="btn btn-secondary btn-sm" title="Editar">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(inst.nit)} className="btn btn-danger btn-sm" title="Eliminar">
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

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingInst ? `Editar Institución: NIT ${editingInst.nit}` : 'Registrar Nueva Institución'}
      >
        <form onSubmit={handleSubmit}>
          {!editingInst && (
            <div className="form-group">
              <label className="input-label">NIT</label>
              <input
                type="text"
                required
                value={formData.nit}
                onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
                className="input-field"
                placeholder="Ej. 1020304050"
              />
            </div>
          )}

          <div className="form-group">
            <label className="input-label">Razón Social</label>
            <input
              type="text"
              required
              value={formData.razonSocial}
              onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
              className="input-field"
              placeholder="Ej. Gobierno Autónomo Municipal de La Paz"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="input-label">Correo Institucional</label>
              <input
                type="email"
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                className="input-field"
                placeholder="contacto@institucion.gob.bo"
              />
            </div>
            <div className="form-group">
              <label className="input-label">Teléfono</label>
              <input
                type="text"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="input-field"
                placeholder="22650000"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editingInst ? 'Guardar Cambios' : 'Registrar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminInstitucionesPage;

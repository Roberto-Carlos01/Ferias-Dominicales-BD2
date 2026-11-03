import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import Modal from '../../components/Modal';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Store,
  Users,
  Package,
  CheckCircle,
  XCircle,
  AlertCircle,
  Layers,
  Ruler,
  MapPin,
} from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────

const ESTADOS_STAND = ['DISPONIBLE', 'OCUPADO', 'RESERVADO', 'MANTENIMIENTO'];

const estadoBadgeClass: Record<string, string> = {
  DISPONIBLE: 'badge-success',
  OCUPADO: 'badge-warning',
  RESERVADO: 'badge-primary',
  MANTENIMIENTO: 'badge-danger',
};

const estadoIcon: Record<string, React.ReactNode> = {
  DISPONIBLE: <CheckCircle size={14} />,
  OCUPADO: <Users size={14} />,
  RESERVADO: <AlertCircle size={14} />,
  MANTENIMIENTO: <XCircle size={14} />,
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface Stand {
  nroStand: number;
  idFeria: number;
  ancho: number;
  largo: number;
  ubicacionInterna: string;
  estado: string;
  tipoStand?: string;
  encargado?: { ci: string; nombre: string; cargo: string } | null;
  expositores?: { ci: string; nombre: string; cargo: string }[];
  productos?: { id: number; nombre: string; precio: number }[];
  exposiciones?: { id: number; titulo: string }[];
}

interface Feria {
  idFeria: number;
  nombre: string;
  estado: string;
  fechaInicio: string;
  fechaFin: string;
}

const defaultForm = {
  nroStand: '',
  ancho: '3.00',
  largo: '2.00',
  ubicacionInterna: '',
  estado: 'DISPONIBLE',
};

// ─── Component ───────────────────────────────────────────────────────────────

export const AdminStandsPage: React.FC = () => {
  const { feriaId } = useParams<{ feriaId: string }>();
  const navigate = useNavigate();

  const [feria, setFeria] = useState<Feria | null>(null);
  const [stands, setStands] = useState<Stand[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStand, setEditingStand] = useState<Stand | null>(null);
  const [detailStand, setDetailStand] = useState<Stand | null>(null);
  const [formData, setFormData] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [filterEstado, setFilterEstado] = useState('TODOS');

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchData = async () => {
    setLoading(true);
    try {
      const [feriaRes, standsRes] = await Promise.all([
        apiClient.get(`/ferias/${feriaId}`),
        apiClient.get(`/ferias/${feriaId}/stands`),
      ]);
      setFeria(feriaRes.data);
      setStands(standsRes.data || []);
    } catch (err: any) {
      console.error('Error cargando stands:', err);
      if (err.response?.status === 404) {
        navigate('/admin/ferias');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (feriaId) fetchData();
  }, [feriaId]);

  // ── Modals ───────────────────────────────────────────────────────────────

  const handleOpenCreate = () => {
    setEditingStand(null);
    setFormData(defaultForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Stand) => {
    setEditingStand(s);
    setFormData({
      nroStand: s.nroStand.toString(),
      ancho: s.ancho.toString(),
      largo: s.largo.toString(),
      ubicacionInterna: s.ubicacionInterna || '',
      estado: s.estado || 'DISPONIBLE',
    });
    setIsModalOpen(true);
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        ancho: parseFloat(formData.ancho) || 3.0,
        largo: parseFloat(formData.largo) || 2.0,
        ubicacionInterna: formData.ubicacionInterna || undefined,
        estado: formData.estado,
      };

      if (!editingStand && formData.nroStand) {
        payload.nroStand = parseInt(formData.nroStand);
      }

      if (editingStand) {
        await apiClient.patch(
          `/ferias/${feriaId}/stands/${editingStand.nroStand}`,
          payload,
        );
      } else {
        await apiClient.post(`/ferias/${feriaId}/stands`, payload);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar el stand');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = async (nroStand: number) => {
    if (
      !window.confirm(
        `¿Eliminar el Stand #${nroStand}? Esta acción eliminará también sus exposiciones y productos asociados.`,
      )
    )
      return;
    try {
      await apiClient.delete(`/ferias/${feriaId}/stands/${nroStand}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar el stand');
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────

  const filteredStands =
    filterEstado === 'TODOS'
      ? stands
      : stands.filter((s) => s.estado === filterEstado);

  const stats = {
    total: stands.length,
    disponibles: stands.filter((s) => s.estado === 'DISPONIBLE').length,
    ocupados: stands.filter((s) => s.estado === 'OCUPADO').length,
    reservados: stands.filter((s) => s.estado === 'RESERVADO').length,
    mantenimiento: stands.filter((s) => s.estado === 'MANTENIMIENTO').length,
  };

  const areaTotal = stands.reduce(
    (acc, s) => acc + Number(s.ancho) * Number(s.largo),
    0,
  );

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '4rem 1.5rem', textAlign: 'center', color: '#94a3b8' }}>
        Cargando stands de la feria...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.5rem', width: '100%' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Link
            to="/admin/ferias"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}
          >
            <ArrowLeft size={15} /> Volver a Gestión de Ferias
          </Link>
          <h1 style={{ fontSize: '2rem', color: '#fff', marginBottom: '0.25rem' }}>
            <Store size={28} style={{ color: '#818cf8', marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Stands de la Feria
          </h1>
          {feria && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ color: '#cbd5e1', fontSize: '1rem', fontWeight: 600 }}>
                {feria.nombre}
              </span>
              <span className={`badge ${estadoBadgeClass[feria.estado] || 'badge-primary'}`}>
                {feria.estado}
              </span>
              <span style={{ color: '#64748b', fontSize: '0.82rem' }}>
                {feria.fechaInicio} — {feria.fechaFin}
              </span>
            </div>
          )}
        </div>

        <button onClick={handleOpenCreate} className="btn btn-primary">
          <Plus size={16} /> Agregar Stand
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Stands', value: stats.total, color: '#818cf8' },
          { label: 'Disponibles', value: stats.disponibles, color: '#10b981' },
          { label: 'Ocupados', value: stats.ocupados, color: '#f59e0b' },
          { label: 'Reservados', value: stats.reservados, color: '#0ea5e9' },
          { label: 'Mantenimiento', value: stats.mantenimiento, color: '#ef4444' },
          { label: 'Área Total m²', value: areaTotal.toFixed(1), color: '#c084fc' },
        ].map((kpi, i) => (
          <div
            key={i}
            className="glass-card"
            style={{ padding: '1.25rem', textAlign: 'center' }}
          >
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: kpi.color }}>
              {kpi.value}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.25rem' }}>
              {kpi.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter bar ── */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {['TODOS', ...ESTADOS_STAND].map((estado) => (
          <button
            key={estado}
            onClick={() => setFilterEstado(estado)}
            className={`btn btn-sm ${filterEstado === estado ? 'btn-primary' : 'btn-secondary'}`}
          >
            {estado}
          </button>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="table-container glass-card">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '70px' }}>#Stand</th>
              <th>Ubicación Interna</th>
              <th style={{ textAlign: 'center' }}>Dimensiones</th>
              <th style={{ textAlign: 'center' }}>Área m²</th>
              <th style={{ textAlign: 'center' }}>Estado</th>
              <th style={{ textAlign: 'center' }}>Tipo</th>
              <th style={{ textAlign: 'center' }}>Expositores</th>
              <th style={{ textAlign: 'center' }}>Productos</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredStands.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  {stands.length === 0
                    ? 'No hay stands registrados para esta feria. ¡Agrega el primero!'
                    : `No hay stands con estado "${filterEstado}".`}
                </td>
              </tr>
            ) : (
              filteredStands.map((s) => (
                <tr key={s.nroStand}>
                  <td style={{ fontWeight: 700, color: '#818cf8', fontSize: '1.1rem' }}>
                    #{s.nroStand}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#cbd5e1' }}>
                      <MapPin size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
                      {s.ubicacionInterna || <span style={{ color: '#475569' }}>—</span>}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                      <Ruler size={12} />
                      {Number(s.ancho).toFixed(2)} × {Number(s.largo).toFixed(2)} m
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', color: '#c084fc', fontWeight: 600 }}>
                    {(Number(s.ancho) * Number(s.largo)).toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge ${estadoBadgeClass[s.estado] || 'badge-primary'}`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      {estadoIcon[s.estado]}
                      {s.estado}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>
                      {s.tipoStand || 'DISPONIBLE'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', color: '#94a3b8' }}>
                      <Users size={13} />
                      <span>{s.expositores?.length ?? 0}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', color: '#94a3b8' }}>
                      <Package size={13} />
                      <span>{s.productos?.length ?? 0}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => setDetailStand(s)}
                        className="btn btn-secondary btn-sm"
                        title="Ver detalle"
                      >
                        <Layers size={14} />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(s)}
                        className="btn btn-secondary btn-sm"
                        title="Editar stand"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(s.nroStand)}
                        className="btn btn-danger btn-sm"
                        title="Eliminar stand"
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

      {/* ── Modal Crear / Editar ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingStand
            ? `Editar Stand #${editingStand.nroStand} — Feria #${feriaId}`
            : `Agregar Nuevo Stand — Feria #${feriaId}`
        }
      >
        <form onSubmit={handleSubmit}>

          {/* Número de stand (solo creación) */}
          {!editingStand && (
            <div className="form-group">
              <label className="input-label">
                Nro. de Stand{' '}
                <span style={{ color: '#94a3b8', fontWeight: 400 }}>
                  (dejar vacío para asignar automáticamente)
                </span>
              </label>
              <input
                type="number"
                min={1}
                value={formData.nroStand}
                onChange={(e) => setFormData({ ...formData, nroStand: e.target.value })}
                className="input-field"
                placeholder="Ej. 5  (auto si vacío)"
              />
            </div>
          )}

          {/* Dimensiones */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="input-label">Ancho (metros)</label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                required
                value={formData.ancho}
                onChange={(e) => setFormData({ ...formData, ancho: e.target.value })}
                className="input-field"
                placeholder="Ej. 3.00"
              />
            </div>
            <div className="form-group">
              <label className="input-label">Largo (metros)</label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                required
                value={formData.largo}
                onChange={(e) => setFormData({ ...formData, largo: e.target.value })}
                className="input-field"
                placeholder="Ej. 2.00"
              />
            </div>
          </div>

          {/* Área calculada en tiempo real */}
          {formData.ancho && formData.largo && (
            <div style={{
              background: 'rgba(129, 140, 248, 0.1)',
              border: '1px solid rgba(129, 140, 248, 0.3)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#818cf8',
              fontSize: '0.9rem',
            }}>
              <Ruler size={15} />
              Área calculada:{' '}
              <strong>
                {(parseFloat(formData.ancho || '0') * parseFloat(formData.largo || '0')).toFixed(2)} m²
              </strong>
            </div>
          )}

          {/* Ubicación interna */}
          <div className="form-group">
            <label className="input-label">Ubicación Interna</label>
            <input
              type="text"
              value={formData.ubicacionInterna}
              onChange={(e) => setFormData({ ...formData, ubicacionInterna: e.target.value })}
              className="input-field"
              placeholder="Ej. Sector A — Fila 2, Puesto 3"
            />
          </div>

          {/* Estado */}
          <div className="form-group">
            <label className="input-label">Estado del Stand</label>
            <select
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              className="input-field"
            >
              {ESTADOS_STAND.map((est) => (
                <option key={est} value={est}>{est}</option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary"
              disabled={saving}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Guardando...' : editingStand ? 'Guardar Cambios' : 'Crear Stand'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Modal Detalle ── */}
      <Modal
        isOpen={!!detailStand}
        onClose={() => setDetailStand(null)}
        title={`Detalle Stand #${detailStand?.nroStand}`}
      >
        {detailStand && (
          <div>
            {/* Datos básicos */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}>
              {[
                { label: 'Nro. Stand', value: `#${detailStand.nroStand}` },
                { label: 'Estado', value: detailStand.estado },
                { label: 'Ancho', value: `${Number(detailStand.ancho).toFixed(2)} m` },
                { label: 'Largo', value: `${Number(detailStand.largo).toFixed(2)} m` },
                { label: 'Área', value: `${(Number(detailStand.ancho) * Number(detailStand.largo)).toFixed(2)} m²` },
                { label: 'Tipo', value: detailStand.tipoStand || 'DISPONIBLE' },
              ].map((item, i) => (
                <div key={i} className="glass-card" style={{ padding: '0.75rem 1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    {item.label}
                  </div>
                  <div style={{ color: '#fff', fontWeight: 600 }}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Ubicación */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Ubicación Interna
              </div>
              <div style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={14} style={{ color: '#818cf8' }} />
                {detailStand.ubicacionInterna || 'No especificada'}
              </div>
            </div>

            {/* Expositores */}
            {(detailStand.expositores?.length ?? 0) > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Users size={13} /> Expositores ({detailStand.expositores!.length})
                </div>
                {detailStand.expositores!.map((exp, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)', color: '#cbd5e1', fontSize: '0.88rem' }}>
                    <span>{exp.nombre}</span>
                    <span style={{ color: '#94a3b8' }}>{exp.cargo}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Productos */}
            {(detailStand.productos?.length ?? 0) > 0 && (
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Package size={13} /> Productos ({detailStand.productos!.length})
                </div>
                {detailStand.productos!.map((prod, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)', color: '#cbd5e1', fontSize: '0.88rem' }}>
                    <span>{prod.nombre}</span>
                    <span style={{ color: '#10b981' }}>Bs. {Number(prod.precio).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setDetailStand(null)} className="btn btn-secondary">
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminStandsPage;


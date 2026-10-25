import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import Modal from '../../components/Modal';
import {
  Users,
  UserCheck,
  Link as LinkIcon,
  Plus,
  Shield,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Search,
  Sparkles,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

export const AdminUsuariosPage: React.FC = () => {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [expositores, setExpositores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'SIN_EXPOSITOR' | 'CON_EXPOSITOR' | 'ADMINS'>('ALL');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);

  // Modal: Vincular Expositor Existente
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [selectedCi, setSelectedCi] = useState<string>('');

  // Modal: Convertir Usuario en Nuevo Expositor
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [convertUser, setConvertUser] = useState<any | null>(null);
  const [convertForm, setConvertForm] = useState({
    ci: '',
    nombre: '',
    paterno: '',
    materno: '',
    telefono: '',
    direccion: '',
  });

  // Modal: Crear Nuevo Usuario
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    correo: '',
    password: '',
    rol: 'USUARIO',
    ciExpositor: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = {
        search: search || undefined,
        page,
        limit: 25,
      };

      if (filterTab === 'SIN_EXPOSITOR') {
        params.sinExpositor = 'true';
      } else if (filterTab === 'CON_EXPOSITOR') {
        params.soloExpositores = 'true';
      }

      const [uRes, eRes] = await Promise.all([
        apiClient.get('/usuarios', { params }),
        apiClient.get('/expositores?limit=200'),
      ]);

      let data = uRes.data.data || [];
      if (filterTab === 'ADMINS') {
        data = data.filter((u: any) => u.rol === 'ADMIN');
      }

      setUsuarios(data);
      setMeta(uRes.data.meta || null);
      setExpositores(eRes.data.data || []);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, filterTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  // Vincular Expositor Existente
  const handleOpenLinkModal = (user: any) => {
    setSelectedUser(user);
    setSelectedCi(user.ciExpositor || '');
    setLinkModalOpen(true);
  };

  const handleSaveLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      await apiClient.patch(`/usuarios/${selectedUser.idUsuario}/expositor`, {
        ciExpositor: selectedCi || null,
      });
      setLinkModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al vincular expositor');
    }
  };

  // Convertir Usuario en Expositor
  const handleOpenConvertModal = (user: any) => {
    setConvertUser(user);
    const emailPrefix = user.correo.split('@')[0];
    setConvertForm({
      ci: '',
      nombre: emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1),
      paterno: '',
      materno: '',
      telefono: '',
      direccion: 'La Paz, Bolivia',
    });
    setConvertModalOpen(true);
  };

  const handleSaveConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertUser) return;
    try {
      await apiClient.post(`/usuarios/${convertUser.idUsuario}/convertir-expositor`, convertForm);
      setConvertModalOpen(false);
      alert(`¡Usuario convertido en Expositor exitosamente con CI ${convertForm.ci}!`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al convertir en expositor');
    }
  };

  // Cambiar Rol (ADMIN <-> USUARIO)
  const handleToggleRol = async (user: any) => {
    const nuevoRol = user.rol === 'ADMIN' ? 'USUARIO' : 'ADMIN';
    const confirmMsg = nuevoRol === 'ADMIN'
      ? `¿Deseas promover a ${user.correo} como ADMINISTRADOR con permisos totales?`
      : `¿Deseas quitar privilegios de Administrador a ${user.correo}?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await apiClient.patch(`/usuarios/${user.idUsuario}/rol`, { rol: nuevoRol });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al actualizar rol');
    }
  };

  // Toggle Estado (ACTIVO <-> INACTIVO)
  const handleToggleEstado = async (u: any) => {
    const nuevoEstado = u.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    try {
      await apiClient.patch(`/usuarios/${u.idUsuario}/estado`, { estado: nuevoEstado });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al cambiar estado');
    }
  };

  // Crear Usuario
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/usuarios', {
        correo: newUser.correo,
        password: newUser.password,
        rol: newUser.rol,
        ciExpositor: newUser.ciExpositor || null,
      });
      setCreateModalOpen(false);
      setNewUser({ correo: '', password: '', rol: 'USUARIO', ciExpositor: '' });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al crear usuario');
    }
  };

  // Eliminar
  const handleDelete = async (id: number, correo: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar permanentemente al usuario ${correo} (#${id})?`)) return;
    try {
      await apiClient.delete(`/usuarios/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar usuario');
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
            <Users size={32} style={{ color: '#10b981' }} /> Usuarios y Cuentas de Acceso
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Filtra ciudadanos comunes, expositores vinculados y administradores. Promueve roles o convierte usuarios en expositores
          </p>
        </div>

        <button onClick={() => setCreateModalOpen(true)} className="btn btn-primary">
          <Plus size={16} /> Crear Usuario
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              setFilterTab('ALL');
              setPage(1);
            }}
            className={`btn btn-sm ${filterTab === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Todos
          </button>
          <button
            onClick={() => {
              setFilterTab('SIN_EXPOSITOR');
              setPage(1);
            }}
            className={`btn btn-sm ${filterTab === 'SIN_EXPOSITOR' ? 'btn-primary' : 'btn-secondary'}`}
          >
            👤 Usuarios sin Expositor
          </button>
          <button
            onClick={() => {
              setFilterTab('CON_EXPOSITOR');
              setPage(1);
            }}
            className={`btn btn-sm ${filterTab === 'CON_EXPOSITOR' ? 'btn-primary' : 'btn-secondary'}`}
          >
            🎪 Expositores Vinculados
          </button>
          <button
            onClick={() => {
              setFilterTab('ADMINS');
              setPage(1);
            }}
            className={`btn btn-sm ${filterTab === 'ADMINS' ? 'btn-primary' : 'btn-secondary'}`}
          >
            🛡️ Administradores
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', minWidth: '280px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Buscar por correo, nombre o CI..."
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

      {/* Users Table */}
      <div className="table-container glass-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Correo Electrónico</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Vínculo Expositor</th>
              <th>Datos Personales</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  Cargando usuarios...
                </td>
              </tr>
            ) : usuarios.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  No se encontraron usuarios para los filtros seleccionados.
                </td>
              </tr>
            ) : (
              usuarios.map((u) => (
                <tr key={u.idUsuario}>
                  <td style={{ color: '#64748b', fontWeight: 600 }}>#{u.idUsuario}</td>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{u.correo}</td>
                  <td>
                    <span className={`badge ${u.rol === 'ADMIN' ? 'badge-warning' : 'badge-primary'}`}>
                      {u.rol}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleEstado(u)}
                      className={`badge ${u.estado === 'ACTIVO' ? 'badge-success' : 'badge-danger'}`}
                      style={{ cursor: 'pointer', border: 'none' }}
                      title="Haz clic para alternar ACTIVO / INACTIVO"
                    >
                      {u.estado}
                    </button>
                  </td>
                  <td>
                    {u.ciExpositor ? (
                      <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <LinkIcon size={12} /> CI: {u.ciExpositor}
                      </span>
                    ) : (
                      <span style={{ color: '#f59e0b', fontSize: '0.82rem', fontStyle: 'italic', background: 'rgba(245, 158, 11, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        Sin vincular (Ciudadano)
                      </span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                    {u.expositor ? (
                      <div>
                        <strong>{u.expositor.nombre} {u.expositor.paterno || ''} {u.expositor.materno || ''}</strong>
                        {u.expositor.telefono && <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Tel: {u.expositor.telefono}</div>}
                      </div>
                    ) : (
                      <span style={{ color: '#64748b', fontStyle: 'italic' }}>Solo cuenta de usuario</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.35rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {/* Convertir en Expositor si no está vinculado */}
                      {!u.ciExpositor && (
                        <button
                          onClick={() => handleOpenConvertModal(u)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                          title="Crear ficha de expositor para este usuario"
                        >
                          <UserPlus size={14} /> Convertir a Expositor
                        </button>
                      )}

                      {/* Vincular / Reasignar CI */}
                      <button
                        onClick={() => handleOpenLinkModal(u)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: u.ciExpositor ? '#fcd34d' : '#818cf8', borderColor: u.ciExpositor ? 'rgba(245, 158, 11, 0.4)' : undefined }}
                        title="Vincular con un expositor existente"
                      >
                        <LinkIcon size={14} /> {u.ciExpositor ? 'Reasignar' : 'Vincular CI'}
                      </button>

                      {/* Toggle Admin Role */}
                      <button
                        onClick={() => handleToggleRol(u)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: u.rol === 'ADMIN' ? '#f87171' : '#c084fc', borderColor: u.rol === 'ADMIN' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(192, 132, 252, 0.3)' }}
                        title={u.rol === 'ADMIN' ? 'Degradar a USUARIO' : 'Promover a ADMIN'}
                      >
                        {u.rol === 'ADMIN' ? <ShieldAlert size={14} /> : <ShieldCheck size={14} />}
                        {u.rol === 'ADMIN' ? 'Quitar Admin' : 'Hacer Admin'}
                      </button>

                      {/* Eliminar */}
                      <button
                        onClick={() => handleDelete(u.idUsuario, u.correo)}
                        className="btn btn-danger btn-sm"
                        title="Eliminar cuenta"
                      >
                        Eliminar
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
            Mostrando página {meta.page} de {meta.totalPages} ({meta.total} usuarios en total)
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

      {/* Modal: Convertir en Expositor */}
      <Modal
        isOpen={convertModalOpen}
        onClose={() => setConvertModalOpen(false)}
        title={`Convertir Usuario en Expositor: ${convertUser?.correo}`}
      >
        <form onSubmit={handleSaveConvert}>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            Registra los datos oficiales del expositor para este usuario. Se creará automáticamente la ficha en la tabla
            <code style={{ color: '#10b981', margin: '0 0.3rem' }}>EXPOSITOR</code> y quedará enlazado 1 a 1 de inmediato.
          </p>

          <div className="form-group">
            <label className="input-label">Cédula de Identidad (CI)</label>
            <input
              type="text"
              required
              value={convertForm.ci}
              onChange={(e) => setConvertForm({ ...convertForm, ci: e.target.value })}
              className="input-field"
              placeholder="Ej. 8492031"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="input-label">Nombres</label>
              <input
                type="text"
                required
                value={convertForm.nombre}
                onChange={(e) => setConvertForm({ ...convertForm, nombre: e.target.value })}
                className="input-field"
                placeholder="Ej. Juan Carlos"
              />
            </div>
            <div className="form-group">
              <label className="input-label">Apellido Paterno</label>
              <input
                type="text"
                value={convertForm.paterno}
                onChange={(e) => setConvertForm({ ...convertForm, paterno: e.target.value })}
                className="input-field"
                placeholder="Perez"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="input-label">Apellido Materno</label>
              <input
                type="text"
                value={convertForm.materno}
                onChange={(e) => setConvertForm({ ...convertForm, materno: e.target.value })}
                className="input-field"
                placeholder="Lopez"
              />
            </div>
            <div className="form-group">
              <label className="input-label">Teléfono de Contacto</label>
              <input
                type="text"
                value={convertForm.telefono}
                onChange={(e) => setConvertForm({ ...convertForm, telefono: e.target.value })}
                className="input-field"
                placeholder="71234567"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="input-label">Dirección / Residencia</label>
            <input
              type="text"
              value={convertForm.direccion}
              onChange={(e) => setConvertForm({ ...convertForm, direccion: e.target.value })}
              className="input-field"
              placeholder="Ej. Zona Sopocachi, Calle Belisario Salinas"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setConvertModalOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <Sparkles size={16} /> Crear y Vincular Expositor
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Vincular Expositor */}
      <Modal
        isOpen={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        title={`Vincular Expositor a: ${selectedUser?.correo}`}
      >
        <form onSubmit={handleSaveLink}>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            Selecciona un expositor existente de la base de datos para habilitar el perfil de expositor
            y acceso a "Mis Participaciones" para este usuario.
          </p>

          <div className="form-group">
            <label className="input-label">Expositor por CI / Nombre</label>
            <select
              value={selectedCi}
              onChange={(e) => setSelectedCi(e.target.value)}
              className="input-field"
            >
              <option value="">-- Sin expositor (Desvincular) --</option>
              {expositores.map((exp) => (
                <option key={exp.ci} value={exp.ci}>
                  CI {exp.ci} — {exp.nombre} {exp.paterno || ''} ({exp.correo || 'Sin correo'})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setLinkModalOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Guardar Vinculación
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Crear Usuario */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Crear Nuevo Usuario"
      >
        <form onSubmit={handleCreateUser}>
          <div className="form-group">
            <label className="input-label">Correo Electrónico</label>
            <input
              type="email"
              required
              value={newUser.correo}
              onChange={(e) => setNewUser({ ...newUser, correo: e.target.value })}
              className="input-field"
              placeholder="nuevo@correo.com"
            />
          </div>

          <div className="form-group">
            <label className="input-label">Contraseña</label>
            <input
              type="password"
              required
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="input-field"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div className="form-group">
            <label className="input-label">Rol del Usuario</label>
            <select
              value={newUser.rol}
              onChange={(e) => setNewUser({ ...newUser, rol: e.target.value })}
              className="input-field"
            >
              <option value="USUARIO">USUARIO (Estándar)</option>
              <option value="ADMIN">ADMIN (Administrador)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="input-label">Vincular Expositor Inmediatamente (Opcional)</label>
            <select
              value={newUser.ciExpositor}
              onChange={(e) => setNewUser({ ...newUser, ciExpositor: e.target.value })}
              className="input-field"
            >
              <option value="">-- Sin vincular por ahora (Usuario Ciudadano) --</option>
              {expositores.map((exp) => (
                <option key={exp.ci} value={exp.ci}>
                  CI {exp.ci} — {exp.nombre} {exp.paterno || ''}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setCreateModalOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Crear Usuario
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminUsuariosPage;

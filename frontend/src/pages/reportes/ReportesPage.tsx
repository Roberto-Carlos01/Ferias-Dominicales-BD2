import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../../api/client';
import {
  BarChart3,
  Database,
  Store,
  Package,
  MapPin,
  Calendar,
  Users,
  Award,
  Building,
  CheckCircle2,
  RefreshCw,
  Search,
  Layers,
  ArrowRight,
  TrendingUp,
  Zap,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Sliders,
  DollarSign,
  FileText,
  Info,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ReportesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'recintos';
  const initialFeria = searchParams.get('feria') || '';

  const [activeTab, setActiveTab] = useState<'recintos' | 'categorias' | 'catalogo' | 'metricas' | 'triggers' | 'diagnostico'>(
    initialTab as any,
  );

  // Ferias list for dropdown selectors
  const [feriasList, setFeriasList] = useState<any[]>([]);
  const [selectedFeriaId, setSelectedFeriaId] = useState<number>(initialFeria ? Number(initialFeria) : 1);

  // Tab 1: Recintos y Ferias (Cursor 1)
  const [recintos, setRecintos] = useState<any[]>([]);
  const [loadingRecintos, setLoadingRecintos] = useState(false);
  const [recintoSearch, setRecintoSearch] = useState('');
  const [recintoCiudadFilter, setRecintoCiudadFilter] = useState('ALL');
  const [recintosSource, setRecintosSource] = useState('');

  // Tab 2: Categorías (Cursor 2)
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [expandedCategoria, setExpandedCategoria] = useState<string | null>(null);
  const [categoriasSource, setCategoriasSource] = useState('');

  // Tab 3: Catálogo por Feria (Cursor 3)
  const [catalogo, setCatalogo] = useState<any[]>([]);
  const [loadingCatalogo, setLoadingCatalogo] = useState(false);
  const [catalogoSearch, setCatalogoSearch] = useState('');
  const [catalogoCategoriaFilter, setCatalogoCategoriaFilter] = useState('ALL');
  const [catalogoViewMode, setCatalogoViewMode] = useState<'stands' | 'grid'>('stands');
  const [catalogoSource, setCatalogoSource] = useState('');

  // Tab 4: Métricas Clave de Feria
  const [metricas, setMetricas] = useState<any>(null);
  const [loadingMetricas, setLoadingMetricas] = useState(false);
  const [updatingEstado, setUpdatingEstado] = useState(false);

  // Tab 5: Laboratorio de Triggers
  const [trigger1Loading, setTrigger1Loading] = useState(false);
  const [trigger1Result, setTrigger1Result] = useState<any>(null);
  const [t1Stand, setT1Stand] = useState('2');
  const [t1Ci, setT1Ci] = useState('7401894P');
  const [t1Cargo, setT1Cargo] = useState('Encargado de Stand');

  const [trigger2Loading, setTrigger2Loading] = useState(false);
  const [trigger2Result, setTrigger2Result] = useState<any>(null);
  const [trigger2Error, setTrigger2Error] = useState<string | null>(null);
  const [t2Stock, setT2Stock] = useState(-5);

  const [trigger3Loading, setTrigger3Loading] = useState(false);
  const [trigger3Result, setTrigger3Result] = useState<any>(null);
  const [trigger3Error, setTrigger3Error] = useState<string | null>(null);
  const [t3FechaIni, setT3FechaIni] = useState('2026-12-25');
  const [t3FechaFin, setT3FechaFin] = useState('2026-12-10');

  // Tab 6: Diagnóstico de la Base de Datos
  const [diagnostico, setDiagnostico] = useState<any>(null);
  const [loadingDiagnostico, setLoadingDiagnostico] = useState(false);

  // Load Ferias List
  useEffect(() => {
    const fetchFerias = async () => {
      try {
        const res = await apiClient.get('/reportes/ferias-list');
        setFeriasList(res.data || []);
        if (res.data?.length > 0 && !initialFeria) {
          setSelectedFeriaId(res.data[0].idFeria);
        }
      } catch (err) {
        console.error('Error cargando lista de ferias:', err);
      }
    };
    fetchFerias();
  }, [initialFeria]);

  // Handle Tab Switch
  const handleTabChange = (tab: 'recintos' | 'categorias' | 'catalogo' | 'metricas' | 'triggers' | 'diagnostico') => {
    setActiveTab(tab);
    setSearchParams({ tab, feria: String(selectedFeriaId) });
  };

  // 1. Fetch Cursor 1
  useEffect(() => {
    if (activeTab === 'recintos') {
      const fetchRecintos = async () => {
        setLoadingRecintos(true);
        try {
          const res = await apiClient.get('/reportes/recintos-feriales');
          setRecintos(res.data?.data || []);
          setRecintosSource(res.data?.source || '');
        } catch (err) {
          console.error('Error cargando reporte de recintos:', err);
          toast.error('Error cargando reporte de recintos feriales');
        } finally {
          setLoadingRecintos(false);
        }
      };
      fetchRecintos();
    }
  }, [activeTab]);

  // 2. Fetch Cursor 2
  useEffect(() => {
    if (activeTab === 'categorias') {
      const fetchCategorias = async () => {
        setLoadingCategorias(true);
        try {
          const res = await apiClient.get('/reportes/categorias-productos');
          setCategorias(res.data?.data || []);
          setCategoriasSource(res.data?.source || '');
        } catch (err) {
          console.error('Error cargando reporte de categorías:', err);
          toast.error('Error cargando análisis de categorías');
        } finally {
          setLoadingCategorias(false);
        }
      };
      fetchCategorias();
    }
  }, [activeTab]);

  // 3. Fetch Cursor 3
  useEffect(() => {
    if (activeTab === 'catalogo' && selectedFeriaId) {
      const fetchCatalogo = async () => {
        setLoadingCatalogo(true);
        try {
          const res = await apiClient.get(`/reportes/ferias/${selectedFeriaId}/catalogo`);
          setCatalogo(res.data?.data || []);
          setCatalogoSource(res.data?.source || '');
        } catch (err) {
          console.error('Error cargando catálogo:', err);
          toast.error('Error cargando catálogo de la feria');
        } finally {
          setLoadingCatalogo(false);
        }
      };
      fetchCatalogo();
    }
  }, [activeTab, selectedFeriaId]);

  // 4. Fetch Métricas de Feria
  useEffect(() => {
    if (activeTab === 'metricas' && selectedFeriaId) {
      const fetchMetricas = async () => {
        setLoadingMetricas(true);
        try {
          const res = await apiClient.get(`/reportes/ferias/${selectedFeriaId}/metricas`);
          setMetricas(res.data);
        } catch (err) {
          console.error('Error cargando métricas:', err);
          toast.error('Error cargando métricas de la feria');
        } finally {
          setLoadingMetricas(false);
        }
      };
      fetchMetricas();
    }
  }, [activeTab, selectedFeriaId]);

  // 5. Fetch Diagnóstico BD
  useEffect(() => {
    if (activeTab === 'diagnostico') {
      const fetchDiagnostico = async () => {
        setLoadingDiagnostico(true);
        try {
          const res = await apiClient.get('/reportes/diagnostico-bd');
          setDiagnostico(res.data);
        } catch (err) {
          console.error('Error cargando diagnóstico:', err);
        } finally {
          setLoadingDiagnostico(false);
        }
      };
      fetchDiagnostico();
    }
  }, [activeTab]);

  // Handler: Actualizar estado de feria según fecha
  const handleActualizarEstado = async () => {
    if (!selectedFeriaId) return;
    setUpdatingEstado(true);
    try {
      const res = await apiClient.post(`/reportes/ferias/${selectedFeriaId}/actualizar-estado`);
      toast.success(`Estado actualizado exitosamente: ${res.data.estadoActualizado}`);
      // Refetch métricas
      const metRes = await apiClient.get(`/reportes/ferias/${selectedFeriaId}/metricas`);
      setMetricas(metRes.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al actualizar estado');
    } finally {
      setUpdatingEstado(false);
    }
  };

  // Handler: Test Trigger 1 (Asignar expositor)
  const handleTestTrigger1 = async () => {
    setTrigger1Loading(true);
    setTrigger1Result(null);
    try {
      const res = await apiClient.post('/reportes/triggers/test-asignar-expositor', {
        idFeria: Number(selectedFeriaId),
        nroStand: Number(t1Stand),
        ciExpositor: t1Ci,
        cargo: t1Cargo,
      });
      setTrigger1Result(res.data);
      toast.success('Expositor asignado. ¡Stand actualizado a Ocupado por Trigger!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error en la prueba de trigger');
    } finally {
      setTrigger1Loading(false);
    }
  };

  // Handler: Test Trigger 2 (Stock negativo)
  const handleTestTrigger2 = async () => {
    setTrigger2Loading(true);
    setTrigger2Result(null);
    setTrigger2Error(null);
    try {
      const res = await apiClient.post('/reportes/triggers/test-stock-negativo', {
        idFeria: Number(selectedFeriaId),
        nroStand: 1,
        idProducto: 1,
        stock: Number(t2Stock),
      });
      setTrigger2Result(res.data);
      toast.success('Operación aceptada');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error desconocido';
      setTrigger2Error(msg);
      toast.error(`Trigger Activado: ${msg}`);
    } finally {
      setTrigger2Loading(false);
    }
  };

  // Handler: Test Trigger 3 (Fechas feria inválidas)
  const handleTestTrigger3 = async () => {
    setTrigger3Loading(true);
    setTrigger3Result(null);
    setTrigger3Error(null);
    try {
      const res = await apiClient.post('/reportes/triggers/test-fechas-feria', {
        nombre: 'Feria Validación Trigger ' + Date.now(),
        fechaIni: t3FechaIni,
        fechaFin: t3FechaFin,
        descripcion: 'Prueba de validación automática por trigger',
      });
      setTrigger3Result(res.data);
      toast.success('Feria creada con fechas válidas');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error desconocido';
      setTrigger3Error(msg);
      toast.error(`Trigger Activado: ${msg}`);
    } finally {
      setTrigger3Loading(false);
    }
  };

  // Filter Recintos
  const filteredRecintos = recintos.filter((r) => {
    if (recintoCiudadFilter !== 'ALL' && r.ciudad !== recintoCiudadFilter) return false;
    if (recintoSearch.trim()) {
      const q = recintoSearch.toLowerCase();
      const matchRecinto = r.recinto?.toLowerCase().includes(q);
      const matchFeria = r.feria?.toLowerCase().includes(q);
      const matchZona = r.zona?.toLowerCase().includes(q);
      const matchCiudad = r.ciudad?.toLowerCase().includes(q);
      return matchRecinto || matchFeria || matchZona || matchCiudad;
    }
    return true;
  });

  const availableCiudades = Array.from(new Set(recintos.map((r) => r.ciudad).filter(Boolean)));

  // Filter Catalogo
  const filteredCatalogo = catalogo.filter((c) => {
    if (catalogoCategoriaFilter !== 'ALL' && c.categoria !== catalogoCategoriaFilter) return false;
    if (catalogoSearch.trim()) {
      const q = catalogoSearch.toLowerCase();
      const matchProd = c.producto?.toLowerCase().includes(q);
      const matchDesc = c.descripcion?.toLowerCase().includes(q);
      const matchStand = String(c.nroStand).includes(q);
      const matchExp = c.expositores?.toLowerCase().includes(q);
      return matchProd || matchDesc || matchStand || matchExp;
    }
    return true;
  });

  const availableCatalogoCategorias = Array.from(new Set(catalogo.map((c) => c.categoria).filter(Boolean)));

  // Group Catalogo by Stand
  const standsGrouped = filteredCatalogo.reduce((acc: Record<number, any>, item) => {
    const standNum = item.nroStand;
    if (!acc[standNum]) {
      acc[standNum] = {
        nroStand: standNum,
        ubicacionInterna: item.ubicacionInterna,
        estadoStand: item.estadoStand,
        expositores: item.expositores,
        productos: [],
        totalValorStand: 0,
      };
    }
    acc[standNum].productos.push(item);
    acc[standNum].totalValorStand += Number(item.valorStock || 0);
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '2.5rem 1.5rem', width: '100%' }}>
      {/* Header Banner */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Database size={13} /> MySQL 8.0 Engine
          </span>
          <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Zap size={13} /> Integración Completa
          </span>
        </div>
        <h1 style={{ fontSize: '2.4rem', color: '#fff', marginBottom: '0.4rem', fontWeight: 700 }}>
          Centro de Procedimientos, Funciones, Cursores y Triggers
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '900px' }}>
          Visualización y control interactivo de los objetos de base de datos implementados en MySQL: cursores de reporte,
          funciones de ocupación y cálculo, procedimientos de métricas y validación reactiva de triggers.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '0.75rem',
          marginBottom: '2rem',
          overflowX: 'auto',
        }}
      >
        <button
          onClick={() => handleTabChange('recintos')}
          className={`btn ${activeTab === 'recintos' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
        >
          <MapPin size={16} /> 1. Recintos y Ferias (Cursor 1)
        </button>

        <button
          onClick={() => handleTabChange('categorias')}
          className={`btn ${activeTab === 'categorias' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
        >
          <BarChart3 size={16} /> 2. Categorías (Cursor 2)
        </button>

        <button
          onClick={() => handleTabChange('catalogo')}
          className={`btn ${activeTab === 'catalogo' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
        >
          <Store size={16} /> 3. Catálogo por Feria (Cursor 3)
        </button>

        <button
          onClick={() => handleTabChange('metricas')}
          className={`btn ${activeTab === 'metricas' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
        >
          <TrendingUp size={16} /> 4. Métricas & Funciones SQL
        </button>

        <button
          onClick={() => handleTabChange('triggers')}
          className={`btn ${activeTab === 'triggers' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap', borderColor: '#f59e0b', color: activeTab === 'triggers' ? '#fff' : '#f59e0b' }}
        >
          <ShieldAlert size={16} /> 5. Laboratorio de Triggers
        </button>

        <button
          onClick={() => handleTabChange('diagnostico')}
          className={`btn ${activeTab === 'diagnostico' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
        >
          <Database size={16} /> Estado BD MySQL
        </button>
      </div>

      {/* Global Feria Selector for Tabs that require feria selection */}
      {(activeTab === 'catalogo' || activeTab === 'metricas' || activeTab === 'triggers') && (
        <div
          className="glass-card"
          style={{
            padding: '1.25rem 1.75rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            borderLeft: '4px solid var(--primary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818cf8',
              }}
            >
              <Calendar size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                Feria Seleccionada para Análisis
              </div>
              <div style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 600 }}>
                {feriasList.find((f) => f.idFeria === selectedFeriaId)?.nombre || `Feria #${selectedFeriaId}`}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 500 }}>Cambiar Feria:</label>
            <select
              value={selectedFeriaId}
              onChange={(e) => {
                const id = Number(e.target.value);
                setSelectedFeriaId(id);
                setSearchParams({ tab: activeTab, feria: String(id) });
              }}
              style={{
                background: 'var(--bg-input)',
                color: '#fff',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                fontSize: '0.92rem',
                cursor: 'pointer',
                minWidth: '280px',
              }}
            >
              {feriasList.map((f) => (
                <option key={f.idFeria} value={f.idFeria}>
                  #{f.idFeria} - {f.nombre} ({f.estado})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 1: RECINTOS Y FERIAS (CURSOR 1)
          ========================================================================= */}
      {activeTab === 'recintos' && (
        <div>
          {/* Header & Source Badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <MapPin style={{ color: '#818cf8' }} size={24} /> Reporte de Recintos Feriales y Ferias Asociadas
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                Generado mediante el cursor <code>sp_reporte_recintos_feriales()</code>. Recorre recintos, vincula ferias,
                consolida métricas de stands/expositores y concatena instituciones organizadoras y patrocinadoras.
              </p>
            </div>
            <div>
              <span className={`badge ${recintosSource === 'DATABASE_PROCEDURE' ? 'badge-success' : 'badge-warning'}`}>
                {recintosSource === 'DATABASE_PROCEDURE' ? 'Ejecutado con Cursor SQL (sp_reporte_recintos_feriales)' : 'Modo Fallback Activo'}
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Recintos Registrados</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff' }}>
                {Array.from(new Set(recintos.map((r) => r.idUbicacion))).length}
              </div>
            </div>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Ferias Vinculadas</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#818cf8' }}>
                {recintos.filter((r) => r.idFeria).length}
              </div>
            </div>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Capacidad Promedio Recintos</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>
                {recintos.length > 0
                  ? Math.round(
                      recintos.reduce((acc, r) => acc + (r.capacidad || 0), 0) /
                        (Array.from(new Set(recintos.map((r) => r.idUbicacion))).length || 1),
                    ).toLocaleString()
                  : 0}{' '}
                <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 400 }}>pers.</span>
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.75rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Buscar por recinto, ciudad, zona o nombre de feria..."
                value={recintoSearch}
                onChange={(e) => setRecintoSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem 0.65rem 2.8rem',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
            </div>
            <div>
              <select
                value={recintoCiudadFilter}
                onChange={(e) => setRecintoCiudadFilter(e.target.value)}
                style={{
                  padding: '0.65rem 1rem',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              >
                <option value="ALL">Todas las ciudades</option>
                {availableCiudades.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Recintos Cards Grid */}
          {loadingRecintos ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
              <RefreshCw className="spin" size={32} style={{ margin: '0 auto 1rem' }} />
              Cargando reporte de recintos mediante cursor SQL...
            </div>
          ) : filteredRecintos.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
              No se encontraron recintos ni ferias coincidentes.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '1.5rem' }}>
              {filteredRecintos.map((r, idx) => (
                <div key={idx} className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    {/* Header Recinto */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600, textTransform: 'uppercase' }}>
                          ID Recinto #{r.idUbicacion} • {r.ciudad}
                        </span>
                        <h3 style={{ fontSize: '1.35rem', color: '#fff', marginTop: '0.2rem' }}>{r.recinto}</h3>
                      </div>
                      <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                        Capacidad: {r.capacidad?.toLocaleString()}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.88rem', color: '#94a3b8', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                      <div>
                        <strong style={{ color: '#cbd5e1' }}>Zona:</strong> {r.zona || 'Centro'}
                      </div>
                      {r.referencia && (
                        <div>
                          <strong style={{ color: '#cbd5e1' }}>Ref:</strong> {r.referencia}
                        </div>
                      )}
                    </div>

                    {/* Feria Vinculada */}
                    {r.idFeria ? (
                      <div
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid var(--border)',
                          borderRadius: '10px',
                          padding: '1.25rem',
                          marginBottom: '1rem',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600, textTransform: 'uppercase' }}>
                            Feria Asociada #{r.idFeria}
                          </span>
                          <span className={`badge ${r.estado === 'Activa' ? 'badge-success' : r.estado === 'Planificada' ? 'badge-primary' : 'badge-warning'}`}>
                            {r.estado}
                          </span>
                        </div>

                        <div style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 600, marginBottom: '0.5rem' }}>
                          {r.feria}
                        </div>

                        <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '0.85rem' }}>
                          <Calendar size={13} style={{ display: 'inline', marginRight: '4px' }} />
                          {r.fechaIni || 'N/A'} al {r.fechaFin || 'N/A'} • Tipo: {r.tipo || 'General'}
                        </div>

                        {/* Indicators from Cursor */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem', textAlign: 'center' }}>
                          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '6px' }}>
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>TOTAL STANDS</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>{r.totalStands}</div>
                          </div>
                          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '6px' }}>
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>OCUPADOS</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981' }}>{r.standsOcupados}</div>
                          </div>
                          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '6px' }}>
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>EXPOSITORES</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b' }}>{r.totalExpositores}</div>
                          </div>
                        </div>

                        {/* Organizadores (GROUP_CONCAT) */}
                        {r.organizadores && (
                          <div style={{ fontSize: '0.82rem', marginBottom: '0.4rem', color: '#cbd5e1' }}>
                            <Building size={13} style={{ display: 'inline', marginRight: '4px', color: '#0ea5e9' }} />
                            <strong style={{ color: '#0ea5e9' }}>Organizan:</strong> {r.organizadores}
                          </div>
                        )}

                        {/* Patrocinadores (GROUP_CONCAT) */}
                        {r.patrocinadores && (
                          <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                            <Award size={13} style={{ display: 'inline', marginRight: '4px', color: '#f59e0b' }} />
                            <strong style={{ color: '#f59e0b' }}>Patrocinan:</strong> {r.patrocinadores}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px dashed var(--border)',
                          borderRadius: '8px',
                          padding: '1.25rem',
                          textAlign: 'center',
                          color: '#64748b',
                          fontSize: '0.9rem',
                        }}
                      >
                        Recinto sin ferias actualmente vinculadas en el calendario.
                      </div>
                    )}
                  </div>

                  {r.idFeria && (
                    <button
                      onClick={() => {
                        setSelectedFeriaId(r.idFeria);
                        handleTabChange('metricas');
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ marginTop: '0.75rem', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem' }}
                    >
                      Analizar Métricas de esta Feria <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: ANÁLISIS DE CATEGORÍAS (CURSOR 2)
          ========================================================================= */}
      {activeTab === 'categorias' && (
        <div>
          {/* Header & Source Badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <BarChart3 style={{ color: '#c084fc' }} size={24} /> Análisis Estadístico de Categorías de Productos
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                Generado mediante el cursor <code>sp_reporte_categorias_productos()</code>. Agrupa productos, calcula precios promedio,
                mínimos, máximos, stock acumulado en stands y estimación del inventario total.
              </p>
            </div>
            <div>
              <span className={`badge ${categoriasSource === 'DATABASE_PROCEDURE' ? 'badge-success' : 'badge-warning'}`}>
                {categoriasSource === 'DATABASE_PROCEDURE' ? 'Ejecutado con Cursor SQL (sp_reporte_categorias_productos)' : 'Modo Fallback Activo'}
              </span>
            </div>
          </div>

          {loadingCategorias ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
              <RefreshCw className="spin" size={32} style={{ margin: '0 auto 1rem' }} />
              Cargando estadísticas de categorías mediante cursor SQL...
            </div>
          ) : (
            <>
              {/* Key KPI Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Total Categorías</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff' }}>{categorias.length}</div>
            </div>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Productos Catalogados</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#c084fc' }}>
                {categorias.reduce((acc, c) => acc + (c.totalProductos || 0), 0)}
              </div>
            </div>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Stock Total Disponible</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>
                {categorias.reduce((acc, c) => acc + (c.totalStock || 0), 0).toLocaleString()} <span style={{ fontSize: '0.85rem' }}>u.</span>
              </div>
            </div>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Valor Estimado Inventario</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f59e0b' }}>
                Bs {categorias.reduce((acc, c) => acc + (c.valorInventario || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Visual Comparison Bars */}
          <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '1.25rem' }}>
              Distribución de Productos por Categoría (Gráfico Visual)
            </h3>
            {categorias.length === 0 ? (
              <div style={{ color: '#94a3b8' }}>Cargando categorías...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {(() => {
                  const maxProd = Math.max(...categorias.map((c) => c.totalProductos || 1));
                  return categorias.map((cat, idx) => {
                    const pct = Math.round(((cat.totalProductos || 0) / maxProd) * 100);
                    return (
                      <div key={idx}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.25rem' }}>
                          <span style={{ color: '#fff', fontWeight: 500 }}>{cat.categoria}</span>
                          <span style={{ color: '#94a3b8' }}>
                            <strong style={{ color: '#c084fc' }}>{cat.totalProductos} productos</strong> • Stock: {cat.totalStock?.toLocaleString()} • Bs {cat.valorInventario?.toLocaleString()}
                          </span>
                        </div>
                        <div style={{ width: '100%', height: '12px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${pct}%`,
                              height: '100%',
                              background: 'linear-gradient(90deg, #6366f1, #c084fc)',
                              borderRadius: '6px',
                              transition: 'width 0.4s ease',
                            }}
                          />
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>

          {/* Table View */}
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>Tabla Estadística Consolidada por Categoría</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)', color: '#94a3b8' }}>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Categoría</th>
                    <th style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>Total Productos</th>
                    <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Precio Promedio</th>
                    <th style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>Rango [Mín - Máx]</th>
                    <th style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>Stock Total</th>
                    <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Valor Estimado</th>
                    <th style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>Ofertas</th>
                    <th style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {categorias.map((cat, idx) => (
                    <React.Fragment key={idx}>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '1rem 1.25rem', color: '#fff', fontWeight: 600 }}>{cat.categoria}</td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                          <span className="badge badge-primary">{cat.totalProductos}</span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'right', color: '#f59e0b', fontWeight: 600 }}>
                          Bs {Number(cat.precioPromedio).toFixed(2)}
                        </td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                          Bs {cat.precioMinimo} - Bs {cat.precioMaximo}
                        </td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'center', color: '#10b981', fontWeight: 600 }}>
                          {cat.totalStock?.toLocaleString()}
                        </td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'right', color: '#fff', fontWeight: 600 }}>
                          Bs {Number(cat.valorInventario).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                          <span className="badge badge-secondary">{cat.totalOfertas} en stands</span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                          <button
                            onClick={() => setExpandedCategoria(expandedCategoria === cat.categoria ? null : cat.categoria)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.3rem 0.6rem' }}
                          >
                            {expandedCategoria === cat.categoria ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </td>
                      </tr>
                      {expandedCategoria === cat.categoria && (
                        <tr>
                          <td colSpan={8} style={{ padding: '1.25rem', background: 'rgba(99, 102, 241, 0.05)', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600 }}>
                              PRODUCTOS CONCATENADOS EN ESTA CATEGORÍA (Cursor SQL GROUP_CONCAT):
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.6 }}>
                              {cat.productos || 'Sin productos registrados.'}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
            </>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: CATÁLOGO POR FERIA (CURSOR 3)
          ========================================================================= */}
      {activeTab === 'catalogo' && (
        <div>
          {/* Header & Source Badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Store style={{ color: '#0ea5e9' }} size={24} /> Catálogo de Productos Ofrecidos por Feria
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                Generado mediante el cursor parametrizado <code>sp_catalogo_productos_feria(IN p_idFeria)</code>.
                Relaciona <code>OFRECE</code>, <code>PRODUCTO</code>, <code>STAND</code> y los expositores asignados de <code>CONFORMAN</code>.
              </p>
            </div>
            <div>
              <span className={`badge ${catalogoSource === 'DATABASE_PROCEDURE' ? 'badge-success' : 'badge-warning'}`}>
                {catalogoSource === 'DATABASE_PROCEDURE' ? 'Ejecutado con Cursor SQL (sp_catalogo_productos_feria)' : 'Modo Fallback Activo'}
              </span>
            </div>
          </div>

          {/* Overview Metrics for Selected Feria */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Productos Ofrecidos</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff' }}>{catalogo.length}</div>
            </div>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Unidades de Stock Total</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>
                {catalogo.reduce((acc, c) => acc + (c.stock || 0), 0).toLocaleString()}
              </div>
            </div>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Valor Total del Catálogo</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f59e0b' }}>
                Bs {catalogo.reduce((acc, c) => acc + (c.valorStock || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Stands con Ofertas</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0ea5e9' }}>
                {Array.from(new Set(catalogo.map((c) => c.nroStand))).length}
              </div>
            </div>
          </div>

          {/* Filter Bar & View Toggle */}
          <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.75rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '300px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Buscar producto, stand o expositor..."
                  value={catalogoSearch}
                  onChange={(e) => setCatalogoSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem 0.65rem 2.8rem',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
              </div>
              <select
                value={catalogoCategoriaFilter}
                onChange={(e) => setCatalogoCategoriaFilter(e.target.value)}
                style={{
                  padding: '0.65rem 1rem',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              >
                <option value="ALL">Todas las Categorías</option>
                {availableCatalogoCategorias.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setCatalogoViewMode('stands')}
                className={`btn ${catalogoViewMode === 'stands' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              >
                <Layers size={14} /> Agrupado por Stand
              </button>
              <button
                onClick={() => setCatalogoViewMode('grid')}
                className={`btn ${catalogoViewMode === 'grid' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              >
                <Package size={14} /> Vista Productos
              </button>
            </div>
          </div>

          {/* Catalogo Results */}
          {loadingCatalogo ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
              <RefreshCw className="spin" size={32} style={{ margin: '0 auto 1rem' }} />
              Cargando catálogo mediante cursor SQL para Feria #{selectedFeriaId}...
            </div>
          ) : filteredCatalogo.length === 0 ? (
            <div className="glass-card" style={{ padding: '3.5rem', textAlign: 'center', color: '#94a3b8' }}>
              No hay productos registrados en los stands de esta feria.
            </div>
          ) : catalogoViewMode === 'stands' ? (
            /* Stand-Grouped View */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {Object.values(standsGrouped).map((s: any) => (
                <div key={s.nroStand} className="glass-card" style={{ padding: '1.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(14, 165, 233, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9' }}>
                        <Store size={22} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>Stand #{s.nroStand}</h3>
                        <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                          Ubicación interna: {s.ubicacionInterna || 'Principal'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <span className={`badge ${s.estadoStand === 'Ocupado' ? 'badge-warning' : 'badge-success'}`}>
                        {s.estadoStand || 'Ocupado'}
                      </span>
                      <span className="badge badge-primary" style={{ fontSize: '0.8rem' }}>
                        Valor Stand: Bs {s.totalValorStand.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.88rem', color: '#cbd5e1', marginBottom: '1rem' }}>
                    <Users size={14} style={{ display: 'inline', marginRight: '6px', color: '#f59e0b' }} />
                    <strong style={{ color: '#f59e0b' }}>Expositor(es) a cargo:</strong> {s.expositores || 'Sin expositor acreditado'}
                  </div>

                  {/* Stand Products Table */}
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                      <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)', color: '#94a3b8' }}>
                          <th style={{ padding: '0.65rem 1rem' }}>Producto</th>
                          <th style={{ padding: '0.65rem 1rem' }}>Categoría</th>
                          <th style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>Precio Unit.</th>
                          <th style={{ padding: '0.65rem 1rem', textAlign: 'center' }}>Stock</th>
                          <th style={{ padding: '0.65rem 1rem', textAlign: 'center' }}>Unidad</th>
                          <th style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>Valor Stock</th>
                        </tr>
                      </thead>
                      <tbody>
                        {s.productos.map((prod: any, pIdx: number) => (
                          <tr key={pIdx} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '0.75rem 1rem', color: '#fff', fontWeight: 600 }}>{prod.producto}</td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>{prod.categoria}</span>
                            </td>
                            <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#f59e0b', fontWeight: 600 }}>
                              Bs {Number(prod.precio).toFixed(2)}
                            </td>
                            <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#10b981', fontWeight: 600 }}>
                              {prod.stock}
                            </td>
                            <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
                              {prod.unidadMedida}
                            </td>
                            <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#fff', fontWeight: 600 }}>
                              Bs {Number(prod.valorStock).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Flat Grid View */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {filteredCatalogo.map((prod, idx) => (
                <div key={idx} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>{prod.categoria}</span>
                      <span className="badge badge-secondary" style={{ fontSize: '0.72rem' }}>Stand #{prod.nroStand}</span>
                    </div>
                    <h4 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.4rem' }}>{prod.producto}</h4>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem', lineHeight: 1.4 }}>
                      {prod.descripcion || 'Sin descripción detallada.'}
                    </p>
                  </div>
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Precio Unitario:</span>
                      <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '1.1rem' }}>Bs {Number(prod.precio).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Stock Ofertado:</span>
                      <span style={{ color: '#10b981', fontWeight: 600 }}>{prod.stock} {prod.unidadMedida}</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.5rem' }}>
                      Expositor: {prod.expositores || 'Sin asignar'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 4: MÉTRICAS Y FUNCIONES SQL (sp_metricas_clave_feria, etc.)
          ========================================================================= */}
      {activeTab === 'metricas' && (
        <div>
          {/* Header & Source Badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <TrendingUp style={{ color: '#10b981' }} size={24} /> Métricas Clave y Funciones de la Feria
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                Consolida en una sola llamada los indicadores calculados en MySQL: <code>fn_total_stands()</code>,{' '}
                <code>fn_stands_ocupados()</code>, <code>fn_total_expositores()</code>, <code>fn_monto_total_patrocinio()</code> y{' '}
                <code>fn_porcentaje_ocupacion_feria()</code>.
              </p>
            </div>
            <div>
              <span className={`badge ${metricas?.source === 'DATABASE_PROCEDURE' ? 'badge-success' : 'badge-warning'}`}>
                {metricas?.source === 'DATABASE_PROCEDURE' ? 'Ejecutado con SP (sp_metricas_clave_feria)' : 'Modo Fallback Activo'}
              </span>
            </div>
          </div>

          {loadingMetricas ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
              <RefreshCw className="spin" size={32} style={{ margin: '0 auto 1rem' }} />
              Consultando métricas en la base de datos...
            </div>
          ) : !metricas ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
              Seleccione una feria para ver sus métricas.
            </div>
          ) : (
            <div>
              {/* Main Metric Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div className="glass-card" style={{ padding: '1.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>TOTAL STANDS</span>
                    <Store size={18} style={{ color: '#818cf8' }} />
                  </div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 700, color: '#fff' }}>{metricas.totalStands}</div>
                  <div style={{ fontSize: '0.78rem', color: '#818cf8', marginTop: '0.25rem' }}>
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '1.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>STANDS OCUPADOS</span>
                    <CheckCircle2 size={18} style={{ color: '#10b981' }} />
                  </div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 700, color: '#10b981' }}>{metricas.standsOcupados}</div>
                  <div style={{ fontSize: '0.78rem', color: '#10b981', marginTop: '0.25rem' }}>
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '1.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>TOTAL EXPOSITORES</span>
                    <Users size={18} style={{ color: '#f59e0b' }} />
                  </div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 700, color: '#f59e0b' }}>{metricas.totalExpositores}</div>
                  <div style={{ fontSize: '0.78rem', color: '#f59e0b', marginTop: '0.25rem' }}>
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '1.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>PATROCINIO TOTAL</span>
                    <DollarSign size={18} style={{ color: '#c084fc' }} />
                  </div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 700, color: '#c084fc' }}>
                    Bs {Number(metricas.montoTotalPatrocinio).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#c084fc', marginTop: '0.25rem' }}>
                  </div>
                </div>
              </div>

              {/* Gauge and State Section */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.75rem' }}>
                {/* Occupation Gauge Card */}
                <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>Porcentaje de Ocupación de Stands</h3>
                      <span className="badge badge-primary">{metricas.porcentajeOcupacion}%</span>
                    </div>


                    {/* Big Visual Progress Bar */}
                    <div style={{ width: '100%', height: '28px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '14px', overflow: 'hidden', padding: '4px', marginBottom: '1rem' }}>
                      <div
                        style={{
                          width: `${Math.min(100, Math.max(0, metricas.porcentajeOcupacion))}%`,
                          height: '100%',
                          background:
                            metricas.porcentajeOcupacion >= 80
                              ? 'linear-gradient(90deg, #10b981, #059669)'
                              : metricas.porcentajeOcupacion >= 40
                              ? 'linear-gradient(90deg, #6366f1, #3b82f6)'
                              : 'linear-gradient(90deg, #f59e0b, #d97706)',
                          borderRadius: '10px',
                          transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94a3b8' }}>
                      <span>0% (Disponible)</span>
                      <span>50%</span>
                      <span>100% (Capacidad Plena)</span>
                    </div>
                  </div>

                  <div style={{ marginTop: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.85rem 1rem', borderRadius: '8px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                    Ocupación real: <strong>{metricas.standsOcupados}</strong> de <strong>{metricas.totalStands}</strong> stands disponibles.
                  </div>
                </div>

                {/* State Update Card (sp_actualizar_estado_feria_fecha) */}
                <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>Actualización de Estado de Feria</h3>
                      <span className="badge badge-success">{metricas.estadoDeterminado}</span>
                    </div>


                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '1rem', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                      <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                        Reglas aplicadas:
                      </div>
                      <ul style={{ paddingLeft: '1.25rem', fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                        <li>Si está "Cancelada", se preserva su cancelación.</li>
                        <li>fecha actual &lt; fecha_ini &rarr; <strong>Planificada</strong></li>
                        <li>fecha actual &le; fecha_fin &rarr; <strong>Activa</strong></li>
                        <li>fecha actual &gt; fecha_fin &rarr; <strong>Finalizada</strong></li>
                      </ul>
                    </div>
                  </div>

                  <button
                    onClick={handleActualizarEstado}
                    disabled={updatingEstado}
                    className="btn btn-primary"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.85rem' }}
                  >
                    {updatingEstado ? <RefreshCw className="spin" size={16} /> : <Zap size={16} />}
                    {updatingEstado ? 'Ejecutando procedimiento...' : 'Ponerlo a prueba'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 5: LABORATORIO DE TRIGGERS
          ========================================================================= */}
      {activeTab === 'triggers' && (
        <div>
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.6rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <ShieldAlert style={{ color: '#f59e0b' }} size={26} /> Laboratorio de Verificación de Triggers
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
              Los triggers se ejecutan directamente dentro del motor MySQL 8.0 al ocurrir eventos INSERT o UPDATE.
              Utiliza esta consola para probar y comprobar cómo la base de datos reacciona y protege las reglas de negocio.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
            {/* TRIGGER 1: trg_ocupar_stand */}
            <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span className="badge badge-warning">Trigger 1</span>
                  <span style={{ fontSize: '0.78rem', color: '#818cf8', fontWeight: 600 }}>AFTER INSERT ON CONFORMAN</span>
                </div>

                <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.5rem' }}>
                  Cambio automático a "Ocupado"
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                  Al registrar un expositor en un stand mediante <code>CONFORMAN</code>, el trigger actualiza inmediatamente
                  el estado del stand correspondiente a <code>'Ocupado'</code> sin necesidad de intervención manual del frontend.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>
                      Número de Stand a Ocupar:
                    </label>
                    <input
                      type="number"
                      value={t1Stand}
                      onChange={(e) => setT1Stand(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.85rem',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>
                      CI del Expositor:
                    </label>
                    <input
                      type="text"
                      value={t1Ci}
                      onChange={(e) => setT1Ci(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.85rem',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>
                      Cargo del Expositor:
                    </label>
                    <input
                      type="text"
                      value={t1Cargo}
                      onChange={(e) => setT1Cargo(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.85rem',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                  </div>
                </div>

                {trigger1Result && (
                  <div
                    style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '8px',
                      padding: '1rem',
                      marginBottom: '1.5rem',
                    }}
                  >
                    <div style={{ color: '#10b981', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                      ✓ {trigger1Result.mensaje}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                      Estado previo del stand: <strong>{trigger1Result.estadoStandAnterior || 'Disponible'}</strong>
                      <br />
                      Estado verificado tras trigger: <strong style={{ color: '#10b981' }}>{trigger1Result.estadoStandResultado}</strong>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleTestTrigger1}
                disabled={trigger1Loading}
                className="btn btn-primary"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                {trigger1Loading ? <RefreshCw className="spin" size={16} /> : <CheckCircle2 size={16} />}
                {trigger1Loading ? 'Insertando en CONFORMAN...' : 'Asignar expositor a un stand'}
              </button>
            </div>

            {/* TRIGGER 2 & 3: trg_validar_stock_insert / update */}
            <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span className="badge badge-warning">Triggers 2 & 3</span>
                  <span style={{ fontSize: '0.78rem', color: '#818cf8', fontWeight: 600 }}>BEFORE INSERT/UPDATE ON OFRECE</span>
                </div>

                <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.5rem' }}>
                  Validación de Stock Negativo
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                  Impide que se registre o actualice una oferta con stock menor a cero. Si se intenta ingresar un valor negativo,
                  MySQL dispara <code>SIGNAL SQLSTATE '45000'</code> con el mensaje exacto: <em>"Error: el stock no puede ser menor a cero"</em>.
                </p>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>
                    Cantidad de Stock a Probar (ingresa un valor negativo para forzar el trigger):
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="number"
                      value={t2Stock}
                      onChange={(e) => setT2Stock(Number(e.target.value))}
                      style={{
                        flex: 1,
                        padding: '0.6rem 0.85rem',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setT2Stock(-10)}
                      className="btn btn-secondary btn-sm"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      Poner -10
                    </button>
                    <button
                      type="button"
                      onClick={() => setT2Stock(15)}
                      className="btn btn-secondary btn-sm"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      Poner +15
                    </button>
                  </div>
                </div>

                {trigger2Error && (
                  <div
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '8px',
                      padding: '1rem',
                      marginBottom: '1.5rem',
                    }}
                  >
                    <div style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                      🛡️ Trigger Bloqueó la Operación con Éxito:
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                      Mensaje de MySQL: <em>"{trigger2Error}"</em>
                    </div>
                  </div>
                )}

                {trigger2Result && (
                  <div
                    style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '8px',
                      padding: '1rem',
                      marginBottom: '1.5rem',
                    }}
                  >
                    <div style={{ color: '#10b981', fontWeight: 600, fontSize: '0.9rem' }}>
                      ✓ {trigger2Result.mensaje}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleTestTrigger2}
                disabled={trigger2Loading}
                className="btn btn-primary"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                {trigger2Loading ? <RefreshCw className="spin" size={16} /> : <Zap size={16} />}
                {trigger2Loading ? 'Enviando a MySQL...' : 'Intentar Guardar Oferta'}
              </button>
            </div>

            {/* TRIGGER 4 & 5: trg_validar_fechas_feria_insert / update */}
            <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span className="badge badge-warning">Triggers 4 & 5</span>
                  <span style={{ fontSize: '0.78rem', color: '#818cf8', fontWeight: 600 }}>BEFORE INSERT/UPDATE ON FERIA</span>
                </div>

                <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.5rem' }}>
                  Validación de Fechas de Feria
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                  Impide crear o modificar una feria cuya fecha de finalización sea anterior a la fecha de inicio.
                  MySQL cancela la transacción con el error exacto:{' '}
                  <em>"Error: la fecha de finalizacion no puede ser anterior a la fecha de inicio"</em>.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>
                      Fecha de Inicio (FECHA_INI):
                    </label>
                    <input
                      type="date"
                      value={t3FechaIni}
                      onChange={(e) => setT3FechaIni(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.85rem',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>
                      Fecha de Fin (FECHA_FIN - ponla menor para disparar el trigger):
                    </label>
                    <input
                      type="date"
                      value={t3FechaFin}
                      onChange={(e) => setT3FechaFin(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.85rem',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                  </div>
                </div>

                {trigger3Error && (
                  <div
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '8px',
                      padding: '1rem',
                      marginBottom: '1.5rem',
                    }}
                  >
                    <div style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                      🛡️ Trigger Bloqueó la Operación con Éxito:
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                      Mensaje de MySQL: <em>"{trigger3Error}"</em>
                    </div>
                  </div>
                )}

                {trigger3Result && (
                  <div
                    style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '8px',
                      padding: '1rem',
                      marginBottom: '1.5rem',
                    }}
                  >
                    <div style={{ color: '#10b981', fontWeight: 600, fontSize: '0.9rem' }}>
                      ✓ {trigger3Result.mensaje}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleTestTrigger3}
                disabled={trigger3Loading}
                className="btn btn-primary"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                {trigger3Loading ? <RefreshCw className="spin" size={16} /> : <Zap size={16} />}
                {trigger3Loading ? 'Guardando en FERIA...' : 'Intentar Crear Feria'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: DIAGNÓSTICO DE LA BASE DE DATOS MYSQL
          ========================================================================= */}
      {activeTab === 'diagnostico' && (
        <div>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.6rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Database style={{ color: '#818cf8' }} size={24} /> Estado en Tiempo Real de Objetos MySQL
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
              Inspección directa de <code>information_schema.ROUTINES</code> e <code>information_schema.TRIGGERS</code>.
              Si algún objeto aún no ha sido ejecutado en DBeaver o MySQL, el sistema funciona de manera 100% transparente
              mediante el motor de fallback integrado.
            </p>
          </div>

          {loadingDiagnostico ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
              <RefreshCw className="spin" size={32} style={{ margin: '0 auto 1rem' }} />
              Verificando objetos en la base de datos...
            </div>
          ) : !diagnostico ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
              No se pudo obtener el diagnóstico de la base de datos.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.75rem' }}>
              {/* Procedimientos */}
              <div className="glass-card" style={{ padding: '1.75rem' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={18} style={{ color: '#818cf8' }} /> Procedimientos Almacenados (6)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {diagnostico.procedimientos.map((p: any) => (
                    <div
                      key={p.nombre}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem 1rem',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                    >
                      <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: '0.9rem' }}>{p.nombre}()</span>
                      <span className={`badge ${p.existe ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.75rem' }}>
                        {p.existe ? '✓ En MySQL' : 'Fallback Activo'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Funciones */}
              <div className="glass-card" style={{ padding: '1.75rem' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sliders size={18} style={{ color: '#c084fc' }} /> Funciones Almacenadas (6)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {diagnostico.funciones.map((fn: any) => (
                    <div
                      key={fn.nombre}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem 1rem',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                    >
                      <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: '0.9rem' }}>{fn.nombre}()</span>
                      <span className={`badge ${fn.existe ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.75rem' }}>
                        {fn.existe ? '✓ En MySQL' : 'Fallback Activo'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Triggers */}
              <div className="glass-card" style={{ padding: '1.75rem' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldAlert size={18} style={{ color: '#f59e0b' }} /> Triggers del Sistema (5)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {diagnostico.triggers.map((t: any) => (
                    <div
                      key={t.nombre}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem 1rem',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                    >
                      <div>
                        <div style={{ color: '#fff', fontFamily: 'monospace', fontSize: '0.9rem' }}>{t.nombre}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {t.evento} ON {t.tabla}
                        </div>
                      </div>
                      <span className={`badge ${t.existe ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.75rem' }}>
                        {t.existe ? '✓ En MySQL' : 'Fallback Activo'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* DBeaver / SQL Information notice */}
          <div
            className="glass-card"
            style={{
              padding: '1.75rem',
              marginTop: '2rem',
              borderLeft: '4px solid #10b981',
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start',
            }}
          >
            <Info size={24} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.35rem' }}>
                Información para Carga Directa en MySQL / DBeaver
              </h4>
              <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.5 }}>
                Los archivos fuente se encuentran en el directorio <code>database/</code> del proyecto:{' '}
                <code>funciones_procedimientos.sql</code>, <code>triggers.sql</code> y <code>cursores.sql</code>. Al ejecutarlos
                en MySQL o DBeaver, el sistema detecta automáticamente su presencia y pasa a utilizar los procedimientos y triggers nativos de inmediato.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Spinner animation keyframes */}
      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ReportesPage;

import React, { useEffect, useState } from 'react';
import apiClient from '../../api/client';

import {
  Calendar,
  Sparkles,
  Users,
  Building,
  Package,
  Store,
  Clock,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
type MetricasFeriaResponse = {
  IDFERIA: number;
  FERIA: string;
  TOTAL_STANDS: number | string;
  STANDS_OCUPADOS: number | string;
  TOTAL_EXPOSITORES: number | string;
  MONTO_TOTAL_PATROCINIO: number | string;
  PORCENTAJE_OCUPACION: number | string;
};
export const EstadisticasPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  // Estado de la ventana emergente.
  const [modalMetricas, setModalMetricas] = useState(false);
  // ID de la feria seleccionada.
  const [idFeriaConsulta, setIdFeriaConsulta] = useState('');
  // Resultado de las funciones MySQL.
  const [metricasFeria, setMetricasFeria] =
    useState<MetricasFeriaResponse | null>(null);
  // Estado de consulta.
  const [consultandoFeria, setConsultandoFeria] =
    useState(false);

  // Mensajes de error.
  const [errorFeria, setErrorFeria] = useState('');
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiClient.get('/dashboard/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Error cargando estadísticas:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);
const consultarMetricasFeria = async (
  e: React.FormEvent<HTMLFormElement>,
) => {
  e.preventDefault();

  const id = Number(idFeriaConsulta);

  if (!Number.isInteger(id) || id <= 0) {
    setErrorFeria('Introduce un ID de feria válido.');
    return;
  }

  setConsultandoFeria(true);
  setErrorFeria('');
  setMetricasFeria(null);

  try {
    const respuesta = await apiClient.get(
      `/dashboard/ferias/${id}/metricas`,
    );

    setMetricasFeria(respuesta.data);

  } catch (error: unknown) {

    const err = error as {
      response?: {
        data?: {
          message?: string | string[];
        };
      };
    };

    const mensaje = err.response?.data?.message;

    setErrorFeria(
      Array.isArray(mensaje)
        ? mensaje.join(', ')
        : mensaje || 'No se pudieron obtener las métricas.',
    );

  } finally {
    setConsultandoFeria(false);
  }
};
  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.5rem', width: '100%' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '0.5rem' }}>
          Métricas y Estadísticas del Sistema
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.05rem' }}>
          Resumen consolidado de la actividad ferial, participación ciudadana y desarrollo económico en La Paz
        </p>

      </div>
      <div style={{ marginTop: '1.5rem' }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setModalMetricas(true);
            setMetricasFeria(null);
            setErrorFeria('');
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.85rem 1.25rem',
          }}
        >
          <TrendingUp size={18} />
          Consultar métricas por feria
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
          Cargando métricas...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>Total de Ferias</span>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
                <Calendar size={20} />
              </div>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
              {stats?.totalFerias || 0}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#10b981' }}>
              {stats?.feriasActivas || 0} ferias actualmente activas
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>Próximas Ferias</span>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                <Clock size={20} />
              </div>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
              {stats?.feriasProximas || 0}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Programadas en el calendario
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>Expositores Oficiales</span>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                <Users size={20} />
              </div>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
              {stats?.totalExpositores || 0}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Artesanos, productores y gestores
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>Total de Stands</span>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(14, 165, 233, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9' }}>
                <Store size={20} />
              </div>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
              {stats?.totalStands || 0}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Puestos de exhibición y venta
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>Productos Catalogados</span>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc' }}>
                <Package size={20} />
              </div>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
              {stats?.totalProductos || 0}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Obras de arte, alimentos y manufacturas
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>Instituciones & Aliados</span>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(236, 72, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f472b6' }}>
                <Building size={20} />
              </div>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
              {stats?.totalInstituciones || 0}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Organizadores y empresas patrocinadoras
            </div>
          </div>
        </div>
      )}
            {/* VENTANA EMERGENTE DE MÉTRICAS POR FERIA */}
      {modalMetricas && (
        <div
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setModalMetricas(false);
            }
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(2, 6, 23, 0.80)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            overflowY: 'auto',
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-metricas-feria"
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '650px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              background: '#111827',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '18px',
            }}
          >
            {/* Encabezado */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
            }}>
              <div>
                <h2
                  id="titulo-metricas-feria"
                  style={{ color: '#fff', marginBottom: '0.4rem' }}
                >
                  Métricas de una feria
                </h2>

                <p style={{ color: '#94a3b8', margin: 0 }}>
                  Consulta la ocupación y el patrocinio.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalMetricas(false)}
                aria-label="Cerrar ventana"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '1.8rem',
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>

            {/* Formulario de consulta */}
            <form onSubmit={consultarMetricasFeria}>
              <label
                htmlFor="idFeriaMetricas"
                style={{
                  display: 'block',
                  color: '#fff',
                  marginBottom: '0.6rem',
                }}
              >
                Introduce el ID de la feria
              </label>

              <div style={{
                display: 'flex',
                gap: '0.75rem',
                flexWrap: 'wrap',
              }}>
                <input
                  id="idFeriaMetricas"
                  type="number"
                  min="1"
                  step="1"
                  required
                  placeholder="Ejemplo: 1"
                  className="input-field"
                  value={idFeriaConsulta}
                  onChange={(e) =>
                    setIdFeriaConsulta(e.target.value)
                  }
                  style={{ flex: '1 1 150px' }}
                />

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={consultandoFeria}
                >
                  {consultandoFeria
                    ? 'Consultando...'
                    : 'Consultar'}
                </button>
              </div>
            </form>

            {/* Error */}
            {errorFeria && (
              <p
                role="alert"
                style={{
                  color: '#f87171',
                  marginTop: '1rem',
                }}
              >
                {errorFeria}
              </p>
            )}

            {/* Resultados */}
            {metricasFeria && (
              <div style={{ marginTop: '1.8rem' }}>

                <h3 style={{
                  color: '#fff',
                  marginBottom: '1rem',
                }}>
                  {metricasFeria.FERIA}
                </h3>

                <p style={{ color: '#94a3b8' }}>
                  ID de feria: {metricasFeria.IDFERIA}
                </p>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '1rem',
                }}>

                  <div className="glass-card" style={{ padding: '1rem' }}>
                    <span style={{ color: '#94a3b8' }}>
                      Total de stands
                    </span>
                    <h2 style={{ color: '#fff' }}>
                      {metricasFeria.TOTAL_STANDS}
                    </h2>
                  </div>

                  <div className="glass-card" style={{ padding: '1rem' }}>
                    <span style={{ color: '#94a3b8' }}>
                      Stands ocupados
                    </span>
                    <h2 style={{ color: '#10b981' }}>
                      {metricasFeria.STANDS_OCUPADOS}
                    </h2>
                  </div>

                  <div className="glass-card" style={{ padding: '1rem' }}>
                    <span style={{ color: '#94a3b8' }}>
                      Total de expositores
                    </span>
                    <h2 style={{ color: '#fff' }}>
                      {metricasFeria.TOTAL_EXPOSITORES}
                    </h2>
                  </div>

                  <div className="glass-card" style={{ padding: '1rem' }}>
                    <span style={{ color: '#94a3b8' }}>
                      Porcentaje de ocupación
                    </span>
                    <h2 style={{ color: '#38bdf8' }}>
                      {Number(
                        metricasFeria.PORCENTAJE_OCUPACION
                      ).toFixed(2)}%
                    </h2>
                  </div>

                </div>

                <div className="glass-card" style={{
                  padding: '1.25rem',
                  marginTop: '1rem',
                }}>
                  <span style={{ color: '#94a3b8' }}>
                    Total de patrocinio registrado
                  </span>

                  <h2 style={{
                    color: '#10b981',
                    fontSize: '2rem',
                  }}>
                    {Number(
                      metricasFeria.MONTO_TOTAL_PATROCINIO
                    ).toLocaleString('es-BO', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </h2>
                </div>

              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};
export default EstadisticasPage;

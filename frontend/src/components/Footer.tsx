import React from 'react';
import { Heart, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', background: 'rgba(11, 15, 25, 0.95)', padding: '2.5rem 1.5rem 2rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f8fafc', fontWeight: 600 }}>
            <Sparkles size={18} style={{ color: '#f59e0b' }} />
            <span>Sistema Integral de Ferias Dominicales</span>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.35rem' }}>
            Promoviendo la cultura, arte y producción local paceña.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
          <span>Grupo 8 - Lic Jose Luis Zeballos Abasto - Universidad Mayor de San Andrés (UMSA)</span>
        </div>

        <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
          © {new Date().getFullYear()} Base de Datos 2 — Grupo #8
        </div>
      </div>
    </footer>
  );
};

export default Footer;

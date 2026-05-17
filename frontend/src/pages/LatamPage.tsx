import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Map } from 'lucide-react';

const paises = [
  {
    nombre: 'Bolivia', codigo: 'BO', estado: 'activo', color: '#10B981',
    usuarios: '42K', volumen: '$2.1M', cashback: '$28K', lanzamiento: 'Q1 2024',
  },
  {
    nombre: 'Perú', codigo: 'PE', estado: 'próximo', color: '#FF8C00',
    usuarios: '—', volumen: '—', cashback: '—', lanzamiento: 'Q3 2025',
  },
  {
    nombre: 'Colombia', codigo: 'CO', estado: 'próximo', color: '#FF8C00',
    usuarios: '—', volumen: '—', cashback: '—', lanzamiento: 'Q4 2025',
  },
  {
    nombre: 'Argentina', codigo: 'AR', estado: 'planificado', color: '#5346F6',
    usuarios: '—', volumen: '—', cashback: '—', lanzamiento: 'Q2 2026',
  },
  {
    nombre: 'Chile', codigo: 'CL', estado: 'planificado', color: '#5346F6',
    usuarios: '—', volumen: '—', cashback: '—', lanzamiento: 'Q3 2026',
  },
];

const timeline = [
  { fecha: 'Q1 2024', hito: 'Bolivia live — 42K usuarios activos' },
  { fecha: 'Q2 2025', hito: 'BANEXCOIN — protocolo B2B2C abierto' },
  { fecha: 'Q3 2025', hito: 'Expansión Perú — partnership con Yape' },
  { fecha: 'Q4 2025', hito: 'Colombia — integración con Nequi' },
  { fecha: 'Q2 2026', hito: 'Argentina — mercado cripto-nativo' },
  { fecha: 'Q3 2026', hito: 'Chile — 5 países, 1M+ usuarios' },
];

export default function LatamPage() {
  const navigate = useNavigate();
  const [seleccionado, setSeleccionado] = useState('Bolivia');
  const pais = paises.find((p) => p.nombre === seleccionado)!;

  return (
    <div className="min-h-screen bg-[#0E0F19] text-white">
      <div className="mx-auto max-w-[760px] px-4 py-6 sm:px-6">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm text-[#85889E] hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Volver
        </button>

        <header className="flex items-center gap-4 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF8C00]/15">
            <Map className="h-6 w-6 text-[#FF8C00]" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">LATAM Protocol</h1>
            <p className="text-sm text-[#85889E]">Expansión cripto-nativa a 5 países de América Latina</p>
          </div>
        </header>

        <section className="grid grid-cols-5 gap-2 mb-6">
          {paises.map((p) => (
            <button key={p.nombre} onClick={() => setSeleccionado(p.nombre)}
              className={`rounded-xl border p-3 text-center transition ${seleccionado === p.nombre ? 'border-[#FF8C00] bg-[#FF8C00]/10' : 'border-white/10 bg-[#161825] hover:border-white/30'}`}>
              <p className="text-lg font-bold text-white">{p.codigo}</p>
              <p className="text-xs mt-1" style={{ color: p.color }}>{p.estado}</p>
            </button>
          ))}
        </section>

        <section className="rounded-xl bg-[#161825] border border-white/10 p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">{pais.nombre}</h2>
            <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ color: pais.color, backgroundColor: `${pais.color}20` }}>
              {pais.estado}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Usuarios activos', value: pais.usuarios },
              { label: 'Volumen mensual', value: pais.volumen },
              { label: 'Cashback generado', value: pais.cashback },
              { label: 'Lanzamiento', value: pais.lanzamiento },
            ].map((d) => (
              <div key={d.label} className="rounded-lg bg-[#0E0F19] p-3">
                <p className="text-xs text-[#85889E]">{d.label}</p>
                <p className="mt-1 text-sm font-bold text-white">{d.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl bg-[#161825] border border-white/10 p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Línea de tiempo</h2>
          <div className="relative pl-4">
            <div className="absolute left-0 top-0 bottom-0 w-px bg-white/10" />
            {timeline.map((t, i) => (
              <div key={i} className="relative mb-4 last:mb-0">
                <div className="absolute -left-4 top-1.5 h-2 w-2 rounded-full bg-[#FF8C00]" />
                <p className="text-xs text-[#FF8C00] font-semibold">{t.fecha}</p>
                <p className="text-sm text-[#D1D5DB] mt-0.5">{t.hito}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BriefcaseBusiness } from 'lucide-react';

const perfiles = [
  {
    nombre: 'Historial bajo', score: 340, color: '#EF4444',
    factores: [
      { label: 'Antigüedad', valor: 20 }, { label: 'Volumen QR', valor: 15 },
      { label: 'Consistencia', valor: 30 }, { label: 'Variedad comercios', valor: 25 },
      { label: 'Sin mora', valor: 60 },
    ],
    beneficios: [],
  },
  {
    nombre: 'Historial medio', score: 640, color: '#FF8C00',
    factores: [
      { label: 'Antigüedad', valor: 55 }, { label: 'Volumen QR', valor: 60 },
      { label: 'Consistencia', valor: 65 }, { label: 'Variedad comercios', valor: 50 },
      { label: 'Sin mora', valor: 80 },
    ],
    beneficios: ['Adelanto hasta 50% cashback', 'Nivel 2 automático'],
  },
  {
    nombre: 'Historial alto', score: 890, color: '#10B981',
    factores: [
      { label: 'Antigüedad', valor: 90 }, { label: 'Volumen QR', valor: 85 },
      { label: 'Consistencia', valor: 95 }, { label: 'Variedad comercios', valor: 80 },
      { label: 'Sin mora', valor: 100 },
    ],
    beneficios: ['Adelanto hasta 90% cashback', 'Nivel 3 garantizado', 'Acceso a Protocolo B2B', 'Score portable LATAM'],
  },
];

export default function BanexScorePage() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(1);
  const p = perfiles[perfil];
  const arc = (p.score / 1000) * 180;

  return (
    <div className="min-h-screen bg-[#0E0F19] text-white">
      <div className="mx-auto max-w-[760px] px-4 py-6 sm:px-6">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm text-[#85889E] hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Volver
        </button>

        <header className="flex items-center gap-4 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF8C00]/15">
            <BriefcaseBusiness className="h-6 w-6 text-[#FF8C00]" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">BanexScore</h1>
            <p className="text-sm text-[#85889E]">Tu reputación financiera portable en toda LATAM</p>
          </div>
        </header>

        <div className="grid grid-cols-3 gap-2 mb-6">
          {perfiles.map((pr, i) => (
            <button key={pr.nombre} onClick={() => setPerfil(i)}
              className={`rounded-lg border p-3 text-sm transition ${perfil === i ? 'border-[#FF8C00] bg-[#FF8C00]/10' : 'border-white/10 bg-[#161825] hover:border-white/30'}`}>
              <span className="block font-semibold text-white">{pr.nombre}</span>
              <span className="text-xs" style={{ color: pr.color }}>{pr.score} pts</span>
            </button>
          ))}
        </div>

        <section className="rounded-xl bg-[#161825] border border-white/10 p-6 mb-4 flex flex-col items-center">
          <div className="relative w-48 h-24 overflow-hidden mb-2">
            <svg viewBox="0 0 200 100" className="w-full">
              <path d="M10,100 A90,90 0 0,1 190,100" fill="none" stroke="#1F2937" strokeWidth="16" strokeLinecap="round" />
              <path d="M10,100 A90,90 0 0,1 190,100" fill="none" stroke={p.color} strokeWidth="16" strokeLinecap="round"
                strokeDasharray={`${(arc / 180) * 283} 283`} className="transition-all duration-700" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
              <span className="text-3xl font-bold text-white">{p.score}</span>
              <span className="text-xs text-[#85889E]">de 1000</span>
            </div>
          </div>
          <span className="text-sm font-semibold" style={{ color: p.color }}>{p.nombre}</span>
        </section>

        <section className="rounded-xl bg-[#161825] border border-white/10 p-5 mb-4">
          <h2 className="text-sm font-semibold text-white mb-4">5 factores del score</h2>
          {p.factores.map((f) => (
            <div key={f.label} className="mb-3">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-[#85889E]">{f.label}</span>
                <span className="text-xs font-semibold text-white">{f.valor}/100</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10">
                <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${f.valor}%`, backgroundColor: p.color }} />
              </div>
            </div>
          ))}
        </section>

        <section className="rounded-xl bg-[#161825] border border-white/10 p-5">
          <h2 className="text-sm font-semibold text-white mb-3">Beneficios desbloqueados</h2>
          {p.beneficios.length === 0
            ? <p className="text-sm text-[#85889E]">Aumenta tu score para desbloquear beneficios.</p>
            : p.beneficios.map((b) => (
              <div key={b} className="flex items-center gap-2 mb-2 text-sm text-white">
                <span className="text-green-400">✓</span> {b}
              </div>
            ))}
        </section>
      </div>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HeartPulse } from 'lucide-react';

const anillos = [
  { label: 'Ahorro', valor: 68, color: '#10B981', descripcion: 'Separas el 12% de tus ingresos' },
  { label: 'Gastos fijos', valor: 82, color: '#5346F6', descripcion: 'Tus fijos son el 34% del total' },
  { label: 'Consistencia', valor: 74, color: '#FF8C00', descripcion: '22 de 30 días con pagos QR' },
];

const tips = [
  { texto: 'Aumenta tu ahorro mensual de 180 Bs a 250 Bs', impacto: '+12 pts score', color: '#10B981' },
  { texto: 'Reduce gastos en restaurantes un 15%', impacto: '-85 Bs/mes', color: '#FF8C00' },
  { texto: 'Usa QR en FarmaBolivia para sumar Nivel 3', impacto: '+0.5% cashback', color: '#5346F6' },
];

const metas = [
  { nombre: 'Fondo emergencia 3 meses', actual: 2400, objetivo: 4500, color: '#10B981' },
  { nombre: 'Viaje Carnaval 2026', actual: 840, objetivo: 2000, color: '#FF8C00' },
];

const proyeccion = [
  { mes: 'Jun', ahorro: 180, cashback: 28 },
  { mes: 'Jul', ahorro: 210, cashback: 34 },
  { mes: 'Ago', ahorro: 250, cashback: 42 },
];

export default function WellnessPage() {
  const navigate = useNavigate();
  const maxBar = Math.max(...proyeccion.map((p) => p.ahorro + p.cashback));

  return (
    <div className="min-h-screen bg-[#0E0F19] text-white">
      <div className="mx-auto max-w-[760px] px-4 py-6 sm:px-6">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm text-[#85889E] hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Volver
        </button>

        <header className="flex items-center gap-4 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF8C00]/15">
            <HeartPulse className="h-6 w-6 text-[#FF8C00]" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Wellness Coach</h1>
            <p className="text-sm text-[#85889E]">Tu coach financiero IA personal, gratis con BANEXCOIN</p>
          </div>
        </header>

        <section className="rounded-xl bg-[#161825] border border-white/10 p-5 mb-4">
          <h2 className="text-sm font-semibold text-white mb-5">Salud financiera</h2>
          <div className="grid grid-cols-3 gap-4">
            {anillos.map((a) => (
              <div key={a.label} className="flex flex-col items-center gap-2">
                <div className="relative w-20 h-20">
                  <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                    <circle cx="40" cy="40" r="30" fill="none" stroke="#1F2937" strokeWidth="8" />
                    <circle cx="40" cy="40" r="30" fill="none" stroke={a.color} strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${(a.valor / 100) * 188.5} 188.5`}
                      className="transition-all duration-700" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{a.valor}%</span>
                  </div>
                </div>
                <p className="text-xs font-semibold text-white text-center">{a.label}</p>
                <p className="text-xs text-[#85889E] text-center leading-4">{a.descripcion}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl bg-[#161825] border border-white/10 p-5 mb-4">
          <h2 className="text-sm font-semibold text-white mb-3">Tips personalizados</h2>
          <div className="space-y-3">
            {tips.map((t, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg bg-[#0E0F19] p-3">
                <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: t.color }} />
                <div className="flex-1">
                  <p className="text-sm text-white">{t.texto}</p>
                  <p className="text-xs mt-1 font-semibold" style={{ color: t.color }}>{t.impacto}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl bg-[#161825] border border-white/10 p-5 mb-4">
          <h2 className="text-sm font-semibold text-white mb-4">Mis metas</h2>
          {metas.map((m) => (
            <div key={m.nombre} className="mb-4 last:mb-0">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-white">{m.nombre}</span>
                <span className="text-xs text-[#85889E]">{m.actual} / {m.objetivo} Bs</span>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${(m.actual / m.objetivo) * 100}%`, backgroundColor: m.color }} />
              </div>
              <p className="text-xs text-[#85889E] mt-1">{((m.actual / m.objetivo) * 100).toFixed(0)}% completado · faltan {m.objetivo - m.actual} Bs</p>
            </div>
          ))}
        </section>

        <section className="rounded-xl bg-[#161825] border border-white/10 p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Proyección 3 meses</h2>
          <div className="flex items-end gap-3 h-28">
            {proyeccion.map((p) => {
              const total = p.ahorro + p.cashback;
              const h = (total / maxBar) * 100;
              const hSav = (p.ahorro / total) * h;
              const hCb = (p.cashback / total) * h;
              return (
                <div key={p.mes} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col justify-end" style={{ height: `${h}%` }}>
                    <div className="w-full rounded-t" style={{ height: `${hCb}%`, backgroundColor: '#FF8C00' }} />
                    <div className="w-full rounded-b" style={{ height: `${hSav}%`, backgroundColor: '#10B981' }} />
                  </div>
                  <p className="text-xs text-[#85889E]">{p.mes}</p>
                  <p className="text-xs font-bold text-white">{total} Bs</p>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-3">
            <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-[#10B981]" /><span className="text-xs text-[#85889E]">Ahorro</span></div>
            <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-[#FF8C00]" /><span className="text-xs text-[#85889E]">Cashback</span></div>
          </div>
        </section>
      </div>
    </div>
  );
}

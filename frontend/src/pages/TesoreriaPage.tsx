import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bot } from 'lucide-react';

const RATE = 6.9;

const asignaciones = [
  { nombre: 'Liquidez USDT', pct: 30, yield: 0.0001, color: '#5346F6' },
  { nombre: 'Aave v3', pct: 35, yield: 0.00028, color: '#FF8C00' },
  { nombre: 'Compound', pct: 20, yield: 0.00022, color: '#10B981' },
  { nombre: 'T-Bills tokenizados', pct: 15, yield: 0.00015, color: '#6366F1' },
];

const decisiones = [
  { tiempo: 'hace 2 min', accion: 'Reasignó 5% de Liquidez → Aave (APY subió a 12.4%)' },
  { tiempo: 'hace 18 min', accion: 'Compound APY bajó a 8.1%, redujo exposición 5%' },
  { tiempo: 'hace 1h', accion: 'Renovó posición T-Bills por 30 días adicionales' },
  { tiempo: 'hace 3h', accion: 'Detectó oportunidad arbitraje, ejecutó rebalanceo' },
];

const RESERVA_USDT = 48000;

export default function TesoreriaPage() {
  const navigate = useNavigate();
  const [yieldAcum, setYieldAcum] = useState(0);

  const yieldDiarioUsdt = asignaciones.reduce((s, a) => s + RESERVA_USDT * (a.pct / 100) * a.yield, 0);
  const yieldSegUsdt = yieldDiarioUsdt / 86400;

  useEffect(() => {
    const id = setInterval(() => setYieldAcum((v) => v + yieldSegUsdt), 1000);
    return () => clearInterval(id);
  }, [yieldSegUsdt]);

  return (
    <div className="min-h-screen bg-[#0E0F19] text-white">
      <div className="mx-auto max-w-[760px] px-4 py-6 sm:px-6">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm text-[#85889E] hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Volver
        </button>

        <header className="flex items-center gap-4 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF8C00]/15">
            <Bot className="h-6 w-6 text-[#FF8C00]" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Tesorería Autónoma</h1>
            <p className="text-sm text-[#85889E]">Agente IA optimiza las reservas de Banexcoin 24/7</p>
          </div>
        </header>

        <section className="rounded-xl border border-[#FF8C00]/30 bg-[#161825] p-6 mb-4">
          <p className="text-xs uppercase tracking-widest text-[#85889E] mb-1">Yield generado hoy</p>
          <p className="text-4xl font-bold text-[#FF8C00] tabular-nums">{(yieldAcum).toFixed(6)} USDT</p>
          <p className="text-sm text-[#85889E] mt-1">≈ {(yieldAcum * RATE).toFixed(4)} Bs · {yieldSegUsdt.toFixed(8)} USDT/seg</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-[#0E0F19] p-3">
              <p className="text-xs text-[#85889E]">Reserva total</p>
              <p className="text-lg font-bold text-white">{RESERVA_USDT.toLocaleString()} USDT</p>
            </div>
            <div className="rounded-lg bg-[#0E0F19] p-3">
              <p className="text-xs text-[#85889E]">APY ponderado</p>
              <p className="text-lg font-bold text-green-400">~10.8%</p>
            </div>
          </div>
        </section>

        <section className="rounded-xl bg-[#161825] border border-white/10 p-5 mb-4">
          <h2 className="text-sm font-semibold text-white mb-4">Portafolio de reservas</h2>
          {asignaciones.map((a) => {
            const montoUsdt = RESERVA_USDT * (a.pct / 100);
            return (
              <div key={a.nombre} className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-white">{a.nombre}</span>
                  <span className="text-sm font-semibold text-white">{a.pct}% · {montoUsdt.toLocaleString()} USDT</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-2 rounded-full transition-all" style={{ width: `${a.pct}%`, backgroundColor: a.color }} />
                </div>
              </div>
            );
          })}
        </section>

        <section className="rounded-xl bg-[#161825] border border-white/10 p-5">
          <h2 className="text-sm font-semibold text-white mb-3">Log de decisiones IA</h2>
          <div className="space-y-3">
            {decisiones.map((d, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <span className="shrink-0 text-xs text-[#85889E] pt-0.5 w-20">{d.tiempo}</span>
                <p className="text-[#D1D5DB] leading-5">{d.accion}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

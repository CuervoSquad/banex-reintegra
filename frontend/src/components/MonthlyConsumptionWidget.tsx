import { useEffect, useState } from 'react';
import { TrendingUp, X, RefreshCw } from 'lucide-react';
import { cashbackService, type CashbackStream } from '../services/cashbackService';

function formatBob(n: number) {
  return `Bs ${n.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function currentMonthStreams(streams: CashbackStream[]): CashbackStream[] {
  const now = new Date();
  return streams.filter((s) => {
    const d = new Date(s.starts_at);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
}

const LEVELS = [
  { name: 'Bronce',   min: 0,     max: 500,   pct: 0.01 },
  { name: 'Plata',    min: 500,   max: 1500,  pct: 0.02 },
  { name: 'Oro',      min: 1500,  max: 3000,  pct: 0.03 },
  { name: 'Platino',  min: 3000,  max: 6000,  pct: 0.04 },
  { name: 'Diamante', min: 6000,  max: Infinity, pct: 0.05 },
];

function resolveLevel(totalBs: number) {
  return LEVELS.findLast((l) => totalBs >= l.min) ?? LEVELS[0];
}

export default function MonthlyConsumptionWidget() {
  const [open, setOpen] = useState(false);
  const [streams, setStreams] = useState<CashbackStream[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const all = await cashbackService.list();
      setStreams(all);
    } catch {
      setError('No se pudo cargar el consumo.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) load();
  }, [open]);

  const monthly = currentMonthStreams(streams);
  const totalBs = monthly.reduce((acc, s) => acc + parseFloat(s.payment_amount), 0);
  const totalCashback = monthly.reduce((acc, s) => acc + parseFloat(s.cashback_total), 0);
  const level = resolveLevel(totalBs);
  const nextLevel = LEVELS[LEVELS.indexOf(level) + 1];
  const progress = nextLevel
    ? Math.min(100, ((totalBs - level.min) / (nextLevel.min - level.min)) * 100)
    : 100;

  const now = new Date();
  const monthLabel = now.toLocaleString('es-BO', { month: 'long', year: 'numeric' });

  return (
    <>
      {/* Botón flotante — a la izquierda del chat */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-24 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#FF8C00] shadow-[0_0_20px_rgba(255,140,0,0.5)] transition hover:scale-110 hover:bg-[#e07800]"
        aria-label="Ver consumo mensual"
      >
        {open ? <X className="h-6 w-6 text-[#0E0F19]" /> : <TrendingUp className="h-6 w-6 text-[#0E0F19]" />}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-24 z-50 w-[300px] overflow-hidden rounded-2xl border border-white/10 bg-[#161825] shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
          {/* Header */}
          <div className="flex items-center justify-between bg-[#FF8C00] px-4 py-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#0E0F19]" />
              <div>
                <p className="text-sm font-semibold text-[#0E0F19]">Consumo mensual</p>
                <p className="text-xs text-[#0E0F19]/70 capitalize">{monthLabel}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="rounded-full p-1 transition hover:bg-black/10"
              aria-label="Actualizar"
            >
              <RefreshCw className={`h-4 w-4 text-[#0E0F19] ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {error && <p className="text-center text-xs text-red-400">{error}</p>}

            {!error && (
              <>
                {/* Monto total */}
                <div className="rounded-xl bg-[#0E0F19] p-3 text-center">
                  <p className="text-xs text-[#85889E] mb-1">Total consumido</p>
                  <p className="text-2xl font-bold text-white">{formatBob(totalBs)}</p>
                  <p className="text-xs text-[#85889E] mt-1">{monthly.length} pago{monthly.length !== 1 ? 's' : ''} QR este mes</p>
                </div>

                {/* Nivel y progreso */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-[#FF8C00]">Nivel {level.name}</span>
                    <span className="text-[#85889E]">{level.pct * 100}% reintegro</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-[#FF8C00] transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  {nextLevel && (
                    <p className="text-xs text-[#85889E] mt-1 text-right">
                      {formatBob(nextLevel.min - totalBs)} para {nextLevel.name}
                    </p>
                  )}
                </div>

                {/* Cashback estimado */}
                <div className="flex justify-between rounded-xl bg-[#0E0F19] px-3 py-2">
                  <span className="text-xs text-[#85889E]">Cashback estimado</span>
                  <span className="text-sm font-bold text-[#FF8C00]">{formatBob(totalCashback)}</span>
                </div>

                {monthly.length === 0 && !loading && (
                  <p className="text-center text-xs text-[#85889E]">Sin pagos QR este mes.</p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

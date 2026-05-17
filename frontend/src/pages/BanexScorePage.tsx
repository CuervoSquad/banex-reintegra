import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BriefcaseBusiness, RefreshCw, ShieldCheck, TrendingUp, Coins } from 'lucide-react';
import { scoreService, type BanexScore } from '../services/scoreService';

function fmt(n: number) {
  return `Bs ${n.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function scoreColor(s: number) {
  if (s >= 800) return '#10B981';
  if (s >= 600) return '#FF8C00';
  if (s >= 400) return '#F59E0B';
  return '#EF4444';
}

function scoreLabel(s: number) {
  if (s >= 800) return 'Excelente';
  if (s >= 600) return 'Bueno';
  if (s >= 400) return 'Regular';
  if (s > 0)   return 'Bajo';
  return 'Sin historial';
}

export default function BanexScorePage() {
  const navigate = useNavigate();
  const [data, setData] = useState<BanexScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setData(await scoreService.get());
    } catch {
      setError('No se pudo calcular el score. Verificá tu conexión.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const color = data ? scoreColor(data.score) : '#85889E';
  const arc   = data ? (data.score / 1000) * 283 : 0;

  return (
    <div className="min-h-screen bg-[#0E0F19] text-white">
      <div className="mx-auto max-w-[760px] px-4 py-6 sm:px-6">

        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-[#85889E] hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Volver
          </button>
          <button onClick={load} disabled={loading} className="flex items-center gap-1 text-xs text-[#85889E] hover:text-white">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Actualizar
          </button>
        </div>

        <header className="flex items-center gap-4 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF8C00]/15">
            <BriefcaseBusiness className="h-6 w-6 text-[#FF8C00]" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">BanexScore</h1>
            <p className="text-sm text-[#85889E]">Tu reputación financiera calculada desde tus pagos QR reales</p>
          </div>
        </header>

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-center text-sm text-red-400 mb-4">{error}</div>
        )}

        {loading && !data && (
          <div className="rounded-xl bg-[#161825] border border-white/10 p-12 flex flex-col items-center gap-3">
            <RefreshCw className="h-8 w-8 text-[#FF8C00] animate-spin" />
            <p className="text-sm text-[#85889E]">Calculando tu score desde tus pagos QR...</p>
          </div>
        )}

        {data && (
          <>
            {/* Score visual */}
            <section className="rounded-xl bg-[#161825] border border-white/10 p-6 mb-4 flex flex-col items-center">
              <div className="relative w-48 h-28 overflow-hidden mb-3">
                <svg viewBox="0 0 100 60" className="w-full">
                  <path d="M5,55 A45,45 0 0,1 95,55" fill="none" stroke="#1F2937" strokeWidth="8" strokeLinecap="round" />
                  <path d="M5,55 A45,45 0 0,1 95,55" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${(data.score / 1000) * 141} 141`}
                    className="transition-all duration-700" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
                  <span className="text-4xl font-bold text-white">{data.score}</span>
                  <span className="text-xs text-[#85889E]">de 1000</span>
                </div>
              </div>
              <span className="text-base font-semibold" style={{ color }}>{scoreLabel(data.score)}</span>

              {/* Stats rápidos */}
              <div className="grid grid-cols-3 gap-3 w-full mt-5">
                {[
                  { label: 'Pagos QR', value: data.total_streams },
                  { label: 'Total consumido', value: fmt(data.total_bs) },
                  { label: 'Comercios', value: data.comercios_unicos },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg bg-[#0E0F19] p-3 text-center">
                    <p className="text-xs text-[#85889E]">{s.label}</p>
                    <p className="text-sm font-bold text-white mt-1">{s.value}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 5 Factores */}
            <section className="rounded-xl bg-[#161825] border border-white/10 p-5 mb-4">
              <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#FF8C00]" /> Factores del score
              </h2>
              {data.factores.map((f) => (
                <div key={f.label} className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-[#85889E]">{f.label}</span>
                    <span className="text-xs font-semibold text-white">{f.valor}/100</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10">
                    <div className="h-1.5 rounded-full transition-all duration-700"
                      style={{ width: `${f.valor}%`, backgroundColor: color }} />
                  </div>
                </div>
              ))}
            </section>

            {/* Microcrédito */}
            <section className="rounded-xl border p-5 mb-4"
              style={{ borderColor: data.credit.elegible ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)', backgroundColor: data.credit.elegible ? 'rgba(16,185,129,0.05)' : '#161825' }}>
              <h2 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                <Coins className="h-4 w-4" style={{ color: data.credit.elegible ? '#10B981' : '#85889E' }} />
                Microcrédito sin banco
              </h2>
              <p className="text-xs text-[#85889E] mb-4">
                Tu historial de pagos QR reemplaza al historial bancario tradicional.
              </p>
              {data.credit.elegible ? (
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-[#0E0F19] p-3 text-center">
                    <p className="text-xs text-[#85889E]">Límite estimado</p>
                    <p className="text-sm font-bold text-green-400 mt-1">{fmt(data.credit.limite_bs)}</p>
                  </div>
                  <div className="rounded-lg bg-[#0E0F19] p-3 text-center">
                    <p className="text-xs text-[#85889E]">Tasa anual</p>
                    <p className="text-sm font-bold text-white mt-1">{data.credit.tasa_anual_pct}%</p>
                  </div>
                  <div className="rounded-lg bg-[#0E0F19] p-3 text-center">
                    <p className="text-xs text-[#85889E]">Nivel</p>
                    <p className="text-sm font-bold text-white mt-1">{data.credit.tier}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[#85889E]">
                  Necesitás un BanexScore ≥ 400 para acceder a microcrédito. Seguí pagando con QR.
                </p>
              )}
            </section>

            {/* ZK Claims preview */}
            <section className="rounded-xl bg-[#161825] border border-white/10 p-5">
              <h2 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#5346F6]" /> Claims ZK disponibles
              </h2>
              <p className="text-xs text-[#85889E] mb-4">
                Podés probar estas afirmaciones sin revelar tus transacciones.
              </p>
              <div className="space-y-2">
                {data.zk_claims.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 rounded-lg bg-[#0E0F19] px-3 py-2">
                    <span className={`text-lg ${c.cumple ? 'text-green-400' : 'text-[#3D3E52]'}`}>
                      {c.cumple ? '✓' : '○'}
                    </span>
                    <div className="flex-1">
                      <p className={`text-xs font-semibold ${c.cumple ? 'text-white' : 'text-[#85889E]'}`}>{c.label}</p>
                      <p className="text-xs text-[#85889E]">{c.descripcion}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/zk-privacidad')}
                className="mt-4 w-full rounded-lg bg-[#5346F6]/15 border border-[#5346F6]/30 py-2.5 text-sm font-semibold text-[#5346F6] transition hover:bg-[#5346F6]/25"
              >
                Generar prueba ZK →
              </button>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

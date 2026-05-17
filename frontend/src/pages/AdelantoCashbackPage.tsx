import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Gem, CheckCircle2, Circle, Loader } from 'lucide-react';

const RATE = 6.9;
const TARIFA = 0.03;

const pasos = ['Solicitud', 'Verificación', 'Aprobación', 'Desembolso'];

export default function AdelantoCashbackPage() {
  const navigate = useNavigate();
  const [consumo, setConsumo] = useState(3000);
  const [porcentaje, setPorcentaje] = useState(50);
  const [paso, setPaso] = useState(-1);
  const [loading, setLoading] = useState(false);

  const nivel = consumo < 1000 ? 0.01 : consumo < 3000 ? 0.015 : 0.02;
  const cashbackEstimado = consumo * nivel;
  const montoAdelanto = cashbackEstimado * (porcentaje / 100);
  const tarifaMonto = montoAdelanto * TARIFA;
  const neto = montoAdelanto - tarifaMonto;
  const netoUsdt = neto / RATE;

  function simularFlujo() {
    setLoading(true);
    setPaso(0);
    let i = 0;
    const avanzar = () => {
      i++;
      if (i < pasos.length) { setPaso(i); setTimeout(avanzar, 900); }
      else setLoading(false);
    };
    setTimeout(avanzar, 900);
  }

  return (
    <div className="min-h-screen bg-[#0E0F19] text-white">
      <div className="mx-auto max-w-[760px] px-4 py-6 sm:px-6">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm text-[#85889E] hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Volver
        </button>

        <header className="flex items-center gap-4 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF8C00]/15">
            <Gem className="h-6 w-6 text-[#FF8C00]" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Adelanto Cashback</h1>
            <p className="text-sm text-[#85889E]">Usa tu cashback futuro como colateral hoy mismo</p>
          </div>
        </header>

        <section className="rounded-xl bg-[#161825] border border-white/10 p-5 mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-[#85889E]">Consumo mensual estimado</span>
            <span className="font-semibold text-white">{consumo.toLocaleString()} Bs</span>
          </div>
          <input type="range" min={200} max={10000} step={100} value={consumo}
            onChange={(e) => { setConsumo(Number(e.target.value)); setPaso(-1); }}
            className="w-full accent-[#FF8C00] mb-4" />

          <div className="flex justify-between mb-2">
            <span className="text-sm text-[#85889E]">% a adelantar</span>
            <span className="font-semibold text-white">{porcentaje}%</span>
          </div>
          <input type="range" min={10} max={90} step={10} value={porcentaje}
            onChange={(e) => { setPorcentaje(Number(e.target.value)); setPaso(-1); }}
            className="w-full accent-[#5346F6]" />
        </section>

        <section className="rounded-xl border border-[#FF8C00]/30 bg-[#161825] p-5 mb-4">
          <h2 className="text-sm font-semibold text-white mb-4">Resumen del adelanto</h2>
          <div className="space-y-3">
            {[
              { label: 'Cashback estimado mes', value: `${cashbackEstimado.toFixed(2)} Bs` },
              { label: `Adelanto (${porcentaje}%)`, value: `${montoAdelanto.toFixed(2)} Bs` },
              { label: 'Tarifa 3%', value: `-${tarifaMonto.toFixed(2)} Bs`, red: true },
              { label: 'Neto a recibir', value: `${neto.toFixed(2)} Bs`, orange: true },
              { label: 'Equivalente USDT', value: `${netoUsdt.toFixed(4)} USDT`, orange: true },
            ].map((r) => (
              <div key={r.label} className="flex justify-between text-sm">
                <span className="text-[#85889E]">{r.label}</span>
                <span className={r.orange ? 'font-bold text-[#FF8C00]' : r.red ? 'text-red-400' : 'text-white'}>{r.value}</span>
              </div>
            ))}
          </div>
        </section>

        {paso >= 0 && (
          <section className="rounded-xl bg-[#161825] border border-white/10 p-5 mb-4">
            <h2 className="text-sm font-semibold text-white mb-4">Flujo de aprobación</h2>
            <div className="flex items-center gap-2">
              {pasos.map((p, i) => (
                <div key={p} className="flex flex-1 flex-col items-center gap-1">
                  {i < paso ? <CheckCircle2 className="h-6 w-6 text-green-400" /> :
                    i === paso && loading ? <Loader className="h-6 w-6 text-[#FF8C00] animate-spin" /> :
                    i === paso ? <CheckCircle2 className="h-6 w-6 text-[#FF8C00]" /> :
                    <Circle className="h-6 w-6 text-[#85889E]" />}
                  <span className={`text-xs text-center ${i <= paso ? 'text-white' : 'text-[#85889E]'}`}>{p}</span>
                  {i < pasos.length - 1 && <div className={`hidden sm:block absolute`} />}
                </div>
              ))}
            </div>
            {!loading && paso === pasos.length - 1 && (
              <p className="mt-4 text-center text-sm text-green-400 font-semibold">
                ✓ {neto.toFixed(2)} Bs desembolsados a tu wallet
              </p>
            )}
          </section>
        )}

        <button onClick={simularFlujo} disabled={loading || paso === pasos.length - 1}
          className="w-full rounded-xl bg-[#FF8C00] py-4 text-sm font-bold text-[#0E0F19] transition hover:bg-[#F38118] disabled:opacity-50">
          {paso === -1 ? 'Solicitar adelanto' : loading ? 'Procesando...' : 'Solicitud completada'}
        </button>
      </div>
    </div>
  );
}

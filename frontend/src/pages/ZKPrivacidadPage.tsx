import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, CheckCircle2, Lock, Unlock } from 'lucide-react';

const claims = [
  { id: 'consumo', label: 'Consumo > 200 Bs este mes', descripcion: 'Sin revelar monto exacto' },
  { id: 'nivel3', label: 'Nivel 3 activo', descripcion: 'Sin revelar historial completo' },
  { id: 'sinmora', label: 'Sin mora últimos 6 meses', descripcion: 'Sin revelar transacciones' },
];

type Estado = 'idle' | 'generando' | 'verificando' | 'verificado';

export default function ZKPrivacidadPage() {
  const navigate = useNavigate();
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [estado, setEstado] = useState<Estado>('idle');

  function toggle(id: string) {
    setSeleccionados((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    setEstado('idle');
  }

  function generarPrueba() {
    if (!seleccionados.length) return;
    setEstado('generando');
    setTimeout(() => setEstado('verificando'), 1800);
    setTimeout(() => setEstado('verificado'), 3400);
  }

  const pasos = [
    { key: 'generando', label: 'Generando prueba ZK', desc: 'Calculando circuito criptográfico...' },
    { key: 'verificando', label: 'Verificando on-chain', desc: 'Enviando proof al verificador...' },
    { key: 'verificado', label: 'Prueba verificada', desc: '¡Identidad confirmada sin revelar datos!' },
  ];

  const pasoActual = pasos.findIndex((p) => p.key === estado);

  return (
    <div className="min-h-screen bg-[#0E0F19] text-white">
      <div className="mx-auto max-w-[760px] px-4 py-6 sm:px-6">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm text-[#85889E] hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Volver
        </button>

        <header className="flex items-center gap-4 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#5346F6]/15">
            <ShieldCheck className="h-6 w-6 text-[#5346F6]" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">ZK Privacidad</h1>
            <p className="text-sm text-[#85889E]">Prueba quién eres sin revelar tus transacciones</p>
          </div>
        </header>

        <section className="rounded-xl bg-[#161825] border border-white/10 p-5 mb-4">
          <h2 className="text-sm font-semibold text-white mb-1">¿Qué quieres probar?</h2>
          <p className="text-xs text-[#85889E] mb-4">Selecciona las afirmaciones a verificar</p>
          <div className="space-y-3">
            {claims.map((c) => {
              const sel = seleccionados.includes(c.id);
              return (
                <button key={c.id} onClick={() => toggle(c.id)}
                  className={`w-full flex items-center gap-3 rounded-lg border p-4 text-left transition ${sel ? 'border-[#5346F6] bg-[#5346F6]/10' : 'border-white/10 hover:border-white/30'}`}>
                  {sel ? <Lock className="h-5 w-5 text-[#5346F6] shrink-0" /> : <Unlock className="h-5 w-5 text-[#85889E] shrink-0" />}
                  <div>
                    <p className="text-sm font-semibold text-white">{c.label}</p>
                    <p className="text-xs text-[#85889E]">{c.descripcion}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {estado !== 'idle' && (
          <section className="rounded-xl bg-[#161825] border border-white/10 p-5 mb-4">
            <h2 className="text-sm font-semibold text-white mb-4">Generando prueba ZK</h2>
            <div className="space-y-3">
              {pasos.map((p, i) => {
                const hecho = i < pasoActual || (estado === 'verificado' && i <= pasoActual);
                const activo = i === pasoActual && estado !== 'verificado';
                return (
                  <div key={p.key} className="flex items-start gap-3">
                    {hecho || estado === 'verificado' && i === pasos.length - 1
                      ? <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 shrink-0" />
                      : <div className={`h-5 w-5 rounded-full border-2 mt-0.5 shrink-0 ${activo ? 'border-[#5346F6] animate-pulse' : 'border-[#85889E]'}`} />}
                    <div>
                      <p className={`text-sm font-semibold ${hecho || (estado === 'verificado' && i === pasos.length - 1) ? 'text-white' : activo ? 'text-[#5346F6]' : 'text-[#85889E]'}`}>{p.label}</p>
                      <p className="text-xs text-[#85889E]">{p.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            {estado === 'verificado' && (
              <div className="mt-4 rounded-lg bg-green-400/10 border border-green-400/30 p-3 text-center">
                <p className="text-sm font-bold text-green-400">✓ Prueba ZK verificada on-chain</p>
                <p className="text-xs text-[#85889E] mt-1">Ninguna transacción fue revelada al verificador</p>
              </div>
            )}
          </section>
        )}

        <button onClick={generarPrueba} disabled={!seleccionados.length || (estado !== 'idle' && estado !== 'verificado')}
          className="w-full rounded-xl bg-[#5346F6] py-4 text-sm font-bold text-white transition hover:bg-[#6357f8] disabled:opacity-40">
          {estado === 'verificado' ? 'Generar nueva prueba' : estado === 'idle' ? 'Generar prueba ZK' : 'Procesando...'}
        </button>
      </div>
    </div>
  );
}

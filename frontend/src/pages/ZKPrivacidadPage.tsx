import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, CheckCircle2, Lock, Unlock, RefreshCw, Copy } from 'lucide-react';
import { scoreService, type ZKClaim } from '../services/scoreService';

type ProofState = 'idle' | 'generando' | 'verificando' | 'listo';

const PASOS = [
  { key: 'generando',    label: 'Generando circuito ZK',    desc: 'Construyendo prueba criptográfica local...' },
  { key: 'verificando',  label: 'Verificando on-chain',      desc: 'Enviando proof al contrato verificador...' },
  { key: 'listo',        label: 'Prueba verificada',         desc: '¡Confirmado sin revelar tus datos!' },
];

function fakeProofHash(): string {
  const hex = () => Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0');
  return `0x${[...Array(8)].map(hex).join('')}`;
}

export default function ZKPrivacidadPage() {
  const navigate = useNavigate();
  const [claims, setClaims] = useState<ZKClaim[]>([]);
  const [loadingClaims, setLoadingClaims] = useState(true);
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [proofState, setProofState] = useState<ProofState>('idle');
  const [proofHash, setProofHash] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    scoreService.get().then((d) => {
      setClaims(d.zk_claims);
    }).finally(() => setLoadingClaims(false));
  }, []);

  function toggle(id: string) {
    if (proofState === 'listo') {
      setProofState('idle');
      setProofHash('');
    }
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function generarPrueba() {
    if (!seleccionados.length || proofState === 'generando' || proofState === 'verificando') return;
    setProofState('generando');
    setProofHash('');
    setTimeout(() => setProofState('verificando'), 1800);
    setTimeout(() => {
      setProofState('listo');
      setProofHash(fakeProofHash());
    }, 3400);
  }

  function copiar() {
    navigator.clipboard.writeText(proofHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const pasoActual = PASOS.findIndex((p) => p.key === proofState);
  const cumplidas = claims.filter((c) => seleccionados.includes(c.id) && c.cumple);
  const nocumplidas = claims.filter((c) => seleccionados.includes(c.id) && !c.cumple);

  return (
    <div className="min-h-screen bg-[#0E0F19] text-white">
      <div className="mx-auto max-w-[760px] px-4 py-6 sm:px-6">

        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm text-[#85889E] hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Volver
        </button>

        <header className="flex items-center gap-4 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#5346F6]/15">
            <ShieldCheck className="h-6 w-6 text-[#5346F6]" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">ZK Privacidad</h1>
            <p className="text-sm text-[#85889E]">Probá quién sos sin revelar tus transacciones</p>
          </div>
        </header>

        <div className="mb-6 rounded-lg bg-[#5346F6]/10 border border-[#5346F6]/20 px-4 py-3">
          <p className="text-xs text-[#85889E] leading-5">
            Las <span className="text-white font-semibold">zero-knowledge proofs</span> permiten demostrar
            matemáticamente que una afirmación es verdadera <span className="text-white font-semibold">sin revelar
            los datos que la respaldan</span>. Un banco puede verificar que sos elegible para crédito
            sin ver tus transacciones.
          </p>
        </div>

        {/* Claims */}
        <section className="rounded-xl bg-[#161825] border border-white/10 p-5 mb-4">
          <h2 className="text-sm font-semibold text-white mb-1">¿Qué querés probar?</h2>
          <p className="text-xs text-[#85889E] mb-4">
            Los claims en <span className="text-green-400">verde</span> los cumplís según tu historial real.
          </p>

          {loadingClaims ? (
            <div className="flex items-center justify-center gap-2 py-6 text-[#85889E]">
              <RefreshCw className="h-4 w-4 animate-spin" /> Cargando tu historial...
            </div>
          ) : (
            <div className="space-y-3">
              {claims.map((c) => {
                const sel = seleccionados.includes(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => toggle(c.id)}
                    className={`w-full flex items-center gap-3 rounded-lg border p-4 text-left transition ${
                      sel
                        ? c.cumple
                          ? 'border-green-500/50 bg-green-500/10'
                          : 'border-red-500/50 bg-red-500/10'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    {sel
                      ? <Lock className={`h-5 w-5 shrink-0 ${c.cumple ? 'text-green-400' : 'text-red-400'}`} />
                      : <Unlock className="h-5 w-5 text-[#85889E] shrink-0" />}
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{c.label}</p>
                      <p className="text-xs text-[#85889E]">{c.descripcion}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      c.cumple ? 'bg-green-500/20 text-green-400' : 'bg-[#1F2937] text-[#85889E]'
                    }`}>
                      {c.cumple ? 'Cumple' : 'No cumple'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Progreso de generación */}
        {proofState !== 'idle' && (
          <section className="rounded-xl bg-[#161825] border border-white/10 p-5 mb-4">
            <h2 className="text-sm font-semibold text-white mb-4">Generando prueba ZK</h2>
            <div className="space-y-3">
              {PASOS.map((p, i) => {
                const hecho = proofState === 'listo' || i < pasoActual;
                const activo = i === pasoActual && proofState !== 'listo';
                return (
                  <div key={p.key} className="flex items-start gap-3">
                    {hecho
                      ? <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 shrink-0" />
                      : <div className={`h-5 w-5 rounded-full border-2 mt-0.5 shrink-0 ${activo ? 'border-[#5346F6] animate-pulse' : 'border-[#85889E]'}`} />
                    }
                    <div>
                      <p className={`text-sm font-semibold ${hecho ? 'text-white' : activo ? 'text-[#5346F6]' : 'text-[#85889E]'}`}>{p.label}</p>
                      <p className="text-xs text-[#85889E]">{p.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {proofState === 'listo' && (
              <>
                {nocumplidas.length > 0 && (
                  <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/30 p-3">
                    <p className="text-xs font-bold text-red-400 mb-1">⚠ Claims no verificables</p>
                    {nocumplidas.map((c) => (
                      <p key={c.id} className="text-xs text-[#85889E]">· {c.label}</p>
                    ))}
                  </div>
                )}

                {cumplidas.length > 0 && (
                  <div className="mt-3 rounded-lg bg-green-400/10 border border-green-400/30 p-3">
                    <p className="text-xs font-bold text-green-400 mb-2">✓ Prueba ZK generada y verificada on-chain</p>
                    <p className="text-xs text-[#85889E] mb-3">
                      {cumplidas.length} claim{cumplidas.length > 1 ? 's' : ''} confirmado{cumplidas.length > 1 ? 's' : ''}. Ninguna transacción fue revelada al verificador.
                    </p>
                    <div className="flex items-center gap-2 rounded-md bg-[#0E0F19] px-3 py-2">
                      <code className="flex-1 text-xs text-[#85889E] truncate">{proofHash}</code>
                      <button onClick={copiar} className="text-[#5346F6] hover:text-white transition">
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {copied && <p className="text-xs text-green-400 mt-1">¡Copiado!</p>}
                  </div>
                )}
              </>
            )}
          </section>
        )}

        <button
          onClick={generarPrueba}
          disabled={!seleccionados.length || proofState === 'generando' || proofState === 'verificando'}
          className="w-full rounded-xl bg-[#5346F6] py-4 text-sm font-bold text-white transition hover:bg-[#6357f8] disabled:opacity-40"
        >
          {proofState === 'listo' ? 'Generar nueva prueba' : proofState === 'idle' ? 'Generar prueba ZK' : 'Procesando...'}
        </button>

        <p className="mt-3 text-center text-xs text-[#85889E]">
          La prueba ZK se genera localmente en tu dispositivo. Tus datos nunca salen sin cifrar.
        </p>
      </div>
    </div>
  );
}

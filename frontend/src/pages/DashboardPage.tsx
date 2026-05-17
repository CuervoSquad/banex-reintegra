import {
  ArrowUpRight,
  Bot,
  BriefcaseBusiness,
  FileSpreadsheet,
  Flame,
  Gem,
  Globe2,
  Layers3,
  LogOut,
  Map,
  MoreHorizontal,
  ScrollText,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Split,
  Store,
  SunMedium,
  HeartPulse,
  Coins,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { scoreService, type BanexScore } from '../services/scoreService';

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
function fmt(n: number) {
  return `Bs ${n.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const paths = [
  {
    label: 'Camino A',
    title: 'Conservador',
    text: 'MVP + automatización de cashback',
    revenue: '$0.6M',
    icon: Split,
  },
  {
    label: 'Camino B',
    title: 'Innovador',
    text: 'MVP + 12 iniciativas de IA',
    revenue: '$5M',
    icon: SunMedium,
  },
  {
    label: 'Camino C',
    title: 'Audaz',
    text: 'BANEXCOIN - infraestructura LATAM',
    revenue: '$50M+',
    icon: Flame,
    selected: true,
  },
];

const bets = [
  { title: 'Stream',             text: 'Cashback en tiempo real, segundo a segundo', icon: SlidersHorizontal, href: '/stream-cashback' },
  { title: 'Adelanto',           text: 'Cashback futuro como colateral',             icon: Gem,               href: '/adelanto' },
  { title: 'Protocolo',          text: 'Infraestructura B2B2C abierta',              icon: Globe2,            href: '/protocolo' },
  { title: 'Tesorería autónoma', text: 'Agente IA gestiona reservas 24/7',           icon: Bot,               href: '/tesoreria' },
  { title: 'BanexScore',         text: 'Reputación financiera portable',             icon: BriefcaseBusiness, href: '/banexscore' },
  { title: 'ZK Privacidad',      text: 'Pruebas sin revelar transacciones',          icon: ShieldCheck,       href: '/zk-privacidad' },
  { title: 'Agente boliviano',   text: 'Soporte multimodal 24/7',                    icon: Search,            href: '/agente-boliviano' },
  { title: 'Merchant economy',   text: 'Tokens de comercio + marketplace',           icon: Store,             href: '/merchant-economy' },
  { title: 'LATAM Protocol',     text: 'Expansión cripto-nativa a 5 países',         icon: Map,               href: '/latam-protocol' },
  { title: 'Wellness coach',     text: 'Coach financiero IA gratis',                 icon: HeartPulse,        href: '/wellness-coach' },
];

const operations = [
  {
    title: 'Cargar transacciones',
    text: 'Subir CSV o Excel mensual de pagos QR',
    icon: FileSpreadsheet,
    href: '/upload',
  },
  {
    title: 'Configurar niveles',
    text: 'Editar rangos y porcentajes de reintegro',
    icon: Layers3,
    href: '/levels',
  },
  {
    title: 'Reportes',
    text: 'Generar y exportar archivos BanexTransfer',
    icon: ScrollText,
    href: '/reports',
  },
];

const northStar = [
  { label: 'Usuarios activos', value: '1M+', note: 'vs ~10K hoy' },
  { label: 'Volumen QR/mes', value: '$100M+', note: 'multiplicador 100x' },
  { label: 'Países', value: '5', note: 'Bolivia -> LATAM' },
  { label: 'Clientes B2B', value: '50+', note: 'en el protocolo' },
  { label: 'Revenue anual', value: '$50M+', note: 'vs $0 hoy' },
];

export default function DashboardPage() {
  const { logout } = useAuth();
  const [score, setScore] = useState<BanexScore | null>(null);
  const [scoreLoading, setScoreLoading] = useState(true);

  useEffect(() => {
    scoreService.get().then(setScore).finally(() => setScoreLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0E0F19] text-white">
      <main className="mx-auto min-h-screen w-full max-w-[760px] px-4 pb-32 pt-0 sm:px-6">
        <header className="relative flex flex-col items-center text-center">
          <button
            type="button"
            onClick={logout}
            className="absolute right-10 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#161825] text-[#85889E] transition hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Cerrar sesión</span>
          </button>

          <button
            type="button"
            className="absolute right-0 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#161825] text-[#85889E]"
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className="sr-only">Más opciones</span>
          </button>

          <h1 className="mt-4 text-3xl font-semibold tracking-wide text-white">BANEXCOIN</h1>
          <p className="mt-3 font-serif text-lg italic text-[#85889E]">
            De sistema de cashback a infraestructura cripto-financiera de LATAM
          </p>
        </header>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-white">Operación de reintegros</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {operations.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  to={item.href}
                  className="rounded-lg border border-white/10 bg-[#161825] p-4 transition hover:border-[#FF8C00] hover:bg-[#FF8C00]/10"
                >
                  <div className="flex items-center justify-between gap-3">
                    <Icon className="h-5 w-5 text-[#FF8C00]" />
                    <ArrowUpRight className="h-4 w-4 text-[#85889E]" />
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-white">{item.title}</h3>
                  <p className="mt-1 text-sm leading-5 text-[#85889E]">{item.text}</p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── Tu perfil financiero ───────────────────────────────────────── */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-white">Tu perfil financiero</h2>
          <p className="mt-1 text-sm text-[#85889E]">Calculado desde tus pagos QR reales · sin banco · sin historial tradicional</p>

          {scoreLoading ? (
            <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#161825] py-10 text-[#85889E]">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm">Calculando tu score...</span>
            </div>
          ) : score ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">

              {/* BanexScore card */}
              <Link to="/banexscore" className="group rounded-xl border border-white/10 bg-[#161825] p-5 transition hover:border-[#FF8C00]/60 hover:bg-[#FF8C00]/5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BriefcaseBusiness className="h-5 w-5 text-[#FF8C00]" />
                    <span className="text-sm font-semibold text-white">BanexScore</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-[#85889E] transition group-hover:text-[#FF8C00]" />
                </div>

                <div className="flex items-end gap-4">
                  <div>
                    <p className="text-5xl font-bold text-white">{score.score}</p>
                    <p className="text-xs text-[#85889E] mt-1">de 1000</p>
                  </div>
                  <div className="mb-1">
                    <span className="inline-block rounded-full px-2 py-0.5 text-xs font-bold"
                      style={{ color: scoreColor(score.score), backgroundColor: `${scoreColor(score.score)}20` }}>
                      {scoreLabel(score.score)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 h-1.5 rounded-full bg-white/10">
                  <div className="h-1.5 rounded-full transition-all duration-700"
                    style={{ width: `${score.score / 10}%`, backgroundColor: scoreColor(score.score) }} />
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-[#85889E]">Pagos QR</p>
                    <p className="text-sm font-bold text-white">{score.total_streams}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#85889E]">Comercios</p>
                    <p className="text-sm font-bold text-white">{score.comercios_unicos}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#85889E]">Consumido</p>
                    <p className="text-sm font-bold text-white">{fmt(score.total_bs)}</p>
                  </div>
                </div>

                {score.credit.elegible && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-2">
                    <Coins className="h-4 w-4 text-green-400 shrink-0" />
                    <p className="text-xs text-green-400 font-semibold">
                      Microcrédito disponible · {fmt(score.credit.limite_bs)} al {score.credit.tasa_anual_pct}% anual
                    </p>
                  </div>
                )}
              </Link>

              {/* ZK Privacidad card */}
              <Link to="/zk-privacidad" className="group rounded-xl border border-white/10 bg-[#161825] p-5 transition hover:border-[#5346F6]/60 hover:bg-[#5346F6]/5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-[#5346F6]" />
                    <span className="text-sm font-semibold text-white">ZK Privacidad</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-[#85889E] transition group-hover:text-[#5346F6]" />
                </div>

                <p className="text-xs text-[#85889E] mb-4 leading-5">
                  Probá quién sos sin revelar tus transacciones. Usá tus pagos QR como identidad financiera.
                </p>

                <div className="space-y-2">
                  {score.zk_claims.map((c) => (
                    <div key={c.id} className="flex items-center gap-2 rounded-lg bg-[#0E0F19] px-3 py-2">
                      <span className={`text-base ${c.cumple ? 'text-green-400' : 'text-[#3D3E52]'}`}>
                        {c.cumple ? '✓' : '○'}
                      </span>
                      <p className={`text-xs ${c.cumple ? 'text-white' : 'text-[#85889E]'}`}>{c.label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-lg bg-[#5346F6]/10 border border-[#5346F6]/20 px-3 py-2 text-center">
                  <p className="text-xs font-semibold text-[#5346F6]">
                    {score.zk_claims.filter(c => c.cumple).length} de {score.zk_claims.length} claims disponibles
                  </p>
                </div>
              </Link>

            </div>
          ) : null}
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-white">Tres caminos. Tres futuros.</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {paths.map((path) => {
              const Icon = path.icon;
              return (
                <article
                  key={path.label}
                  className={`relative rounded-lg border bg-[#161825] p-5 ${
                    path.selected ? 'border-[#5346F6]' : 'border-white/10'
                  }`}
                >
                  {path.selected && (
                    <span className="absolute -top-2 right-3 rounded-md bg-[#5346F6] px-3 py-1 text-xs text-white">
                      Este documento
                    </span>
                  )}
                  <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#85889E]">
                    <Icon className={`h-5 w-5 ${path.selected ? 'text-[#FF8C00]' : 'text-[#F38118]'}`} />
                    {path.label}
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-white">{path.title}</h3>
                  <p className="mt-1 min-h-10 text-sm leading-5 text-[#85889E]">{path.text}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-[#85889E]">
                    <span>Revenue 2030</span>
                    <span className={path.selected ? 'font-semibold text-[#FF8C00]' : 'font-semibold text-white'}>
                      {path.revenue}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-white">Las 10 macro-apuestas</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {bets.map((bet, index) => {
              const Icon = bet.icon;
              const content = (
                <>
                  <div className="flex items-center gap-3">
                    <Icon className={bet.href ? 'h-5 w-5 text-[#FF8C00]' : 'h-5 w-5 text-white'} />
                    <span className="text-xs text-[#85889E]">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-white">{bet.title}</h3>
                    {bet.href && <ArrowUpRight className="h-4 w-4 text-[#FF8C00]" />}
                  </div>
                  <p className="mt-1 text-sm leading-5 text-[#85889E]">{bet.text}</p>
                </>
              );

              return bet.href ? (
                <Link
                  key={bet.title}
                  to={bet.href}
                  className="rounded-lg border border-[#FF8C00]/45 bg-[#161825] p-4 transition hover:border-[#FF8C00] hover:bg-[#FF8C00]/10"
                >
                  {content}
                </Link>
              ) : (
                <article key={bet.title} className="rounded-lg bg-[#161825] p-4">
                  {content}
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-6">
          <h2 className="text-lg font-semibold text-white">North Star 2030</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
            {northStar.map((item) => (
              <article key={item.label} className="rounded-lg bg-[#161825] p-4">
                <p className="text-sm leading-5 text-[#85889E]">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
                <p className="mt-1 text-xs text-[#85889E]">{item.note}</p>
              </article>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}

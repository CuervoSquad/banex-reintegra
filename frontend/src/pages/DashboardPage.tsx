import {
  ArrowUpRight,
  Bot,
  BriefcaseBusiness,
  Flame,
  Gem,
  Globe2,
  LogOut,
  Map,
  MessageCircle,
  Mic,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Split,
  Store,
  SunMedium,
  Waves,
  HeartPulse,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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
    text: 'BANEX OS - infraestructura LATAM',
    revenue: '$50M+',
    icon: Flame,
    selected: true,
  },
];

const bets = [
  {
    title: 'Stream',
    text: 'Cashback en tiempo real, segundo a segundo',
    icon: SlidersHorizontal,
    href: '/stream-cashback',
  },
  { title: 'Adelanto', text: 'Cashback futuro como colateral', icon: Gem },
  { title: 'Protocolo', text: 'Infraestructura B2B2C abierta', icon: Globe2 },
  { title: 'Tesorería autónoma', text: 'Agente IA gestiona reservas 24/7', icon: Bot },
  { title: 'BanexScore', text: 'Reputación financiera portable', icon: BriefcaseBusiness },
  { title: 'ZK Privacidad', text: 'Pruebas sin revelar transacciones', icon: ShieldCheck },
  { title: 'Agente boliviano', text: 'Soporte multimodal 24/7', icon: Search },
  { title: 'Merchant economy', text: 'Tokens de comercio + marketplace', icon: Store },
  { title: 'LATAM Protocol', text: 'Expansión cripto-nativa a 5 países', icon: Map },
  { title: 'Wellness coach', text: 'Coach financiero IA gratis', icon: HeartPulse },
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

          <h1 className="mt-4 text-3xl font-semibold tracking-wide text-white">BANEX OS</h1>
          <p className="mt-3 font-serif text-lg italic text-[#85889E]">
            De sistema de cashback a infraestructura cripto-financiera de LATAM
          </p>
        </header>

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

        <section className="mt-8 rounded-lg border border-white/10 bg-[#161825] px-6 py-6">
          <p className="font-serif text-xl font-semibold italic text-white">
            "El cashback no es el producto. Es el caballo de Troya."
          </p>
          <p className="mt-4 text-sm leading-6 text-[#85889E]">
            La pregunta para Banexcoin no es si esto va a ocurrir en LATAM. Es{' '}
            <span className="font-semibold text-white">quién lo va a hacer.</span> Tienes 24-36
            meses de ventana regulatoria.
          </p>
        </section>


      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[760px] px-4 pb-4 sm:px-6">
        <div className="rounded-t-3xl border border-white/10 bg-[#161825]/95 px-5 py-4 shadow-[0_-18px_50px_rgba(0,0,0,0.35)] backdrop-blur">
          <div className="text-base text-[#85889E]">Escribe un mensaje...</div>
          <div className="mt-5 flex items-center justify-between">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#85889E] transition hover:bg-white/10"
            >
              <Plus className="h-5 w-5" />
              <span className="sr-only">Agregar</span>
            </button>
            <div className="flex items-center gap-3 text-sm text-[#85889E]">
              <span>Opus 4.7 Adaptativo</span>
              <Waves className="h-4 w-4 text-[#FF8C00]" />
              <Mic className="h-5 w-5" />
              <MessageCircle className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ label, href }: { label: string; href?: string }) {
  const className =
    'inline-flex items-center justify-between rounded-lg border border-white/10 bg-[#161825] px-4 py-3 text-sm font-medium text-white transition hover:border-[#5346F6]';

  if (href) {
    return (
      <Link to={href} className={className}>
        {label}
        <ArrowUpRight className="h-4 w-4" />
      </Link>
    );
  }

  return (
    <button type="button" className={className}>
      {label}
      <ArrowUpRight className="h-4 w-4" />
    </button>
  );
}

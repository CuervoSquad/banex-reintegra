import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe2, ChevronDown, ChevronUp } from 'lucide-react';

const partners = [
  { name: 'TigoMoney', categoria: 'Wallet', volumen: 4200000, txs: 18400, fee: 0.0008 },
  { name: 'BNB Comercio', categoria: 'Retail', volumen: 2800000, txs: 9200, fee: 0.001 },
  { name: 'FarmaPlus', categoria: 'Salud', volumen: 1500000, txs: 6800, fee: 0.0012 },
  { name: 'FinanBolivia', categoria: 'Finanzas', volumen: 3900000, txs: 4100, fee: 0.0015 },
  { name: 'MultiRed', categoria: 'Retail', volumen: 980000, txs: 12600, fee: 0.001 },
];

const RATE = 6.9;

const snippet = `POST https://api.banexcoin.com/v1/cashback/stream
Authorization: Bearer {API_KEY}

{
  "user_id": "usr_A7k29Lm",
  "amount_bs": 250.00,
  "merchant_id": "mer_TigoMoney",
  "qr_ref": "QR-2024-08-004521"
}

// Response 200 OK
{
  "cashback_usdt": 0.0362,
  "cashback_bs": 0.25,
  "level": "Nivel 2",
  "stream_id": "stm_9Xp12Qr"
}`;

export default function ProtocoloPage() {
  const navigate = useNavigate();
  const [expandido, setExpandido] = useState<string | null>(null);

  const revenueTotal = partners.reduce((s, p) => s + p.volumen * p.fee, 0);
  const revenueTotalUsdt = revenueTotal / RATE;

  return (
    <div className="min-h-screen bg-[#0E0F19] text-white">
      <div className="mx-auto max-w-[760px] px-4 py-6 sm:px-6">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm text-[#85889E] hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Volver
        </button>

        <header className="flex items-center gap-4 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF8C00]/15">
            <Globe2 className="h-6 w-6 text-[#FF8C00]" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Protocolo B2B2C</h1>
            <p className="text-sm text-[#85889E]">Infraestructura abierta para que cualquier empresa ofrezca cashback</p>
          </div>
        </header>

        <section className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Partners activos', value: partners.length },
            { label: 'Revenue total Bs', value: revenueTotal.toLocaleString('es-BO', { maximumFractionDigits: 0 }) },
            { label: 'Revenue USDT', value: revenueTotalUsdt.toFixed(2) },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-[#161825] border border-white/10 p-4">
              <p className="text-xs text-[#85889E]">{s.label}</p>
              <p className="mt-1 text-xl font-bold text-[#FF8C00]">{s.value}</p>
            </div>
          ))}
        </section>

        <section className="rounded-xl bg-[#161825] border border-white/10 p-5 mb-4">
          <h2 className="text-sm font-semibold text-white mb-3">Partners B2B</h2>
          <div className="space-y-2">
            {partners.map((p) => {
              const rev = p.volumen * p.fee;
              const open = expandido === p.name;
              return (
                <div key={p.name} className="rounded-lg border border-white/10 overflow-hidden">
                  <button onClick={() => setExpandido(open ? null : p.name)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-white">{p.name}</span>
                      <span className="text-xs text-[#5346F6] bg-[#5346F6]/15 px-2 py-0.5 rounded-full">{p.categoria}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-[#FF8C00]">{rev.toFixed(0)} Bs fee</span>
                      {open ? <ChevronUp className="h-4 w-4 text-[#85889E]" /> : <ChevronDown className="h-4 w-4 text-[#85889E]" />}
                    </div>
                  </button>
                  {open && (
                    <div className="px-4 pb-4 grid grid-cols-3 gap-3">
                      {[
                        { l: 'Volumen', v: `${(p.volumen / 1000).toFixed(0)}K Bs` },
                        { l: 'Transacciones', v: p.txs.toLocaleString() },
                        { l: 'Fee %', v: `${(p.fee * 100).toFixed(2)}%` },
                      ].map((d) => (
                        <div key={d.l} className="rounded-lg bg-[#0E0F19] p-3">
                          <p className="text-xs text-[#85889E]">{d.l}</p>
                          <p className="text-sm font-semibold text-white">{d.v}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-xl bg-[#0E0F19] border border-[#5346F6]/30 p-5">
          <h2 className="text-sm font-semibold text-[#5346F6] mb-3">API simulada</h2>
          <pre className="text-xs text-[#85889E] whitespace-pre-wrap font-mono leading-5">{snippet}</pre>
        </section>
      </div>
    </div>
  );
}

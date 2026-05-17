import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Store } from 'lucide-react';

const categorias = ['Todos', 'Supermercado', 'Restaurante', 'Farmacia', 'Tecnología', 'Ropa'];

const comercios = [
  { nombre: 'Ketal', categoria: 'Supermercado', vol: 480000, txs: 2140, cashback: 4800 },
  { nombre: 'Hipermaxi', categoria: 'Supermercado', vol: 620000, txs: 3100, cashback: 6200 },
  { nombre: 'Burger King', categoria: 'Restaurante', vol: 180000, txs: 4200, cashback: 1800 },
  { nombre: 'Pizza Hut', categoria: 'Restaurante', vol: 140000, txs: 3600, cashback: 1400 },
  { nombre: 'FarmaBolivia', categoria: 'Farmacia', vol: 95000, txs: 1800, cashback: 950 },
  { nombre: 'Inti Farma', categoria: 'Farmacia', vol: 72000, txs: 1400, cashback: 720 },
  { nombre: 'iCenter', categoria: 'Tecnología', vol: 310000, txs: 820, cashback: 3100 },
  { nombre: 'Mundo Digital', categoria: 'Tecnología', vol: 210000, txs: 640, cashback: 2100 },
  { nombre: 'Mango', categoria: 'Ropa', vol: 130000, txs: 980, cashback: 1300 },
  { nombre: 'H&M Bolivia', categoria: 'Ropa', vol: 165000, txs: 1100, cashback: 1650 },
];

export default function MerchantPage() {
  const navigate = useNavigate();
  const [cat, setCat] = useState('Todos');

  const filtrados = cat === 'Todos' ? comercios : comercios.filter((c) => c.categoria === cat);
  const totalVol = filtrados.reduce((s, c) => s + c.vol, 0);
  const totalTxs = filtrados.reduce((s, c) => s + c.txs, 0);
  const totalCashback = filtrados.reduce((s, c) => s + c.cashback, 0);

  return (
    <div className="min-h-screen bg-[#0E0F19] text-white">
      <div className="mx-auto max-w-[760px] px-4 py-6 sm:px-6">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm text-[#85889E] hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Volver
        </button>

        <header className="flex items-center gap-4 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF8C00]/15">
            <Store className="h-6 w-6 text-[#FF8C00]" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Merchant Economy</h1>
            <p className="text-sm text-[#85889E]">Tokens de comercio + marketplace de cashback</p>
          </div>
        </header>

        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Vol. total Bs', value: `${(totalVol / 1000).toFixed(0)}K` },
            { label: 'Transacciones', value: totalTxs.toLocaleString() },
            { label: 'Cashback Bs', value: `${(totalCashback / 1000).toFixed(1)}K` },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-[#161825] border border-white/10 p-4">
              <p className="text-xs text-[#85889E]">{s.label}</p>
              <p className="mt-1 text-xl font-bold text-[#FF8C00]">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {categorias.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs transition ${cat === c ? 'border-[#FF8C00] bg-[#FF8C00]/10 text-white' : 'border-white/10 text-[#85889E] hover:border-white/30'}`}>
              {c}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filtrados.map((c) => (
            <div key={c.nombre} className="rounded-xl bg-[#161825] border border-white/10 p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">{c.nombre}</p>
                <p className="text-xs text-[#5346F6] mt-0.5">{c.categoria}</p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-right">
                <div>
                  <p className="text-xs text-[#85889E]">Volumen</p>
                  <p className="text-sm font-semibold text-white">{(c.vol / 1000).toFixed(0)}K Bs</p>
                </div>
                <div>
                  <p className="text-xs text-[#85889E]">Txs</p>
                  <p className="text-sm font-semibold text-white">{c.txs.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-[#85889E]">Cashback</p>
                  <p className="text-sm font-semibold text-[#FF8C00]">{c.cashback.toLocaleString()} Bs</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

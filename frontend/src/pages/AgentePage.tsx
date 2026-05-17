import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Send } from 'lucide-react';

type Msg = { de: 'user' | 'bot'; texto: string };

const respuestas: Record<string, string> = {
  'cashback': '¡Hola! Tienes 14.82 Bs acumulados este mes, equivalente a 2.1478 USDT. Tu nivel actual es Nivel 2 (1.5%). ¿Quieres reclamarlo ahora?',
  'adelanto': 'Puedo adelantarte hasta el 70% de tu cashback estimado del mes. Eso sería aproximadamente 48.50 Bs (7.03 USDT), con una tarifa del 3%. ¿Te interesa proceder?',
  'gasto': 'Tus 3 categorías con más gasto este mes son:\n1. Supermercados — 1.240 Bs\n2. Restaurantes — 680 Bs\n3. Farmacia — 310 Bs\n\nEl 78% de tus pagos son QR. ¡Muy bien!',
  'score': 'Tu BanexScore actual es 640/1000 (nivel medio). Para subir al nivel alto necesitas:\n✓ 3 meses más de consistencia\n✓ Aumentar volumen QR a 3.000 Bs/mes\n✓ Diversificar a 5+ comercios',
  'nivel': 'Estás en Nivel 2: 1.000 – 2.999 Bs/mes con 1.5% de cashback. Para alcanzar Nivel 3 (2%) te faltan 842 Bs este mes.',
  'default': 'Entiendo tu consulta. Puedo ayudarte con:\n• Tu cashback acumulado\n• Solicitar un adelanto\n• Ver en qué gastas más\n• Conocer tu BanexScore\n\n¿Qué necesitas?',
};

const sugerencias = ['¿cuánto cashback tengo?', 'quiero un adelanto', '¿en qué gasto más?', '¿cómo está mi score?'];

function obtenerRespuesta(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('cashback') || m.includes('acumulad') || m.includes('cuánto')) return respuestas.cashback;
  if (m.includes('adelanto') || m.includes('anticipo')) return respuestas.adelanto;
  if (m.includes('gasto') || m.includes('gastar') || m.includes('gast')) return respuestas.gasto;
  if (m.includes('score') || m.includes('puntaje')) return respuestas.score;
  if (m.includes('nivel')) return respuestas.nivel;
  return respuestas.default;
}

export default function AgentePage() {
  const navigate = useNavigate();
  const [mensajes, setMensajes] = useState<Msg[]>([
    { de: 'bot', texto: '¡Hola! Soy tu agente boliviano BANEX 🇧🇴 ¿En qué te ayudo hoy?' },
  ]);
  const [input, setInput] = useState('');
  const [escribiendo, setEscribiendo] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [mensajes, escribiendo]);

  function enviar(texto: string) {
    if (!texto.trim() || escribiendo) return;
    const nuevo: Msg = { de: 'user', texto };
    setMensajes((m) => [...m, nuevo]);
    setInput('');
    setEscribiendo(true);
    setTimeout(() => {
      setMensajes((m) => [...m, { de: 'bot', texto: obtenerRespuesta(texto) }]);
      setEscribiendo(false);
    }, 900);
  }

  return (
    <div className="min-h-screen bg-[#0E0F19] text-white flex flex-col">
      <div className="mx-auto w-full max-w-[760px] px-4 pt-6 sm:px-6">
        <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2 text-sm text-[#85889E] hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Volver
        </button>
        <header className="flex items-center gap-4 mb-4 pb-4 border-b border-white/10">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF8C00]">
            <Search className="h-5 w-5 text-[#0E0F19]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Agente boliviano</h1>
            <p className="text-xs text-green-400">● En línea</p>
          </div>
        </header>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4 mx-auto w-full max-w-[760px]">
        <div className="space-y-3 py-2">
          {mensajes.map((m, i) => (
            <div key={i} className={`flex ${m.de === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-5 whitespace-pre-line ${
                m.de === 'user' ? 'rounded-br-sm bg-[#5346F6] text-white' : 'rounded-bl-sm bg-[#161825] text-[#D1D5DB]'
              }`}>{m.texto}</div>
            </div>
          ))}
          {escribiendo && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-sm bg-[#161825] px-4 py-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => <div key={i} className="h-2 w-2 rounded-full bg-[#85889E] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          {sugerencias.map((s) => (
            <button key={s} onClick={() => enviar(s)}
              className="rounded-full border border-white/10 bg-[#161825] px-3 py-1.5 text-xs text-[#85889E] hover:border-[#FF8C00] hover:text-white transition">
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="sticky bottom-0 bg-[#0E0F19] border-t border-white/10 px-4 py-3 mx-auto w-full max-w-[760px]">
        <div className="flex items-center gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && enviar(input)}
            placeholder="Escribe tu consulta..."
            className="flex-1 rounded-xl bg-[#161825] border border-white/10 px-4 py-2.5 text-sm text-white placeholder-[#85889E] outline-none focus:border-[#FF8C00]" />
          <button onClick={() => enviar(input)} disabled={!input.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF8C00] text-[#0E0F19] transition hover:bg-[#F38118] disabled:opacity-40">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

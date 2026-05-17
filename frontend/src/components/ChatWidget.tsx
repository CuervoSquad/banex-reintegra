import { useEffect, useRef, useState } from 'react';
import { Bot, Send, X, Loader2 } from 'lucide-react';
import { chatService, type ChatMessage } from '../services/chatService';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const updated: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const reply = await chatService.send(updated);
      setMessages([...updated, { role: 'assistant', content: reply }]);
    } catch {
      setMessages([...updated, { role: 'assistant', content: 'Error al contactar la IA. Intenta de nuevo.' }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <>
      {/* Botón flotante */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#5346F6] shadow-[0_0_20px_rgba(83,70,246,0.6)] transition hover:scale-110 hover:bg-[#6357f8]"
        aria-label="Abrir chat IA"
      >
        {open ? <X className="h-6 w-6 text-white" /> : <Bot className="h-7 w-7 text-white" />}
      </button>

      {/* Ventana de chat */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex w-[340px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#161825] shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
          {/* Header */}
          <div className="flex items-center gap-3 bg-[#5346F6] px-4 py-3">
            <Bot className="h-5 w-5 text-white" />
            <div>
              <p className="text-sm font-semibold text-white">Asistente BANEX</p>
              <p className="text-xs text-indigo-200">Powered by DeepSeek</p>
            </div>
          </div>

          {/* Mensajes */}
          <div className="flex max-h-[380px] min-h-[200px] flex-col gap-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <p className="text-center text-xs text-[#85889E]">
                Pregúntame sobre cashback, reintegros o la estrategia BANEX OS.
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-5 ${
                  m.role === 'user'
                    ? 'ml-auto rounded-br-sm bg-[#5346F6] text-white'
                    : 'rounded-bl-sm bg-[#0E0F19] text-[#D1D5DB]'
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="flex w-fit items-center gap-2 rounded-2xl rounded-bl-sm bg-[#0E0F19] px-3 py-2 text-sm text-[#85889E]">
                <Loader2 className="h-4 w-4 animate-spin" />
                Pensando...
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex items-end gap-2 border-t border-white/10 p-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Escribe un mensaje..."
              rows={1}
              className="flex-1 resize-none rounded-xl bg-[#0E0F19] px-3 py-2 text-sm text-white placeholder-[#85889E] outline-none"
            />
            <button
              type="button"
              onClick={send}
              disabled={!input.trim() || loading}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#5346F6] text-white transition disabled:opacity-40 hover:bg-[#6357f8]"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

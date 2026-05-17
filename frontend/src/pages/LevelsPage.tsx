import { useEffect, useState } from 'react';
import { ArrowLeft, Pencil, Save, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { levelService, type CashbackLevel } from '../services/uploadService';

export default function LevelsPage() {
  const [levels, setLevels] = useState<CashbackLevel[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState<Partial<CashbackLevel>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    levelService.list().then(setLevels).catch(() => {});
  }, []);

  function startEdit(level: CashbackLevel) {
    setEditing(level.id);
    setDraft({ ...level });
    setError(null);
  }

  function cancel() {
    setEditing(null);
    setDraft({});
  }

  async function save(id: number) {
    setSaving(true);
    setError(null);
    try {
      const updated = await levelService.update(id, {
        name: draft.name,
        min_amount_bs: draft.min_amount_bs,
        max_amount_bs: draft.max_amount_bs ?? undefined,
        percentage: draft.percentage,
        is_active: draft.is_active,
      });
      setLevels((prev) => prev.map((l) => (l.id === id ? updated : l)));
      setEditing(null);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0E0F19] text-white">
      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
        <header className="mb-6 flex items-center gap-4">
          <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#161825] px-3 py-2 text-sm text-[#85889E] hover:text-white transition">
            <ArrowLeft className="h-4 w-4" /> BANEXCOIN
          </Link>
          <h1 className="text-xl font-semibold">Configuración de niveles</h1>
        </header>

        <p className="mb-5 text-sm text-[#85889E]">
          Define los rangos de consumo mensual en Bs. y el porcentaje de reintegro correspondiente a cada nivel.
        </p>

        {error && <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>}

        <div className="space-y-3">
          {levels.map((level) => (
            <div key={level.id} className={`rounded-lg border bg-[#161825] p-5 transition ${!level.is_active ? 'border-white/5 opacity-50' : 'border-white/10'}`}>
              {editing === level.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div>
                      <label className="block text-xs text-[#85889E] mb-1">Nombre</label>
                      <input value={draft.name ?? ''} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-[#0E0F19] px-3 py-2 text-sm text-white" />
                    </div>
                    <div>
                      <label className="block text-xs text-[#85889E] mb-1">Mínimo Bs.</label>
                      <input type="number" value={String(draft.min_amount_bs ?? '')} onChange={(e) => setDraft((d) => ({ ...d, min_amount_bs: e.target.value as unknown as string }))} className="w-full rounded-lg border border-white/10 bg-[#0E0F19] px-3 py-2 text-sm text-white" />
                    </div>
                    <div>
                      <label className="block text-xs text-[#85889E] mb-1">Máximo Bs. (vacío = sin límite)</label>
                      <input type="number" value={draft.max_amount_bs ?? ''} onChange={(e) => setDraft((d) => ({ ...d, max_amount_bs: e.target.value || null }))} className="w-full rounded-lg border border-white/10 bg-[#0E0F19] px-3 py-2 text-sm text-white" placeholder="∞" />
                    </div>
                    <div>
                      <label className="block text-xs text-[#85889E] mb-1">% reintegro (0-100)</label>
                      <input type="number" step="0.01" value={Number(draft.percentage ?? 0) * 100} onChange={(e) => setDraft((d) => ({ ...d, percentage: String(Number(e.target.value) / 100) }))} className="w-full rounded-lg border border-white/10 bg-[#0E0F19] px-3 py-2 text-sm text-white" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-[#85889E] cursor-pointer">
                      <input type="checkbox" checked={draft.is_active ?? true} onChange={(e) => setDraft((d) => ({ ...d, is_active: e.target.checked }))} className="rounded" />
                      Activo
                    </label>
                    <div className="ml-auto flex gap-2">
                      <button type="button" onClick={cancel} className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-sm text-[#85889E] hover:text-white transition"><X className="h-4 w-4" /> Cancelar</button>
                      <button type="button" onClick={() => save(level.id)} disabled={saving} className="inline-flex items-center gap-1 rounded-lg bg-[#5346F6] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#6257ff] disabled:opacity-50"><Save className="h-4 w-4" /> {saving ? 'Guardando...' : 'Guardar'}</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{level.name}</p>
                    <p className="mt-1 text-sm text-[#85889E]">
                      Bs {Number(level.min_amount_bs).toLocaleString()} – {level.max_amount_bs ? `Bs ${Number(level.max_amount_bs).toLocaleString()}` : '∞'}
                      <span className="ml-3 font-semibold text-[#FF8C00]">{(Number(level.percentage) * 100).toFixed(1)}% reintegro</span>
                    </p>
                  </div>
                  <button type="button" onClick={() => startEdit(level)} className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-sm text-[#85889E] hover:text-white transition">
                    <Pencil className="h-4 w-4" /> Editar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

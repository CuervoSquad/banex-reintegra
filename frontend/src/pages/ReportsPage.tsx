import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Loader2 } from 'lucide-react';
import { reportService, formatPeriod, type MonthlyReport } from '../services/reportService';

export default function ReportsPage() {
  const { sessionId } = useParams<{ sessionId?: string }>();
  const generatedSessionRef = useRef<string | null>(null);
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [selected, setSelected] = useState<MonthlyReport | null>(null);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    reportService.list().then((r) => { setReports(r); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (sessionId && generatedSessionRef.current !== sessionId) {
      generatedSessionRef.current = sessionId;
      void handleGenerate(sessionId);
    }
  }, [sessionId]);

  async function handleGenerate(sid: string) {
    setGenerating(true);
    setError(null);
    try {
      const report = await reportService.generate(sid);
      setReports((prev) => {
        const withoutDuplicate = prev.filter((item) => item.id !== report.id);
        return [report, ...withoutDuplicate];
      });
      setSelected(report);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Error al generar reporte');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0E0F19] text-white">
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <header className="mb-6 flex items-center gap-4">
          <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#161825] px-3 py-2 text-sm text-[#85889E] hover:text-white transition">
            <ArrowLeft className="h-4 w-4" /> BANEXCOIN
          </Link>
          <h1 className="text-xl font-semibold">Reportes de reintegros</h1>
          <Link to="/upload" className="ml-auto text-sm text-[#FF8C00] hover:underline">+ Nueva carga</Link>
        </header>

        {generating && (
          <div className="mb-5 flex items-center gap-3 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-300">
            <Loader2 className="h-4 w-4 animate-spin" /> Generando reporte...
          </div>
        )}
        {error && <p className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>}

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Lista de reportes */}
          <div className="rounded-lg border border-white/10 bg-[#161825] p-4">
            <h2 className="mb-3 text-sm font-semibold text-[#85889E] uppercase tracking-wide">Reportes</h2>
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-[#85889E]" />
            ) : reports.length === 0 ? (
              <p className="text-sm text-[#85889E]">Sin reportes aún.</p>
            ) : (
              <div className="space-y-2">
                {reports.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelected(r)}
                    className={`w-full rounded-lg px-3 py-3 text-left transition ${selected?.id === r.id ? 'bg-[#5346F6]/20 border border-[#5346F6]/50' : 'bg-[#0E0F19] border border-transparent hover:border-white/10'}`}
                  >
                    <p className="text-sm font-semibold text-white">{formatPeriod(r.period_month, r.period_year)}</p>
                    <p className="mt-0.5 text-xs text-[#85889E]">{r.total_users} usuarios · Bs {Number(r.total_reintegro_bs).toLocaleString('es-BO', { minimumFractionDigits: 2 })}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detalle */}
          <div className="rounded-lg border border-white/10 bg-[#161825] p-5">
            {!selected ? (
              <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-[#85889E]">
                <FileText className="h-10 w-10 mb-3" />
                <p className="text-sm">Selecciona un reporte para ver el detalle</p>
              </div>
            ) : (
              <>
                {/* Resumen */}
                <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">{formatPeriod(selected.period_month, selected.period_year)}</h2>
                    <p className="text-sm text-[#85889E]">Tipo de cambio: Bs {Number(selected.exchange_rate).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => reportService.downloadCsv(selected.id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-[#5346F6]/40 bg-[#5346F6]/15 px-3 py-2 text-sm text-white transition hover:bg-[#5346F6]/25"
                    >
                      <Download className="h-4 w-4" /> Reporte CSV
                    </button>
                    <button
                      type="button"
                      onClick={() => reportService.downloadBanexTransfer(selected.id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-[#FF8C00]/40 bg-[#FF8C00]/15 px-3 py-2 text-sm text-[#FF8C00] transition hover:bg-[#FF8C00]/25"
                    >
                      <Download className="h-4 w-4" /> BanexTransfer
                    </button>
                  </div>
                </div>

                {/* KPIs */}
                <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <KpiCard label="Usuarios" value={String(selected.total_users)} />
                  <KpiCard label="Consumo total Bs." value={`Bs ${Number(selected.total_amount_bs).toLocaleString('es-BO', { minimumFractionDigits: 2 })}`} />
                  <KpiCard label="Reintegro USDT" value={`${Number(selected.total_reintegro_usdt).toFixed(4)} USDT`} />
                  <KpiCard label="Reintegro Bs." value={`Bs ${Number(selected.total_reintegro_bs).toLocaleString('es-BO', { minimumFractionDigits: 2 })}`} accent />
                </div>

                {/* Tabla */}
                <div className="overflow-x-auto rounded-lg border border-white/10">
                  <table className="w-full text-sm">
                    <thead className="bg-[#0E0F19] text-xs uppercase text-[#85889E]">
                      <tr>
                        {['Usuario', 'Consumo Bs.', 'Consumo USDT', 'Nivel', '%', 'Reintegro USDT', 'Reintegro Bs.'].map((h) => (
                          <th key={h} className="px-3 py-3 text-left font-semibold tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selected.rows.map((row, i) => (
                        <tr key={row.id} className={i % 2 === 0 ? 'bg-[#161825]' : 'bg-[#0E0F19]'}>
                          <td className="px-3 py-2 font-mono text-xs text-white">{row.user_identifier}</td>
                          <td className="px-3 py-2 text-right">{Number(row.total_amount_bs).toLocaleString('es-BO', { minimumFractionDigits: 2 })}</td>
                          <td className="px-3 py-2 text-right text-[#85889E]">{Number(row.total_amount_usdt).toFixed(4)}</td>
                          <td className="px-3 py-2">{row.level_name ?? <span className="text-[#85889E]">—</span>}</td>
                          <td className="px-3 py-2 text-[#FF8C00]">{row.level_percentage ? `${(Number(row.level_percentage) * 100).toFixed(1)}%` : '—'}</td>
                          <td className="px-3 py-2 text-right font-semibold text-white">{Number(row.reintegro_usdt).toFixed(4)}</td>
                          <td className="px-3 py-2 text-right font-semibold text-[#FF8C00]">{Number(row.reintegro_bs).toLocaleString('es-BO', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function KpiCard({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg bg-[#0E0F19] px-4 py-3">
      <p className="text-xs text-[#85889E]">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${accent ? 'text-[#FF8C00]' : 'text-white'}`}>{value}</p>
    </div>
  );
}

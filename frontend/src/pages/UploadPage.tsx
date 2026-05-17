import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, CheckCircle, Download, FileSpreadsheet, Loader2, Upload, XCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { uploadService, type UploadSession } from '../services/uploadService';

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const CURRENT_YEAR = new Date().getFullYear();
const SAMPLE_CSV = [
  'user_identifier,amount_bs,amount_usdt,exchange_rate,merchant_name,transaction_date',
  'user001,1000,100,10,Comercio A,2026-05-01',
  'user002,2500,250,10,Comercio B,2026-05-02',
].join('\n');

export default function UploadPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [exchangeRate, setExchangeRate] = useState(100000);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UploadSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<UploadSession[]>([]);

  useEffect(() => {
    uploadService.list().then(setSessions).catch(() => {});
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }

  function downloadSample() {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ejemplo_transacciones_qr.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setError(null);
    setLoading(true);
    try {
      const session = await uploadService.upload(file, month, year, exchangeRate);
      setResult(session);
      setSessions((prev) => [session, ...prev]);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Error al cargar el archivo');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0E0F19] text-white">
      <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
        <header className="mb-6 flex items-center gap-4">
          <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#161825] px-3 py-2 text-sm text-[#85889E] hover:text-white transition">
            <ArrowLeft className="h-4 w-4" /> BANEX OS
          </Link>
          <h1 className="text-xl font-semibold">Carga de transacciones QR</h1>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Formulario */}
          <form onSubmit={handleSubmit} className="rounded-lg border border-white/10 bg-[#161825] p-6 space-y-5">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-6 w-6 text-[#FF8C00]" />
              <h2 className="font-semibold">Nuevo archivo</h2>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className="cursor-pointer rounded-lg border-2 border-dashed border-white/20 bg-[#0E0F19] p-8 text-center transition hover:border-[#FF8C00]/50"
            >
              <Upload className="mx-auto mb-2 h-8 w-8 text-[#85889E]" />
              {file ? (
                <p className="text-sm font-semibold text-[#FF8C00]">{file.name}</p>
              ) : (
                <>
                  <p className="text-sm text-[#85889E]">Arrastra tu CSV o Excel aquí</p>
                  <p className="mt-1 text-xs text-[#85889E]/60">o haz clic para seleccionar</p>
                </>
              )}
              <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </div>

            <div className="rounded-lg border border-[#FF8C00]/30 bg-[#FF8C00]/10 p-4 text-xs text-[#E7E8F1]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-semibold text-white">Formato mínimo del archivo</p>
                <button
                  type="button"
                  onClick={downloadSample}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#FF8C00]/40 px-3 py-2 text-[#FF8C00] transition hover:bg-[#FF8C00]/10"
                >
                  <Download className="h-4 w-4" /> CSV ejemplo
                </button>
              </div>
              <div className="mt-3 space-y-2">
                <p>Columnas obligatorias:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-md bg-[#0E0F19] px-2 py-1 font-mono text-white">user_identifier</span>
                  <span className="rounded-md bg-[#0E0F19] px-2 py-1 font-mono text-white">amount_bs</span>
                </div>
                <p className="text-[#85889E]">
                  También se aceptan aliases: <span className="font-mono text-white">usuario</span> o <span className="font-mono text-white">cuenta</span> para usuario, y <span className="font-mono text-white">monto_bs</span>, <span className="font-mono text-white">consumo_bs</span> o <span className="font-mono text-white">consumo_total_bs</span> para el monto en bolivianos.
                </p>
                <p className="text-[#85889E]">
                  Opcionales: <span className="font-mono text-white">amount_usdt</span>, <span className="font-mono text-white">exchange_rate</span>, <span className="font-mono text-white">merchant_name</span>, <span className="font-mono text-white">transaction_date</span>.
                </p>
              </div>
            </div>

            {/* Período */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#85889E] mb-1">Mes</label>
                <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="w-full rounded-lg border border-white/10 bg-[#0E0F19] px-3 py-2 text-sm text-white">
                  {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#85889E] mb-1">Año</label>
                <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-full rounded-lg border border-white/10 bg-[#0E0F19] px-3 py-2 text-sm text-white">
                  {[CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2].map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            {/* Tipo de cambio */}
            <div>
              <label className="block text-xs font-medium text-[#85889E] mb-1">Tipo de cambio (Bs / USDT)</label>
              <input
                type="number"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(Number(e.target.value))}
                min={1}
                step="0.01"
                className="w-full rounded-lg border border-white/10 bg-[#0E0F19] px-3 py-2 text-sm text-white"
              />
            </div>

            {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>}

            {result && (
              <div className={`rounded-lg px-4 py-3 text-sm flex items-center gap-2 ${result.status === 'done' ? 'bg-green-500/10 border border-green-500/30 text-green-300' : 'bg-red-500/10 border border-red-500/30 text-red-300'}`}>
                {result.status === 'done' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                {result.status === 'done' ? `${result.row_count} filas cargadas correctamente` : result.error_message}
                {result.status === 'done' && (
                  <button type="button" onClick={() => navigate(`/reports/generate/${result.id}`)} className="ml-auto text-xs underline">
                    Generar reporte →
                  </button>
                )}
              </div>
            )}

            {result?.validation_summary && (
              <ValidationSummary session={result} />
            )}

            <button type="submit" disabled={!file || loading} className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#FF8C00] px-4 py-3 text-sm font-bold text-[#0E0F19] transition hover:bg-[#F38118] disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Procesando...</> : <><Upload className="h-4 w-4" /> Cargar archivo</>}
            </button>
          </form>

          {/* Historial */}
          <div className="rounded-lg border border-white/10 bg-[#161825] p-6">
            <h2 className="font-semibold mb-4">Cargas recientes</h2>
            {sessions.length === 0 ? (
              <p className="text-sm text-[#85889E]">No hay cargas aún.</p>
            ) : (
              <div className="space-y-3 max-h-[480px] overflow-auto pr-1">
                {sessions.map((s) => (
                  <div key={s.id} className="rounded-lg bg-[#0E0F19] px-4 py-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white truncate max-w-[180px]">{s.filename}</p>
                      <StatusBadge status={s.status} />
                    </div>
                    <p className="mt-1 text-xs text-[#85889E]">
                      {MONTHS[s.period_month - 1]} {s.period_year} · {s.row_count ?? '—'} ok · {s.rejected_count ?? 0} rechazadas
                    </p>
                    {s.status === 'done' && (
                      <Link to={`/reports/generate/${s.id}`} className="mt-2 inline-block text-xs text-[#FF8C00] hover:underline">
                        Generar reporte →
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function ValidationSummary({ session }: { session: UploadSession }) {
  const rejectedRows = session.validation_summary?.rejected_rows ?? [];
  if (!session.validation_summary) return null;

  return (
    <div className="rounded-lg border border-white/10 bg-[#0E0F19] px-4 py-3 text-xs text-[#85889E]">
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-white font-semibold">{session.validation_summary.input_rows ?? '—'}</p>
          <p>Leídas</p>
        </div>
        <div>
          <p className="text-green-300 font-semibold">{session.validation_summary.accepted_count ?? session.row_count ?? '—'}</p>
          <p>Aceptadas</p>
        </div>
        <div>
          <p className="text-red-300 font-semibold">{session.validation_summary.rejected_count ?? session.rejected_count ?? 0}</p>
          <p>Rechazadas</p>
        </div>
      </div>
      {rejectedRows.length > 0 && (
        <div className="mt-3 max-h-28 overflow-auto rounded-md bg-red-500/10 p-2 text-red-100">
          {rejectedRows.slice(0, 6).map((row) => (
            <p key={`${row.row}-${row.reason}`}>Fila {row.row}: {row.reason}</p>
          ))}
          {session.validation_summary.rejected_rows_truncated && <p>Hay más filas rechazadas en el resumen del backend.</p>}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map = {
    pending: 'bg-yellow-500/15 text-yellow-300',
    processing: 'bg-blue-500/15 text-blue-300',
    done: 'bg-green-500/15 text-green-300',
    error: 'bg-red-500/15 text-red-300',
  } as Record<string, string>;
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${map[status] ?? 'bg-white/10 text-white'}`}>
      {status}
    </span>
  );
}

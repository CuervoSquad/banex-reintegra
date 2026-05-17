import { ArrowLeft, ArrowDownLeft, Clock3, FileSpreadsheet, QrCode, Radio, Waves } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStreamCashback } from '../features/cashback/useStreamCashback';
import { formatBob } from '../features/cashback/streamCashback';

export default function StreamCashbackPage() {
  const {
    stream,
    loading,
    claiming,
    creatingQr,
    generatingMonth,
    selectedLevel,
    selectedLevelId,
    cashbackLevels,
    monthlyPayments,
    monthlyConsumptionBs,
    monthlyProgress,
    snapshot,
    reportRows,
    formattedAccumulated,
    selectLevel,
    createQrPayment,
    generateMonthlyQrPayments,
    claimCashback,
  } = useStreamCashback();

  return (
    <div className="min-h-screen bg-[#0E0F19] text-white">
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-5 sm:px-6">
        <header className="flex items-center justify-between border-b border-white/10 pb-5">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#161825] px-3 py-2 text-sm text-[#85889E] transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            BANEX OS
          </Link>
          <div className="flex items-center gap-2 rounded-lg bg-[#FF8C00]/10 px-3 py-2 text-sm font-semibold text-[#FF8C00]">
            <Radio className="h-4 w-4" />
            STREAM activo
          </div>
        </header>

        <section className="grid flex-1 gap-5 py-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-lg border border-white/10 bg-[#161825] p-5 sm:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#FF8C00] text-[#0E0F19]">
                <Waves className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#FF8C00]">
                  Ficha por pago QR
                </p>
                <h1 className="text-3xl font-semibold text-white sm:text-5xl">
                  Bonificación automática en streaming.
                </h1>
              </div>
            </div>

            <p className="mt-5 max-w-2xl text-sm leading-6 text-[#85889E]">
              Cada QR genera una ficha independiente: monto pagado en bolivianos, equivalente
              debitado en USDT, tipo de cambio aplicado, nivel mensual y reintegro calculado en
              USDT y Bs. Luego ese reintegro puede liberarse en tiempo real.
            </p>

            <div className="mt-8 rounded-lg border border-white/10 bg-[#0E0F19] p-5">
              <p className="text-sm text-[#85889E]">Cashback liberado de este QR</p>
              <p className="mt-2 text-5xl font-semibold text-white sm:text-7xl">
                {loading ? '...' : formattedAccumulated}
              </p>
              <p className="mt-2 text-sm text-[#85889E]">
                {snapshot.accumulatedUsdt.toFixed(4)} USDT liberados de{' '}
                {snapshot.cashbackTotalUsdt.toFixed(4)} USDT.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <div className="rounded-lg bg-[#FF8C00] px-4 py-3 text-[#0E0F19]">
                  <p className="text-xs font-bold uppercase">Tasa live</p>
                  <p className="text-lg font-black">+Bs {snapshot.ratePerSecond.toFixed(4)}/s</p>
                </div>
                <div className="rounded-lg border border-[#5346F6]/40 bg-[#5346F6]/15 px-4 py-3 text-right">
                  <p className="text-xs uppercase text-[#85889E]">Nivel mensual</p>
                  <p className="text-lg font-semibold text-white">
                    {selectedLevel.name} · {selectedLevel.label}
                  </p>
                </div>
              </div>

              <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[#FF8C00] shadow-[0_0_22px_rgba(255,140,0,0.75)] transition-all duration-700"
                  style={{ width: `${snapshot.progress}%` }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-[#85889E]">
                <span>{stream?.qr_payment_id ?? 'QR pendiente'}</span>
                <span>{Math.round(snapshot.progress)}% liberado</span>
                <span>{formatBob(snapshot.claimableBs)} por aceptar</span>
              </div>
            </div>

            <div className="mt-5 rounded-lg border border-white/10 bg-[#0E0F19] p-5">
              <div className="mb-4 flex items-center gap-3">
                <FileSpreadsheet className="h-5 w-5 text-[#FF8C00]" />
                <h2 className="text-lg font-semibold text-white">Reporte operativo del QR</h2>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {reportRows.map((row) => (
                  <InfoRow key={row.label} label={row.label} value={row.value} />
                ))}
              </div>
            </div>
          </div>

          <aside className="flex flex-col gap-5">
            <div className="rounded-lg border border-white/10 bg-[#161825] p-5">
              <p className="text-sm font-semibold text-white">Escoger nivel de demo</p>
              <div className="mt-3 grid gap-2">
                {cashbackLevels.map((level) => (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => selectLevel(level.id)}
                    className={`rounded-lg border px-3 py-3 text-left transition ${
                      selectedLevelId === level.id
                        ? 'border-[#FF8C00] bg-[#FF8C00]/10'
                        : 'border-white/10 bg-[#0E0F19] hover:border-[#5346F6]'
                    }`}
                  >
                    <span className="block text-sm font-semibold text-white">
                      {level.name} · {level.label}
                    </span>
                    <span className="mt-1 block text-xs text-[#85889E]">
                      Meta mensual {formatBob(level.targetBs)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-[#161825] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">Consumo mensual demo</p>
                  <p className="mt-1 text-xs text-[#85889E]">
                    Genera pagos QR aleatorios hasta alcanzar la meta del nivel.
                  </p>
                </div>
                <span className="rounded-md bg-[#5346F6]/15 px-2 py-1 text-xs text-white">
                  {Math.round(monthlyProgress)}%
                </span>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[#FF8C00] transition-all duration-500"
                  style={{ width: `${monthlyProgress}%` }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-[#85889E]">
                <span>{formatBob(monthlyConsumptionBs)} generado</span>
                <span>Meta {formatBob(selectedLevel.targetBs)}</span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-[#0E0F19] px-3 py-2">
                  <p className="text-xs text-[#85889E]">Registros QR</p>
                  <p className="mt-1 text-lg font-semibold text-white">{monthlyPayments.length}</p>
                </div>
                <div className="rounded-lg bg-[#0E0F19] px-3 py-2">
                  <p className="text-xs text-[#85889E]">Cashback estimado</p>
                  <p className="mt-1 text-lg font-semibold text-[#FF8C00]">
                    {formatBob(monthlyConsumptionBs * Number(selectedLevel.percentage))}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={generateMonthlyQrPayments}
                disabled={generatingMonth}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#FF8C00]/50 bg-[#FF8C00]/10 px-4 py-3 text-sm font-bold text-[#FF8C00] transition hover:bg-[#FF8C00]/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <QrCode className="h-4 w-4" />
                {generatingMonth ? 'Generando pagos...' : 'Generar pagos QR random'}
              </button>

              {monthlyPayments.length > 0 && (
                <div className="mt-4 max-h-44 space-y-2 overflow-auto pr-1">
                  {monthlyPayments.slice(-8).reverse().map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between rounded-lg bg-[#0E0F19] px-3 py-2 text-xs"
                    >
                      <span className="text-white">{payment.merchant_name}</span>
                      <span className="font-semibold text-[#FF8C00]">
                        {formatBob(Number(payment.payment_amount))}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={createQrPayment}
              disabled={creatingQr}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#FF8C00] px-5 py-4 text-sm font-black text-[#0E0F19] shadow-[0_18px_38px_rgba(255,140,0,0.28)] transition hover:bg-[#F38118] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <QrCode className="h-5 w-5" />
              {creatingQr ? 'Procesando QR...' : 'Pagar con QR'}
            </button>

            <div className="rounded-lg border border-white/10 bg-[#161825] p-5">
              <div className="mb-4 flex items-center gap-3">
                <QrCode className="h-6 w-6 text-[#FF8C00]" />
                <div>
                  <p className="text-sm text-[#85889E]">Pago QR origen</p>
                  <h2 className="text-xl font-semibold text-white">
                    {stream?.merchant_name ?? 'Sincronizando...'}
                  </h2>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <InfoRow label="Monto pagado" value={formatBob(snapshot.paymentAmountBs)} />
                <InfoRow label="Cashback total" value={formatBob(snapshot.cashbackTotalBs)} />
                <InfoRow label="Aceptado" value={formatBob(Number(stream?.claimed_amount ?? 0))} />
                <InfoRow label="Estado" value={stream?.status ?? 'loading'} />
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-[#161825] p-5">
              <div className="mb-4 flex items-center gap-3">
                <Clock3 className="h-6 w-6 text-[#5346F6]" />
                <h2 className="text-xl font-semibold text-white">Contrato streaming</h2>
              </div>
              <p className="text-sm leading-6 text-[#85889E]">
                Para la demo, el QR se convierte en una ficha de cálculo como el reporte mensual:
                Bs pagados, USDT debitados, tipo de cambio, nivel y reintegro. La diferencia es que
                el beneficio no espera al cierre: se libera por stream desde el momento del pago.
              </p>
            </div>

            <button
              type="button"
              onClick={claimCashback}
              disabled={!stream || claiming || snapshot.claimableBs <= 0}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#5346F6] px-5 py-4 text-sm font-bold text-white shadow-[0_18px_38px_rgba(83,70,246,0.35)] transition hover:bg-[#6257ff] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowDownLeft className="h-5 w-5" />
              {claiming ? 'Aceptando...' : 'Aceptar cashback acumulado'}
            </button>
          </aside>
        </section>
      </main>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-[#0E0F19] px-3 py-2">
      <span className="text-[#85889E]">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}

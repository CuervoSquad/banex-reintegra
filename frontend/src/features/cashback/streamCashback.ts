import type { CashbackStream, QRPaymentCreate } from '../../services/cashbackService';

export const EXCHANGE_RATE_BOB = 100000;
export const MONTHLY_CONSUMPTION_BS = 1850;
export const STREAM_DURATION_SECONDS = 3600;
export const CASHBACK_PERCENTAGE = '0.015';
export const STREAM_CONTRACT_ADDRESS = '0xBANEXSTREAM000000000000000000000000000001';

export type CashbackLevelId = 'level-1' | 'level-2' | 'level-3';

export type DemoQrPayment = {
  id: string;
  merchant_name: string;
  payment_amount: string;
};

export const cashbackLevels = [
  {
    id: 'level-1',
    name: 'Nivel 1',
    targetBs: 600,
    percentage: '0.01',
    label: '1.0%',
  },
  {
    id: 'level-2',
    name: 'Nivel 2',
    targetBs: 1500,
    percentage: '0.015',
    label: '1.5%',
  },
  {
    id: 'level-3',
    name: 'Nivel 3',
    targetBs: 3000,
    percentage: '0.02',
    label: '2.0%',
  },
] as const satisfies ReadonlyArray<{
  id: CashbackLevelId;
  name: string;
  targetBs: number;
  percentage: string;
  label: string;
}>;

const demoPayments = [
  { merchant_name: 'Mercado Norte', payment_amount: '248.00' },
  { merchant_name: 'Farmacia Central', payment_amount: '96.50' },
  { merchant_name: 'Coffee Lab', payment_amount: '34.00' },
  { merchant_name: 'Supermercado Sur', payment_amount: '412.30' },
];

export function getCashbackLevel(levelId: CashbackLevelId) {
  return cashbackLevels.find((level) => level.id === levelId) ?? cashbackLevels[1];
}

export function buildDemoQrPayment(
  prefix = 'QR',
  options?: {
    levelId?: CashbackLevelId;
    payment?: Pick<DemoQrPayment, 'merchant_name' | 'payment_amount'>;
  },
): QRPaymentCreate {
  const level = getCashbackLevel(options?.levelId ?? 'level-2');
  const payment = options?.payment ?? demoPayments[Math.floor(Math.random() * demoPayments.length)];
  const timestamp = Date.now();

  return {
    qr_payment_id: `${prefix}-${timestamp}-${Math.floor(Math.random() * 1000)}`,
    merchant_name: payment.merchant_name,
    payment_amount: payment.payment_amount,
    cashback_percentage: level.percentage,
    duration_seconds: STREAM_DURATION_SECONDS,
    contract_address: STREAM_CONTRACT_ADDRESS,
    chain_tx_hash: `0x${timestamp.toString(16)}QR`,
  };
}

export function buildMonthlyBatchQrPayment(
  payments: DemoQrPayment[],
  levelId: CashbackLevelId,
): QRPaymentCreate {
  const totalBs = sumPaymentsBs(payments);

  return buildDemoQrPayment('QR-MES', {
    levelId,
    payment: {
      merchant_name: `${payments.length} pagos QR generados`,
      payment_amount: totalBs.toFixed(2),
    },
  });
}

export function buildLocalCashbackStream(payload: QRPaymentCreate): CashbackStream {
  const now = new Date();
  const durationSeconds = payload.duration_seconds ?? STREAM_DURATION_SECONDS;
  const cashbackPercentage = Number(payload.cashback_percentage ?? CASHBACK_PERCENTAGE);
  const paymentAmount = Number(payload.payment_amount);
  const cashbackTotal = paymentAmount * cashbackPercentage;

  return {
    id: `local-${payload.qr_payment_id ?? Date.now()}`,
    qr_payment_id: payload.qr_payment_id ?? `LOCAL-${Date.now()}`,
    merchant_name: payload.merchant_name,
    payment_amount: paymentAmount.toFixed(2),
    cashback_total: cashbackTotal.toFixed(6),
    streamed_amount: '0.000000',
    claimed_amount: '0.000000',
    claimable_amount: '0.000000',
    stream_rate_per_second: (cashbackTotal / durationSeconds).toFixed(8),
    status: 'active',
    starts_at: now.toISOString(),
    ends_at: new Date(now.getTime() + durationSeconds * 1000).toISOString(),
    server_time: now.toISOString(),
    contract_address: payload.contract_address,
    chain_tx_hash: payload.chain_tx_hash,
  };
}

export function generateRandomQrPaymentsUntilTarget(levelId: CashbackLevelId): DemoQrPayment[] {
  const level = getCashbackLevel(levelId);
  const payments: DemoQrPayment[] = [];
  let total = 0;

  while (total < level.targetBs) {
    const payment = demoPayments[Math.floor(Math.random() * demoPayments.length)];
    const amount = Number(payment.payment_amount);
    payments.push({
      id: `QR-${Date.now()}-${payments.length + 1}-${Math.floor(Math.random() * 1000)}`,
      merchant_name: payment.merchant_name,
      payment_amount: payment.payment_amount,
    });
    total += amount;
  }

  return payments;
}

export function sumPaymentsBs(payments: DemoQrPayment[]) {
  return payments.reduce((total, payment) => total + Number(payment.payment_amount), 0);
}

export function calculateStreamSnapshot(stream: CashbackStream | null, now: number) {
  const startsAt = stream ? new Date(stream.starts_at).getTime() : now;
  const endsAt = stream ? new Date(stream.ends_at).getTime() : now + 1000;
  const serverTime = stream ? new Date(stream.server_time).getTime() : now;
  const elapsedSinceFetch = Math.max(0, (now - serverTime) / 1000);
  const ratePerSecond = Number(stream?.stream_rate_per_second ?? 0);
  const paymentAmountBs = Number(stream?.payment_amount ?? 0);
  const cashbackTotalBs = Number(stream?.cashback_total ?? 0);

  const accumulatedBs = Math.min(
    cashbackTotalBs,
    Number(stream?.streamed_amount ?? 0) + elapsedSinceFetch * ratePerSecond,
  );
  const claimableBs = Math.max(
    0,
    Number(stream?.claimable_amount ?? 0) + elapsedSinceFetch * ratePerSecond,
  );

  return {
    startsAt,
    endsAt,
    ratePerSecond,
    paymentAmountBs,
    cashbackTotalBs,
    cashbackPercentage: paymentAmountBs > 0 ? (cashbackTotalBs / paymentAmountBs) * 100 : 0,
    paymentAmountUsdt: paymentAmountBs / EXCHANGE_RATE_BOB,
    cashbackTotalUsdt: cashbackTotalBs / EXCHANGE_RATE_BOB,
    accumulatedBs,
    accumulatedUsdt: accumulatedBs / EXCHANGE_RATE_BOB,
    claimableBs,
    progress: Math.min(100, ((now - startsAt) / Math.max(1, endsAt - startsAt)) * 100),
  };
}

export function buildQrReportRows(
  snapshot: ReturnType<typeof calculateStreamSnapshot>,
  options?: {
    levelId?: CashbackLevelId;
    monthlyConsumptionBs?: number;
  },
) {
  const level = getCashbackLevel(options?.levelId ?? 'level-2');
  const monthlyConsumption = options?.monthlyConsumptionBs ?? MONTHLY_CONSUMPTION_BS;

  return [
    { label: 'Usuario / cuenta', value: 'Cuenta demo autenticada' },
    { label: 'Pago QR en Bs.', value: formatBob(snapshot.paymentAmountBs) },
    { label: 'Débito equivalente', value: `${snapshot.paymentAmountUsdt.toFixed(4)} USDT` },
    { label: 'Tipo de cambio', value: `${formatBob(EXCHANGE_RATE_BOB)} / USDT` },
    { label: 'Consumo mensual', value: formatBob(monthlyConsumption) },
    { label: 'Nivel alcanzado', value: `${level.name} · ${level.label}` },
    {
      label: 'Reintegro total',
      value: `${snapshot.cashbackTotalUsdt.toFixed(4)} USDT · ${formatBob(snapshot.cashbackTotalBs)}`,
    },
  ];
}

export function formatBob(amount: number) {
  return `Bs ${amount.toFixed(2)}`;
}

export function formatBobCurrency(amount: number) {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2,
  }).format(amount);
}

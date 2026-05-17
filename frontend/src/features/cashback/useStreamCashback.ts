import { useEffect, useMemo, useRef, useState } from 'react';
import { cashbackService, type CashbackStream } from '../../services/cashbackService';
import {
  buildDemoQrPayment,
  buildLocalCashbackStream,
  buildMonthlyBatchQrPayment,
  buildQrReportRows,
  calculateStreamSnapshot,
  cashbackLevels,
  formatBobCurrency,
  generateRandomQrPaymentsUntilTarget,
  getCashbackLevel,
  sumPaymentsBs,
  type CashbackLevelId,
  type DemoQrPayment,
} from './streamCashback';

export function useStreamCashback() {
  const [now, setNow] = useState(Date.now());
  const [stream, setStream] = useState<CashbackStream | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [creatingQr, setCreatingQr] = useState(false);
  const [generatingMonth, setGeneratingMonth] = useState(false);
  const [selectedLevelId, setSelectedLevelId] = useState<CashbackLevelId>('level-2');
  const [monthlyPayments, setMonthlyPayments] = useState<DemoQrPayment[]>([]);
  const bootstrapped = useRef(false);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;
    void loadCurrentOrCreateDemo();
  }, []);

  async function loadCurrentOrCreateDemo() {
    setLoading(true);
    try {
      const current = await cashbackService.current();
      setStream(current);
    } catch {
      setStream(null);
    } finally {
      setLoading(false);
    }
  }

  async function createQrPayment() {
    setCreatingQr(true);
    try {
      const payload = buildDemoQrPayment('QR', { levelId: selectedLevelId });
      let created: CashbackStream;
      try {
        created = await cashbackService.createFromQrPayment(payload);
      } catch {
        created = buildLocalCashbackStream(payload);
      }
      setMonthlyPayments((current) => [
        ...current,
        {
          id: created.qr_payment_id,
          merchant_name: created.merchant_name,
          payment_amount: created.payment_amount,
        },
      ]);
      setStream(created);
      setNow(Date.now());
    } finally {
      setCreatingQr(false);
    }
  }

  async function claimCashback() {
    if (!stream) return;
    setClaiming(true);
    try {
      if (stream.id.startsWith('local-')) {
        setStream({
          ...stream,
          claimed_amount: String(snapshot.accumulatedBs),
          claimable_amount: '0.000000',
          server_time: new Date().toISOString(),
        });
        return;
      }
      const result = await cashbackService.claim(stream.id);
      setStream(result.stream);
      setNow(Date.now());
    } finally {
      setClaiming(false);
    }
  }

  async function generateMonthlyQrPayments() {
    setGeneratingMonth(true);
    try {
      const payments = generateRandomQrPaymentsUntilTarget(selectedLevelId);
      const payload = buildMonthlyBatchQrPayment(payments, selectedLevelId);
      let created: CashbackStream;

      try {
        created = await cashbackService.createFromQrPayment(payload);
      } catch {
        created = buildLocalCashbackStream(payload);
      }

      setMonthlyPayments(payments);
      setStream(created);
      setNow(Date.now());
    } finally {
      setGeneratingMonth(false);
    }
  }

  const snapshot = useMemo(() => calculateStreamSnapshot(stream, now), [now, stream]);
  const monthlyConsumptionBs = useMemo(() => sumPaymentsBs(monthlyPayments), [monthlyPayments]);
  const selectedLevel = useMemo(() => getCashbackLevel(selectedLevelId), [selectedLevelId]);
  const monthlyProgress = Math.min(100, (monthlyConsumptionBs / selectedLevel.targetBs) * 100);
  const reportRows = useMemo(
    () => buildQrReportRows(snapshot, { levelId: selectedLevelId, monthlyConsumptionBs }),
    [monthlyConsumptionBs, selectedLevelId, snapshot],
  );
  const formattedAccumulated = useMemo(
    () => formatBobCurrency(snapshot.accumulatedBs),
    [snapshot.accumulatedBs],
  );

  return {
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
    selectLevel: setSelectedLevelId,
    createQrPayment,
    generateMonthlyQrPayments,
    claimCashback,
  };
}

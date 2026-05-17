import api from './api';

export interface CashbackStream {
  id: string;
  qr_payment_id: string;
  merchant_name: string;
  payment_amount: string;
  cashback_total: string;
  streamed_amount: string;
  claimed_amount: string;
  claimable_amount: string;
  stream_rate_per_second: string;
  status: string;
  starts_at: string;
  ends_at: string;
  server_time: string;
  contract_address?: string | null;
  chain_tx_hash?: string | null;
}

export interface QRPaymentCreate {
  qr_payment_id?: string;
  merchant_name: string;
  payment_amount: string;
  cashback_percentage?: string;
  duration_seconds?: number;
  contract_address?: string;
  chain_tx_hash?: string;
}

export const cashbackService = {
  async current(): Promise<CashbackStream> {
    const { data } = await api.get<CashbackStream>('/cashback/streams/current');
    return data;
  },
  async createFromQrPayment(payload: QRPaymentCreate): Promise<CashbackStream> {
    const { data } = await api.post<CashbackStream>('/cashback/qr-payments', payload);
    return data;
  },
  async claim(streamId: string): Promise<{ stream: CashbackStream; claimed_now: string }> {
    const { data } = await api.post(`/cashback/streams/${streamId}/claim`);
    return data;
  },
};

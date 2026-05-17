import api from './api';

export interface CashbackLevel {
  id: number;
  name: string;
  min_amount_bs: string;
  max_amount_bs: string | null;
  percentage: string;
  is_active: boolean;
}

export const levelService = {
  async list(): Promise<CashbackLevel[]> {
    const { data } = await api.get<CashbackLevel[]>('/levels');
    return data;
  },
  async update(id: number, payload: Partial<CashbackLevel>): Promise<CashbackLevel> {
    const { data } = await api.patch<CashbackLevel>(`/levels/${id}`, payload);
    return data;
  },
};

export interface UploadSession {
  id: string;
  filename: string;
  period_month: number;
  period_year: number;
  exchange_rate: string;
  status: string;
  row_count: number;
  rejected_count: number;
  created_at: string;
}

export const uploadService = {
  async list(): Promise<UploadSession[]> {
    const { data } = await api.get<UploadSession[]>('/uploads');
    return data;
  },
};

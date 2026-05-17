import api from './authService';

export type UploadSession = {
  id: string;
  filename: string;
  period_month: number;
  period_year: number;
  exchange_rate: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  row_count: number | null;
  error_message: string | null;
  processed_at: string | null;
  created_at: string;
};

export type CashbackLevel = {
  id: number;
  name: string;
  min_amount_bs: string;
  max_amount_bs: string | null;
  percentage: string;
  is_active: boolean;
};

export const uploadService = {
  async upload(
    file: File,
    periodMonth: number,
    periodYear: number,
    exchangeRate: number,
  ): Promise<UploadSession> {
    const form = new FormData();
    form.append('file', file);
    form.append('period_month', String(periodMonth));
    form.append('period_year', String(periodYear));
    form.append('exchange_rate', String(exchangeRate));
    const { data } = await api.post<UploadSession>('/uploads', form);
    return data;
  },

  async list(): Promise<UploadSession[]> {
    const { data } = await api.get<UploadSession[]>('/uploads');
    return data;
  },

  async get(id: string): Promise<UploadSession> {
    const { data } = await api.get<UploadSession>(`/uploads/${id}`);
    return data;
  },
};

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

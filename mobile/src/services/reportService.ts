import api from './api';

export interface MonthlyReport {
  id: string;
  session_id: string;
  period_month: number;
  period_year: number;
  exchange_rate: string;
  total_users: number;
  total_amount_bs: string;
  total_reintegro_usdt: string;
  total_reintegro_bs: string;
  generated_at: string;
}

export const reportService = {
  async list(): Promise<MonthlyReport[]> {
    const { data } = await api.get<MonthlyReport[]>('/reports');
    return data;
  },
  async generate(sessionId: string): Promise<MonthlyReport> {
    const { data } = await api.post<MonthlyReport>(`/reports/generate/${sessionId}`);
    return data;
  },
};

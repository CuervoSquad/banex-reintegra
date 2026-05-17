import api from './authService';

export type ReportRow = {
  id: number;
  user_identifier: string;
  total_amount_bs: string;
  total_amount_usdt: string;
  level_name: string | null;
  level_percentage: string | null;
  reintegro_usdt: string;
  reintegro_bs: string;
  exchange_rate: string;
};

export type MonthlyReport = {
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
  rows: ReportRow[];
};

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
export const formatPeriod = (month: number, year: number) => `${MONTHS[month - 1]} ${year}`;

export const reportService = {
  async generate(sessionId: string): Promise<MonthlyReport> {
    const { data } = await api.post<MonthlyReport>(`/reports/generate/${sessionId}`);
    return data;
  },

  async list(): Promise<MonthlyReport[]> {
    const { data } = await api.get<MonthlyReport[]>('/reports');
    return data;
  },

  async get(id: string): Promise<MonthlyReport> {
    const { data } = await api.get<MonthlyReport>(`/reports/${id}`);
    return data;
  },

  downloadCsv(id: string) {
    window.open(`${api.defaults.baseURL}/reports/${id}/export/csv`, '_blank');
  },

  downloadBanexTransfer(id: string) {
    window.open(`${api.defaults.baseURL}/reports/${id}/export/banextransfer`, '_blank');
  },
};

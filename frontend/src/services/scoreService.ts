import api from './authService';

export interface ScoreFactor {
  label: string;
  valor: number;
}

export interface CreditTier {
  elegible: boolean;
  limite_bs: number;
  tasa_anual_pct: number;
  tier: string;
}

export interface ZKClaim {
  id: string;
  label: string;
  descripcion: string;
  cumple: boolean;
}

export interface BanexScore {
  score: number;
  factores: ScoreFactor[];
  total_streams: number;
  total_bs: number;
  consumo_mes_bs: number;
  meses_activo: number;
  comercios_unicos: number;
  credit: CreditTier;
  zk_claims: ZKClaim[];
}

export const scoreService = {
  async get(): Promise<BanexScore> {
    const { data } = await api.get<BanexScore>('/score/banexscore');
    return data;
  },
};

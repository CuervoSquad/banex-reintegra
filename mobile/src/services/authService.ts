import axios from 'axios';
import api, { BASE_URL } from './api';
import { secureStorage } from '../utils/secureStorage';
import type { LoginRequest, TokenResponse, UserProfile } from '../types/auth';

export const authService = {
  async login(credentials: LoginRequest): Promise<TokenResponse> {
    const { data } = await axios.post<TokenResponse>(
      `${BASE_URL}/api/v1/auth/login`,
      credentials,
      { timeout: 10000 },
    );
    await secureStorage.setItem('access_token', data.access_token);
    await secureStorage.setItem('refresh_token', data.refresh_token);
    return data;
  },

  async me(): Promise<UserProfile> {
    const { data } = await api.get<UserProfile>('/auth/me');
    return data;
  },

  async logout(): Promise<void> {
    await secureStorage.removeItem('access_token');
    await secureStorage.removeItem('refresh_token');
  },
};

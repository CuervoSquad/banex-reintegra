import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authService } from '../services/authService';
import type { AuthState, LoginRequest } from '../types/auth';

interface AuthContextValue extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: localStorage.getItem('access_token'),
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }
    authService
      .me()
      .then((user) =>
        setState({ user, accessToken: token, isAuthenticated: true, isLoading: false }),
      )
      .catch(() => {
        authService.logout();
        setState({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
      });
  }, []);

  async function login(credentials: LoginRequest) {
    const tokens = await authService.login(credentials);
    const user = await authService.me();
    setState({ user, accessToken: tokens.access_token, isAuthenticated: true, isLoading: false });
  }

  function logout() {
    authService.logout();
    setState({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
  }

  return <AuthContext.Provider value={{ ...state, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}

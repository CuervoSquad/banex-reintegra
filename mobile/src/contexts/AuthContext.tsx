import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as ScreenCapture from 'expo-screen-capture';
import { authService } from '../services/authService';
import { secureStorage } from '../utils/secureStorage';
import type { AuthState, LoginRequest } from '../types/auth';

// Tiempo de inactividad antes de requerir reautenticación (5 minutos)
const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000;

interface AuthContextValue extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  requireBiometric: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const [biometricLocked, setBiometricLocked] = useState(false);
  const lastActiveRef = useRef<number>(Date.now());
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Prevención de capturas de pantalla
  useEffect(() => {
    ScreenCapture.preventScreenCaptureAsync();
    return () => { ScreenCapture.allowScreenCaptureAsync(); };
  }, []);

  // Timeout de inactividad: bloquea con biometría si la app estuvo en background > 5 min
  useEffect(() => {
    const handleAppStateChange = async (nextState: AppStateStatus) => {
      if (nextState === 'background' || nextState === 'inactive') {
        lastActiveRef.current = Date.now();
      } else if (nextState === 'active') {
        const elapsed = Date.now() - lastActiveRef.current;
        if (elapsed > INACTIVITY_TIMEOUT_MS && state.isAuthenticated) {
          setBiometricLocked(true);
          const ok = await requireBiometric();
          if (!ok) {
            await doLogout();
          } else {
            setBiometricLocked(false);
          }
        }
      }
    };
    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, [state.isAuthenticated]);

  useEffect(() => { void init(); }, []);

  async function init() {
    const token = await secureStorage.getItem('access_token');
    if (!token) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }
    try {
      const user = await authService.me();
      setState({ user, accessToken: token, isAuthenticated: true, isLoading: false });
      // Pedir biometría al abrir si hay sesión activa
      const hasBiometrics = await LocalAuthentication.hasHardwareAsync();
      if (hasBiometrics) {
        const ok = await requireBiometric();
        if (!ok) {
          await doLogout();
          return;
        }
      }
    } catch {
      await authService.logout();
      setState({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
    }
  }

  async function requireBiometric(): Promise<boolean> {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!compatible || !enrolled) return true; // Sin biometría disponible → permitir
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Verificá tu identidad para continuar',
      cancelLabel: 'Cancelar',
      fallbackLabel: 'Usar contraseña',
      disableDeviceFallback: false,
    });
    return result.success;
  }

  async function login(credentials: LoginRequest) {
    const tokens = await authService.login(credentials);
    const user = await authService.me();
    setState({ user, accessToken: tokens.access_token, isAuthenticated: true, isLoading: false });
    lastActiveRef.current = Date.now();
  }

  async function doLogout() {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    await authService.logout();
    setState({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
    setBiometricLocked(false);
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout: doLogout, requireBiometric }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}

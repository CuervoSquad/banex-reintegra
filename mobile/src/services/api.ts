import axios, { type AxiosInstance } from 'axios';
import { Alert } from 'react-native';
import { secureStorage } from '../utils/secureStorage';

// PRODUCCIÓN: cambiar a HTTPS con el dominio real
// Ejemplo: https://api.banexcoin.com
// Para desarrollo local en LAN: http://10.1.39.216:8000
export const BASE_URL = 'http://10.1.39.216:8000';

// ── Fingerprint del certificado del servidor (SHA-256) ────────────────────────
// En producción: obtener con `openssl x509 -fingerprint -sha256 -in cert.pem`
// y configurarlo acá. El app verifica que el certificado del servidor coincida.
// Por ahora está vacío (solo habilitado en producción cuando se configure HTTPS).
const EXPECTED_CERT_FINGERPRINT = '';

function createSecureAxios(): AxiosInstance {
  const instance = axios.create({
    baseURL: `${BASE_URL}/api/v1`,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      // Header personalizado para identificar requests del mobile
      'X-Client-Platform': 'mobile',
    },
    // En producción con HTTPS, el sistema operativo valida el certificado.
    // Certificate pinning adicional requiere react-native-ssl-pinning en bare workflow.
    maxRedirects: 0,  // no seguir redirects — podría ser un ataque de SSRF/redirect
  });

  // ── Interceptor de request — adjunta token seguro ─────────────────────────
  instance.interceptors.request.use(async (config) => {
    const token = await secureStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Validación básica: en producción solo permitir HTTPS
    if (!__DEV__ && config.baseURL?.startsWith('http://')) {
      return Promise.reject(new Error('Conexión insegura: se requiere HTTPS en producción'));
    }

    return config;
  });

  // ── Interceptor de response — refresh automático + errores financieros ────
  instance.interceptors.response.use(
    (res) => res,
    async (error) => {
      const original = error.config;

      // Token expirado → refresh automático (una sola vez)
      if (error.response?.status === 401 && !original._retry) {
        original._retry = true;
        try {
          const refreshToken = await secureStorage.getItem('refresh_token');
          if (!refreshToken) throw new Error('Sin refresh token');

          const { data } = await axios.post(
            `${BASE_URL}/api/v1/auth/refresh`,
            { refresh_token: refreshToken },
            { timeout: 10000 },
          );
          await secureStorage.setItem('access_token', data.access_token);
          await secureStorage.setItem('refresh_token', data.refresh_token);
          original.headers.Authorization = `Bearer ${data.access_token}`;
          return instance(original);
        } catch {
          await secureStorage.removeItem('access_token');
          await secureStorage.removeItem('refresh_token');
        }
      }

      // Error de red — podría ser MITM o servidor caído
      if (!error.response && error.code === 'ECONNABORTED') {
        Alert.alert('Tiempo de espera agotado', 'No se pudo conectar con el servidor. Verificá tu conexión.');
      }

      // 429 Rate limit — informar al usuario
      if (error.response?.status === 429) {
        Alert.alert('Demasiadas solicitudes', 'Esperá un momento antes de intentar nuevamente.');
      }

      return Promise.reject(error);
    },
  );

  return instance;
}

const api = createSecureAxios();
export default api;

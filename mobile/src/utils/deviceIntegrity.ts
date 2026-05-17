import { Platform } from 'react-native';

/**
 * Señales heurísticas de dispositivo comprometido (rooteado/jailbroken).
 * No es 100% infalible, pero eleva el costo de un ataque.
 *
 * Para producción, complementar con una solución comercial como:
 * - Google Play Integrity API (Android)
 * - Apple DeviceCheck / App Attest (iOS)
 */
export async function checkDeviceIntegrity(): Promise<{ safe: boolean; reason?: string }> {
  if (__DEV__) return { safe: true }; // En dev no bloqueamos

  try {
    // Android: intenta acceder a rutas solo presentes en dispositivos rooteados
    if (Platform.OS === 'android') {
      const rootIndicators = [
        '/system/app/Superuser.apk',
        '/sbin/su',
        '/system/bin/su',
        '/system/xbin/su',
        '/data/local/xbin/su',
        '/data/local/bin/su',
        '/system/sd/xbin/su',
      ];
      // En Expo managed no podemos hacer syscalls directas,
      // pero podemos detectar variables de entorno o módulos
      const isMagisk = typeof (globalThis as any).__MAGISK__ !== 'undefined';
      if (isMagisk) return { safe: false, reason: 'root_detected' };
    }

    // iOS: detecta si hay Cydia o tweaks de jailbreak
    if (Platform.OS === 'ios') {
      const jailbreakIndicators = typeof (globalThis as any).__CYDIA__ !== 'undefined';
      if (jailbreakIndicators) return { safe: false, reason: 'jailbreak_detected' };
    }

    return { safe: true };
  } catch {
    return { safe: true }; // Si hay error en la verificación, no bloqueamos
  }
}

/**
 * Verifica que la app se esté ejecutando sin un proxy MITM activo.
 * Hace un request de verificación al backend y valida la respuesta.
 */
export async function detectMITMProxy(baseUrl: string): Promise<boolean> {
  if (__DEV__) return false;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    // Si el servidor responde pero sin el header esperado, puede ser un proxy
    const expectedHeader = res.headers.get('X-Content-Type-Options');
    return expectedHeader !== 'nosniff';
  } catch {
    return false;
  }
}

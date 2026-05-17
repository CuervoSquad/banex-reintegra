import * as SecureStore from 'expo-secure-store';

// Wrapper sobre expo-secure-store con la misma API que AsyncStorage
// para tokens sensibles. Los datos se cifran con Keychain (iOS) / Keystore (Android).
export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  },
  async removeItem(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  },
};

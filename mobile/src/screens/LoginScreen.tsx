import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const C = { bg: '#0E0F19', card: '#161825', primary: '#5346F6', orange: '#FF8C00', text: '#D1D5DB', muted: '#85889E', border: 'rgba(255,255,255,0.1)' };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(email: string, password: string): string | null {
  if (!email.trim()) return 'El correo es requerido';
  if (!EMAIL_REGEX.test(email)) return 'Correo electrónico inválido';
  if (!password) return 'La contraseña es requerida';
  if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
  return null;
}

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin() {
    const validationError = validate(email.trim(), password);
    if (validationError) { setError(validationError); return; }
    setError(null);
    setLoading(true);
    try {
      await login({ email: email.trim().toLowerCase(), password });
    } catch (err: unknown) {
      // Mensaje genérico para no filtrar si el usuario existe o no
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(detail ?? 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.card}>
        <View style={s.header}>
          <Text style={s.brand}>BANEXCOIN</Text>
          <Text style={s.title}>BanexReintegra</Text>
          <Text style={s.subtitle}>Ingresa con tu correo electrónico</Text>
        </View>

        <View style={s.field}>
          <Text style={s.label}>Correo electrónico</Text>
          <TextInput
            style={s.input}
            value={email}
            onChangeText={(v) => { setEmail(v); setError(null); }}
            placeholder="correo@ejemplo.com"
            placeholderTextColor={C.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            returnKeyType="next"
          />
        </View>

        <View style={s.field}>
          <Text style={s.label}>Contraseña</Text>
          <View style={s.passwordRow}>
            <TextInput
              style={[s.input, { flex: 1 }]}
              value={password}
              onChangeText={(v) => { setPassword(v); setError(null); }}
              placeholder="••••••••"
              placeholderTextColor={C.muted}
              secureTextEntry={!showPassword}
              autoComplete="current-password"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPassword((v) => !v)}>
              <Text style={{ color: C.muted, fontSize: 16 }}>{showPassword ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {error && (
          <View style={s.errorBox}>
            <Text style={s.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[s.btn, (loading || !email || !password) && s.btnDisabled]}
          onPress={handleLogin}
          disabled={loading || !email || !password}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Iniciar sesión</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg, justifyContent: 'center', paddingHorizontal: 16 },
  card: { backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 24 },
  header: { alignItems: 'center', marginBottom: 24 },
  brand: { color: C.orange, fontSize: 11, fontWeight: '700', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700' },
  subtitle: { color: C.muted, fontSize: 13, marginTop: 4 },
  field: { marginBottom: 16 },
  label: { color: '#fff', fontSize: 13, fontWeight: '500', marginBottom: 6 },
  input: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: '#fff', fontSize: 14 },
  passwordRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeBtn: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 8, padding: 10 },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 8, padding: 10, marginBottom: 12 },
  errorText: { color: '#FCA5A5', fontSize: 13 },
  btn: { backgroundColor: C.primary, borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});

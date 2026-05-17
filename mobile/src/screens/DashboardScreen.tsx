import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import type { RootStackParamList } from '../../App';

const C = { bg: '#0E0F19', card: '#161825', primary: '#5346F6', orange: '#FF8C00', green: '#10B981', text: '#D1D5DB', muted: '#85889E', border: 'rgba(255,255,255,0.1)' };

const operations = [
  { title: 'Cargar transacciones', text: 'Subir CSV o Excel mensual de pagos QR', screen: 'Upload' as const, emoji: '📄' },
  { title: 'Configurar niveles', text: 'Editar rangos y porcentajes de reintegro', screen: 'Levels' as const, emoji: '⚙️' },
  { title: 'Reportes', text: 'Generar y exportar archivos BanexTransfer', screen: 'Reports' as const, emoji: '📊' },
];

const bets = [
  { title: 'Stream', text: 'Cashback en tiempo real, segundo a segundo', screen: 'StreamCashback' as const, emoji: '⚡' },
  { title: 'Adelanto', text: 'Cashback futuro como colateral', screen: 'AdelantoCashback' as const, emoji: '💎' },
  { title: 'Protocolo', text: 'Infraestructura B2B2C abierta', screen: 'Protocolo' as const, emoji: '🌐' },
  { title: 'Tesorería', text: 'Agente IA gestiona reservas 24/7', screen: 'Tesoreria' as const, emoji: '🤖' },
  { title: 'BanexScore', text: 'Reputación financiera portable', screen: 'BanexScore' as const, emoji: '📈' },
  { title: 'ZK Privacidad', text: 'Pruebas sin revelar transacciones', screen: 'ZKPrivacidad' as const, emoji: '🔐' },
  { title: 'Agente boliviano', text: 'Soporte multimodal 24/7', screen: 'Agente' as const, emoji: '🇧🇴' },
  { title: 'Merchant economy', text: 'Tokens de comercio + marketplace', screen: 'Merchant' as const, emoji: '🏪' },
  { title: 'LATAM Protocol', text: 'Expansión cripto-nativa a 5 países', screen: 'Latam' as const, emoji: '🗺️' },
  { title: 'Wellness coach', text: 'Coach financiero IA gratis', screen: 'Wellness' as const, emoji: '💚' },
];

const northStar = [
  { label: 'Usuarios activos', value: '1M+', note: 'vs ~10K hoy' },
  { label: 'Volumen QR/mes', value: '$100M+', note: 'multiplicador 100x' },
  { label: 'Países', value: '5', note: 'Bolivia → LATAM' },
  { label: 'Clientes B2B', value: '50+', note: 'en el protocolo' },
  { label: 'Revenue anual', value: '$50M+', note: 'vs $0 hoy' },
];

export default function DashboardScreen() {
  const { logout } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.container}>
      <View style={s.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>BANEXCOIN</Text>
          <Text style={s.subtitle}>De sistema de cashback a infraestructura cripto-financiera de LATAM</Text>
        </View>
        <TouchableOpacity style={s.logoutBtn} onPress={logout}>
          <Text style={s.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.sectionTitle}>Operación de reintegros</Text>
      <View style={s.grid3}>
        {operations.map((item) => (
          <TouchableOpacity key={item.title} style={s.opCard} onPress={() => navigation.navigate(item.screen as any)}>
            <Text style={s.emoji}>{item.emoji}</Text>
            <Text style={s.cardTitle}>{item.title}</Text>
            <Text style={s.cardText}>{item.text}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s.sectionTitle}>Las 10 macro-apuestas</Text>
      <View style={s.grid2}>
        {bets.map((bet) => (
          <TouchableOpacity key={bet.title} style={s.betCard} onPress={() => navigation.navigate(bet.screen as any)}>
            <Text style={s.emoji}>{bet.emoji}</Text>
            <Text style={s.cardTitle}>{bet.title}</Text>
            <Text style={s.cardText}>{bet.text}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s.sectionTitle}>North Star 2030</Text>
      <View style={s.grid2}>
        {northStar.map((item) => (
          <View key={item.label} style={s.starCard}>
            <Text style={s.cardText}>{item.label}</Text>
            <Text style={s.starValue}>{item.value}</Text>
            <Text style={s.cardText}>{item.note}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { backgroundColor: C.bg },
  container: { padding: 16, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 24, marginTop: 8 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700', letterSpacing: 1 },
  subtitle: { color: C.muted, fontSize: 12, marginTop: 4, fontStyle: 'italic', flex: 1, flexWrap: 'wrap' },
  logoutBtn: { backgroundColor: C.card, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: C.border, marginLeft: 8 },
  logoutText: { color: C.muted, fontSize: 12 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 12, marginTop: 20 },
  grid3: { gap: 10 },
  grid2: { gap: 10 },
  opCard: { backgroundColor: C.card, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,140,0,0.3)', padding: 14, marginBottom: 0 },
  betCard: { backgroundColor: C.card, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,140,0,0.3)', padding: 14, marginBottom: 0 },
  starCard: { backgroundColor: C.card, borderRadius: 10, padding: 14, marginBottom: 0 },
  emoji: { fontSize: 20, marginBottom: 6 },
  cardTitle: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 2 },
  cardText: { color: C.muted, fontSize: 12, lineHeight: 16 },
  starValue: { color: '#fff', fontSize: 22, fontWeight: '700', marginVertical: 2 },
});

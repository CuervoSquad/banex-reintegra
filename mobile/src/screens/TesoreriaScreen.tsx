import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const C = { bg: '#0E0F19', card: '#161825', orange: '#FF8C00', primary: '#5346F6', green: '#10B981', muted: '#85889E', border: 'rgba(255,255,255,0.1)' };

const fuentes = [
  { label: 'Liquidez USDT', pct: 30, apy: 4.2, color: C.orange },
  { label: 'Aave v3', pct: 35, apy: 6.8, color: C.primary },
  { label: 'Compound', pct: 20, apy: 5.1, color: C.green },
  { label: 'T-Bills', pct: 15, apy: 3.9, color: '#F59E0B' },
];

const logDecisiones = [
  { time: '14:32:01', msg: 'Rebalanceando: moviendo 2.4% de Liquidez → Aave v3 (+0.8% APY)' },
  { time: '13:18:44', msg: 'Compound rate cayó 0.3%. Manteniendo posición actual.' },
  { time: '12:05:22', msg: 'T-Bills renovados. Yield: 3.91% APY. Sin cambios en cartera.' },
  { time: '10:47:09', msg: 'Nuevas reservas de cashback recibidas: +1,240 USDT distribuidos.' },
];

export default function TesoreriaScreen() {
  const nav = useNavigation();
  const [yield_, setYield] = useState(0);
  const [totalReservas] = useState(48200);

  useEffect(() => {
    const rate = totalReservas * 0.057 / (365 * 24 * 3600);
    const timer = setInterval(() => setYield((v) => v + rate), 1000);
    return () => clearInterval(timer);
  }, []);

  const apyPonderado = fuentes.reduce((s, f) => s + (f.pct / 100) * f.apy, 0);

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.container}>
      <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}><Text style={s.backText}>← Volver</Text></TouchableOpacity>
      <View style={s.header}>
        <View style={s.iconBox}><Text style={{ fontSize: 24 }}>🤖</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Tesorería Autónoma</Text>
          <Text style={s.subtitle}>Agente IA optimiza reservas cripto 24/7</Text>
        </View>
      </View>

      <View style={[s.card, s.yieldCard]}>
        <Text style={s.orangeLabel}>Yield acumulado hoy</Text>
        <Text style={s.yieldNum}>{yield_.toFixed(6)} USDT</Text>
        <View style={s.yieldRow}>
          <View style={s.yieldStat}>
            <Text style={s.muted}>Reservas totales</Text>
            <Text style={s.yieldStatVal}>{totalReservas.toLocaleString()} USDT</Text>
          </View>
          <View style={s.yieldStat}>
            <Text style={s.muted}>APY ponderado</Text>
            <Text style={[s.yieldStatVal, { color: C.green }]}>{apyPonderado.toFixed(2)}%</Text>
          </View>
        </View>
      </View>

      <View style={s.card}>
        <Text style={s.sectionTitle}>Portafolio de reservas</Text>
        {fuentes.map((f) => (
          <View key={f.label} style={s.fuenteRow}>
            <View style={s.fuenteInfo}>
              <View style={[s.colorDot, { backgroundColor: f.color }]} />
              <Text style={s.fuenteLabel}>{f.label}</Text>
            </View>
            <View style={s.fuenteRight}>
              <Text style={[s.fuentePct, { color: f.color }]}>{f.pct}%</Text>
              <Text style={s.muted}>{f.apy}% APY</Text>
            </View>
            <View style={s.fuenteBarBg}>
              <View style={[s.fuenteBarFill, { width: `${f.pct}%` as any, backgroundColor: f.color }]} />
            </View>
          </View>
        ))}
      </View>

      <View style={s.card}>
        <Text style={s.sectionTitle}>Log de decisiones IA</Text>
        {logDecisiones.map((l, i) => (
          <View key={i} style={s.logRow}>
            <Text style={s.logTime}>{l.time}</Text>
            <Text style={s.logMsg}>{l.msg}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { backgroundColor: C.bg },
  container: { padding: 16, paddingBottom: 40 },
  backBtn: { marginBottom: 16 },
  backText: { color: C.muted, fontSize: 13 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  iconBox: { width: 48, height: 48, backgroundColor: 'rgba(255,140,0,0.15)', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  title: { color: '#fff', fontSize: 20, fontWeight: '600' },
  subtitle: { color: C.muted, fontSize: 12, marginTop: 2 },
  card: { backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 12 },
  yieldCard: { borderColor: 'rgba(255,140,0,0.3)' },
  orangeLabel: { color: C.orange, fontSize: 10, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 },
  yieldNum: { color: '#fff', fontSize: 32, fontWeight: '700', marginBottom: 12 },
  yieldRow: { flexDirection: 'row', gap: 12 },
  yieldStat: { flex: 1, backgroundColor: C.bg, borderRadius: 8, padding: 10 },
  yieldStatVal: { color: '#fff', fontSize: 14, fontWeight: '600', marginTop: 4 },
  sectionTitle: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 12 },
  fuenteRow: { marginBottom: 14 },
  fuenteInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  colorDot: { width: 8, height: 8, borderRadius: 4 },
  fuenteLabel: { color: '#fff', fontSize: 13, flex: 1 },
  fuenteRight: { flexDirection: 'row', gap: 12, marginBottom: 6 },
  fuentePct: { fontSize: 13, fontWeight: '700' },
  fuenteBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' },
  fuenteBarFill: { height: 6, borderRadius: 3 },
  muted: { color: C.muted, fontSize: 12 },
  logRow: { borderBottomWidth: 1, borderColor: C.border, paddingVertical: 8 },
  logTime: { color: C.orange, fontSize: 11, fontWeight: '600', marginBottom: 2 },
  logMsg: { color: '#D1D5DB', fontSize: 12, lineHeight: 17 },
});

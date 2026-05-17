import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const C = { bg: '#0E0F19', card: '#161825', orange: '#FF8C00', primary: '#5346F6', green: '#10B981', muted: '#85889E', border: 'rgba(255,255,255,0.1)' };

const anillos = [
  { label: 'Ahorro', pct: 68, color: C.green, meta: 'Bs 500/mes', actual: 'Bs 340' },
  { label: 'Gastos fijos', pct: 82, color: C.orange, meta: '≤ 60% ingreso', actual: '49%' },
  { label: 'Consistencia QR', pct: 91, color: C.primary, meta: '20 pagos/mes', actual: '18 pagos' },
];

const tips = [
  { emoji: '💡', title: 'Optimiza tu nivel', desc: 'Te faltan Bs 342 para Nivel 3. Concentra tus pagos QR en los próximos 8 días.' },
  { emoji: '📊', title: 'Patrón de gasto', desc: 'Tus compras de supermercado son 23% más altas los viernes. Considera cambiar el día.' },
  { emoji: '🎯', title: 'Meta de cashback', desc: 'Si mantienes este ritmo, acumularás Bs 87.40 de cashback este mes (+12% vs anterior).' },
];

const proyeccion = [
  { mes: 'Jun', cashback: 73 },
  { mes: 'Jul', cashback: 81 },
  { mes: 'Ago', cashback: 87 },
];

export default function WellnessScreen() {
  const nav = useNavigation();
  const [tipIdx, setTipIdx] = useState(0);
  const tip = tips[tipIdx];

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.container}>
      <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}><Text style={s.backText}>← Volver</Text></TouchableOpacity>
      <View style={s.header}>
        <View style={s.iconBox}><Text style={{ fontSize: 24 }}>💚</Text></View>
        <View>
          <Text style={s.title}>Wellness Coach</Text>
          <Text style={s.subtitle}>Tu coach financiero IA personalizado</Text>
        </View>
      </View>

      <View style={s.card}>
        <Text style={s.sectionTitle}>Salud financiera</Text>
        {anillos.map((a) => (
          <View key={a.label} style={s.anilloRow}>
            <View style={s.anilloHeader}>
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>{a.label}</Text>
              <Text style={[{ fontSize: 13, fontWeight: '700' }, { color: a.color }]}>{a.pct}%</Text>
            </View>
            <View style={s.barBg}>
              <View style={[s.barFill, { width: `${a.pct}%` as any, backgroundColor: a.color }]} />
            </View>
            <View style={s.anilloMeta}>
              <Text style={s.muted}>Meta: {a.meta}</Text>
              <Text style={s.muted}>Actual: {a.actual}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={[s.card, { borderColor: `${tip.emoji === '💡' ? C.orange : C.primary}40` }]}>
        <Text style={s.sectionTitle}>💬 Consejo del día</Text>
        <View style={s.tipSelector}>
          {tips.map((t, i) => (
            <TouchableOpacity key={i} style={[s.tipDot, tipIdx === i && s.tipDotActive]} onPress={() => setTipIdx(i)} />
          ))}
        </View>
        <Text style={s.tipEmoji}>{tip.emoji}</Text>
        <Text style={s.tipTitle}>{tip.title}</Text>
        <Text style={s.tipDesc}>{tip.desc}</Text>
      </View>

      <View style={s.card}>
        <Text style={s.sectionTitle}>Proyección cashback</Text>
        <View style={s.proyRow}>
          {proyeccion.map((p) => (
            <View key={p.mes} style={s.proyItem}>
              <View style={s.proyBarBg}>
                <View style={[s.proyBarFill, { height: `${(p.cashback / 100) * 100}%` as any }]} />
              </View>
              <Text style={s.proyVal}>Bs {p.cashback}</Text>
              <Text style={s.muted}>{p.mes}</Text>
            </View>
          ))}
        </View>
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
  sectionTitle: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 14 },
  anilloRow: { marginBottom: 16 },
  anilloHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  barBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden', marginBottom: 4 },
  barFill: { height: 8, borderRadius: 4 },
  anilloMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  muted: { color: C.muted, fontSize: 11 },
  tipSelector: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  tipDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.2)' },
  tipDotActive: { backgroundColor: C.orange },
  tipEmoji: { fontSize: 28, marginBottom: 8 },
  tipTitle: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 6 },
  tipDesc: { color: '#D1D5DB', fontSize: 13, lineHeight: 19 },
  proyRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 120 },
  proyItem: { alignItems: 'center', gap: 4 },
  proyBarBg: { width: 40, height: 80, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 6, overflow: 'hidden', justifyContent: 'flex-end' },
  proyBarFill: { width: 40, backgroundColor: C.green, borderRadius: 6 },
  proyVal: { color: '#fff', fontSize: 11, fontWeight: '600' },
});

import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const C = { bg: '#0E0F19', card: '#161825', orange: '#FF8C00', muted: '#85889E', border: 'rgba(255,255,255,0.1)' };

const perfiles = [
  { nombre: 'Historial bajo', score: 340, color: '#EF4444', factores: [{ label: 'Antigüedad', valor: 20 }, { label: 'Volumen QR', valor: 15 }, { label: 'Consistencia', valor: 30 }, { label: 'Variedad comercios', valor: 25 }, { label: 'Sin mora', valor: 60 }], beneficios: [] },
  { nombre: 'Historial medio', score: 640, color: '#FF8C00', factores: [{ label: 'Antigüedad', valor: 55 }, { label: 'Volumen QR', valor: 60 }, { label: 'Consistencia', valor: 65 }, { label: 'Variedad comercios', valor: 50 }, { label: 'Sin mora', valor: 80 }], beneficios: ['Adelanto hasta 50% cashback', 'Nivel 2 automático'] },
  { nombre: 'Historial alto', score: 890, color: '#10B981', factores: [{ label: 'Antigüedad', valor: 90 }, { label: 'Volumen QR', valor: 85 }, { label: 'Consistencia', valor: 95 }, { label: 'Variedad comercios', valor: 80 }, { label: 'Sin mora', valor: 100 }], beneficios: ['Adelanto hasta 90% cashback', 'Nivel 3 garantizado', 'Acceso a Protocolo B2B', 'Score portable LATAM'] },
];

export default function BanexScoreScreen() {
  const nav = useNavigation();
  const [perfilIdx, setPerfilIdx] = useState(1);
  const p = perfiles[perfilIdx];

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.container}>
      <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
        <Text style={s.backText}>← Volver</Text>
      </TouchableOpacity>

      <View style={s.header}>
        <View style={s.iconBox}><Text style={{ fontSize: 24 }}>📈</Text></View>
        <View>
          <Text style={s.title}>BanexScore</Text>
          <Text style={s.subtitle}>Tu reputación financiera portable en toda LATAM</Text>
        </View>
      </View>

      <View style={s.perfilRow}>
        {perfiles.map((pr, i) => (
          <TouchableOpacity key={pr.nombre} style={[s.perfilBtn, perfilIdx === i && s.perfilBtnActive]} onPress={() => setPerfilIdx(i)}>
            <Text style={s.perfilName}>{pr.nombre}</Text>
            <Text style={[s.perfilScore, { color: pr.color }]}>{pr.score} pts</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[s.card, s.gaugeCard]}>
        <View style={s.scoreCircle}>
          <Text style={[s.scoreBig, { color: p.color }]}>{p.score}</Text>
          <Text style={s.scoreOf}>de 1000</Text>
        </View>
        <View style={s.scoreBarBg}>
          <View style={[s.scoreBarFill, { width: `${(p.score / 1000) * 100}%` as any, backgroundColor: p.color }]} />
        </View>
        <Text style={[s.perfilName, { color: p.color, textAlign: 'center', marginTop: 8 }]}>{p.nombre}</Text>
      </View>

      <View style={s.card}>
        <Text style={s.sectionTitle}>5 factores del score</Text>
        {p.factores.map((f) => (
          <View key={f.label} style={s.factorRow}>
            <View style={s.factorLabels}>
              <Text style={s.factorLabel}>{f.label}</Text>
              <Text style={s.factorVal}>{f.valor}/100</Text>
            </View>
            <View style={s.barBg}>
              <View style={[s.barFill, { width: `${f.valor}%` as any, backgroundColor: p.color }]} />
            </View>
          </View>
        ))}
      </View>

      <View style={s.card}>
        <Text style={s.sectionTitle}>Beneficios desbloqueados</Text>
        {p.beneficios.length === 0
          ? <Text style={s.muted}>Aumenta tu score para desbloquear beneficios.</Text>
          : p.beneficios.map((b) => (
            <View key={b} style={s.benefitRow}>
              <Text style={{ color: '#34D399', marginRight: 6 }}>✓</Text>
              <Text style={{ color: '#fff', fontSize: 13 }}>{b}</Text>
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
  perfilRow: { flexDirection: 'row', gap: 6, marginBottom: 16 },
  perfilBtn: { flex: 1, borderWidth: 1, borderColor: C.border, backgroundColor: C.card, borderRadius: 8, padding: 10, alignItems: 'center' },
  perfilBtnActive: { borderColor: C.orange, backgroundColor: 'rgba(255,140,0,0.1)' },
  perfilName: { color: '#fff', fontSize: 11, fontWeight: '600', textAlign: 'center' },
  perfilScore: { fontSize: 11, marginTop: 2 },
  card: { backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 12 },
  gaugeCard: { alignItems: 'center' },
  scoreCircle: { alignItems: 'center', marginBottom: 12 },
  scoreBig: { fontSize: 48, fontWeight: '700' },
  scoreOf: { color: C.muted, fontSize: 12 },
  scoreBarBg: { width: '100%', height: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 5, overflow: 'hidden' },
  scoreBarFill: { height: 10, borderRadius: 5 },
  sectionTitle: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 12 },
  factorRow: { marginBottom: 12 },
  factorLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  factorLabel: { color: C.muted, fontSize: 12 },
  factorVal: { color: '#fff', fontSize: 12, fontWeight: '600' },
  barBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  muted: { color: C.muted, fontSize: 13 },
});

import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const C = { bg: '#0E0F19', card: '#161825', orange: '#FF8C00', muted: '#85889E', border: 'rgba(255,255,255,0.1)' };

const paises = [
  { nombre: 'Bolivia', codigo: 'BO', estado: 'activo', color: '#10B981', usuarios: '42K', volumen: '$2.1M', cashback: '$28K', lanzamiento: 'Q1 2024' },
  { nombre: 'Perú', codigo: 'PE', estado: 'próximo', color: '#FF8C00', usuarios: '—', volumen: '—', cashback: '—', lanzamiento: 'Q3 2025' },
  { nombre: 'Colombia', codigo: 'CO', estado: 'próximo', color: '#FF8C00', usuarios: '—', volumen: '—', cashback: '—', lanzamiento: 'Q4 2025' },
  { nombre: 'Argentina', codigo: 'AR', estado: 'planificado', color: '#5346F6', usuarios: '—', volumen: '—', cashback: '—', lanzamiento: 'Q2 2026' },
  { nombre: 'Chile', codigo: 'CL', estado: 'planificado', color: '#5346F6', usuarios: '—', volumen: '—', cashback: '—', lanzamiento: 'Q3 2026' },
];

const timeline = [
  { fecha: 'Q1 2024', hito: 'Bolivia live — 42K usuarios activos' },
  { fecha: 'Q2 2025', hito: 'BANEXCOIN — protocolo B2B2C abierto' },
  { fecha: 'Q3 2025', hito: 'Expansión Perú — partnership con Yape' },
  { fecha: 'Q4 2025', hito: 'Colombia — integración con Nequi' },
  { fecha: 'Q2 2026', hito: 'Argentina — mercado cripto-nativo' },
  { fecha: 'Q3 2026', hito: 'Chile — 5 países, 1M+ usuarios' },
];

export default function LatamScreen() {
  const nav = useNavigation();
  const [seleccionado, setSeleccionado] = useState('Bolivia');
  const pais = paises.find((p) => p.nombre === seleccionado)!;

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.container}>
      <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
        <Text style={s.backText}>← Volver</Text>
      </TouchableOpacity>
      <View style={s.header}>
        <View style={s.iconBox}><Text style={{ fontSize: 24 }}>🗺️</Text></View>
        <View>
          <Text style={s.title}>LATAM Protocol</Text>
          <Text style={s.subtitle}>Expansión cripto-nativa a 5 países de América Latina</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {paises.map((p) => (
          <TouchableOpacity key={p.nombre} style={[s.paisBtn, seleccionado === p.nombre && s.paisBtnActive]} onPress={() => setSeleccionado(p.nombre)}>
            <Text style={s.paisCode}>{p.codigo}</Text>
            <Text style={[s.paisEstado, { color: p.color }]}>{p.estado}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={s.card}>
        <View style={s.cardHeader}>
          <Text style={s.cardTitle}>{pais.nombre}</Text>
          <View style={[s.badge, { backgroundColor: `${pais.color}20` }]}>
            <Text style={[s.badgeText, { color: pais.color }]}>{pais.estado}</Text>
          </View>
        </View>
        <View style={s.grid2}>
          {[{ label: 'Usuarios activos', value: pais.usuarios }, { label: 'Volumen mensual', value: pais.volumen }, { label: 'Cashback generado', value: pais.cashback }, { label: 'Lanzamiento', value: pais.lanzamiento }].map((d) => (
            <View key={d.label} style={s.dataBox}>
              <Text style={s.muted}>{d.label}</Text>
              <Text style={s.dataValue}>{d.value}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={s.card}>
        <Text style={s.sectionTitle}>Línea de tiempo</Text>
        {timeline.map((t, i) => (
          <View key={i} style={s.timelineItem}>
            <View style={s.dot} />
            <View>
              <Text style={s.timelineFecha}>{t.fecha}</Text>
              <Text style={s.timelineHito}>{t.hito}</Text>
            </View>
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
  subtitle: { color: C.muted, fontSize: 12, marginTop: 2, flexShrink: 1 },
  paisBtn: { borderWidth: 1, borderColor: C.border, backgroundColor: C.card, borderRadius: 10, padding: 12, alignItems: 'center', marginRight: 8, minWidth: 64 },
  paisBtnActive: { borderColor: C.orange, backgroundColor: 'rgba(255,140,0,0.1)' },
  paisCode: { color: '#fff', fontSize: 16, fontWeight: '700' },
  paisEstado: { fontSize: 10, marginTop: 2 },
  card: { backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dataBox: { flex: 1, minWidth: '45%', backgroundColor: C.bg, borderRadius: 8, padding: 10 },
  muted: { color: C.muted, fontSize: 11 },
  dataValue: { color: '#fff', fontSize: 14, fontWeight: '700', marginTop: 4 },
  sectionTitle: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 12 },
  timelineItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  dot: { width: 8, height: 8, backgroundColor: C.orange, borderRadius: 4, marginTop: 4 },
  timelineFecha: { color: C.orange, fontSize: 12, fontWeight: '600' },
  timelineHito: { color: '#D1D5DB', fontSize: 13, marginTop: 2 },
});

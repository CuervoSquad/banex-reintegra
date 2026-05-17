import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const C = { bg: '#0E0F19', card: '#161825', orange: '#FF8C00', primary: '#5346F6', green: '#10B981', muted: '#85889E', border: 'rgba(255,255,255,0.1)' };

const claims = [
  { id: 'nivel', label: 'Nivel de cashback ≥ 2', desc: 'Prueba que alcanzaste Nivel 2 sin revelar monto exacto' },
  { id: 'score', label: 'BanexScore ≥ 600', desc: 'Demuestra solvencia sin exponer historial completo' },
  { id: 'consistencia', label: '3+ meses consecutivos activo', desc: 'Prueba consistencia sin revelar fechas de transacciones' },
];

const pasos = ['Seleccionar claims', 'Generar circuito ZK', 'Publicar proof en cadena'];

export default function ZKPrivacidadScreen() {
  const nav = useNavigation();
  const [selected, setSelected] = useState<string[]>([]);
  const [paso, setPaso] = useState(-1);
  const [generating, setGenerating] = useState(false);
  const [proofHash, setProofHash] = useState<string | null>(null);

  function toggleClaim(id: string) {
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
    setPaso(-1);
    setProofHash(null);
  }

  function generarProof() {
    if (selected.length === 0) return;
    setGenerating(true);
    setPaso(0);
    let i = 0;
    const avanzar = () => {
      i++;
      if (i < pasos.length) { setPaso(i); setTimeout(avanzar, 1200); }
      else {
        setProofHash(`0x${Math.random().toString(16).slice(2, 18)}...ZK`);
        setGenerating(false);
      }
    };
    setTimeout(avanzar, 1200);
  }

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.container}>
      <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}><Text style={s.backText}>← Volver</Text></TouchableOpacity>
      <View style={s.header}>
        <View style={s.iconBox}><Text style={{ fontSize: 24 }}>🔐</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>ZK Privacidad</Text>
          <Text style={s.subtitle}>Pruebas de conocimiento cero — sin revelar datos sensibles</Text>
        </View>
      </View>

      <View style={s.card}>
        <Text style={s.sectionTitle}>¿Qué querés probar?</Text>
        {claims.map((c) => (
          <TouchableOpacity key={c.id} style={[s.claimRow, selected.includes(c.id) && s.claimRowActive]} onPress={() => toggleClaim(c.id)}>
            <View style={[s.checkbox, selected.includes(c.id) && s.checkboxActive]}>
              {selected.includes(c.id) && <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>✓</Text>}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>{c.label}</Text>
              <Text style={s.muted}>{c.desc}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {paso >= 0 && (
        <View style={s.card}>
          <Text style={s.sectionTitle}>Generando proof ZK</Text>
          {pasos.map((p, i) => (
            <View key={p} style={s.pasoRow}>
              <View style={[s.pasoIcon, i < paso && { backgroundColor: C.green }, i === paso && generating && { backgroundColor: C.orange }]}>
                {i < paso ? <Text style={{ color: '#fff', fontSize: 12 }}>✓</Text> :
                  i === paso && generating ? <ActivityIndicator color="#fff" size="small" /> :
                  i === paso ? <Text style={{ color: '#fff', fontSize: 12 }}>✓</Text> :
                  <Text style={{ color: C.muted, fontSize: 11 }}>{i + 1}</Text>}
              </View>
              <Text style={[s.pasoText, i <= paso && { color: '#fff' }]}>{p}</Text>
            </View>
          ))}
          {proofHash && (
            <View style={s.proofBox}>
              <Text style={s.proofLabel}>Proof hash generado</Text>
              <Text style={s.proofHash}>{proofHash}</Text>
            </View>
          )}
        </View>
      )}

      <TouchableOpacity style={[s.mainBtn, (selected.length === 0 || generating || !!proofHash) && { opacity: 0.5 }]} onPress={generarProof} disabled={selected.length === 0 || generating || !!proofHash}>
        {generating ? <ActivityIndicator color="#0E0F19" /> : <Text style={s.mainBtnText}>{proofHash ? '✓ Proof publicado en cadena' : '🔐 Generar ZK Proof'}</Text>}
      </TouchableOpacity>
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
  sectionTitle: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 12 },
  claimRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderWidth: 1, borderColor: C.border, borderRadius: 8, padding: 12, marginBottom: 8 },
  claimRowActive: { borderColor: C.primary, backgroundColor: 'rgba(83,70,246,0.1)' },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  checkboxActive: { backgroundColor: C.primary, borderColor: C.primary },
  muted: { color: C.muted, fontSize: 12, marginTop: 2 },
  pasoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  pasoIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  pasoText: { color: C.muted, fontSize: 13 },
  proofBox: { marginTop: 12, backgroundColor: C.bg, borderRadius: 8, padding: 12 },
  proofLabel: { color: C.muted, fontSize: 11, marginBottom: 4 },
  proofHash: { color: C.green, fontSize: 12, fontFamily: 'monospace' },
  mainBtn: { backgroundColor: C.primary, borderRadius: 12, padding: 16, alignItems: 'center' },
  mainBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});

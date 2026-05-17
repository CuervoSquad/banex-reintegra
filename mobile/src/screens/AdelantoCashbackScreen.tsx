import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const C = { bg: '#0E0F19', card: '#161825', orange: '#FF8C00', primary: '#5346F6', muted: '#85889E', border: 'rgba(255,255,255,0.1)' };
const RATE = 6.9;
const TARIFA = 0.03;
const pasos = ['Solicitud', 'Verificación', 'Aprobación', 'Desembolso'];

export default function AdelantoCashbackScreen() {
  const nav = useNavigation();
  const [consumo, setConsumo] = useState(3000);
  const [porcentaje, setPorcentaje] = useState(50);
  const [paso, setPaso] = useState(-1);
  const [loading, setLoading] = useState(false);

  const nivel = consumo < 1000 ? 0.01 : consumo < 3000 ? 0.015 : 0.02;
  const cashbackEstimado = consumo * nivel;
  const montoAdelanto = cashbackEstimado * (porcentaje / 100);
  const tarifaMonto = montoAdelanto * TARIFA;
  const neto = montoAdelanto - tarifaMonto;
  const netoUsdt = neto / RATE;

  function simularFlujo() {
    setLoading(true);
    setPaso(0);
    let i = 0;
    const avanzar = () => {
      i++;
      if (i < pasos.length) { setPaso(i); setTimeout(avanzar, 900); }
      else setLoading(false);
    };
    setTimeout(avanzar, 900);
  }

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.container}>
      <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
        <Text style={s.backText}>← Volver</Text>
      </TouchableOpacity>

      <View style={s.header}>
        <View style={s.iconBox}><Text style={{ fontSize: 24 }}>💎</Text></View>
        <View>
          <Text style={s.title}>Adelanto Cashback</Text>
          <Text style={s.subtitle}>Usa tu cashback futuro como colateral hoy mismo</Text>
        </View>
      </View>

      <View style={s.card}>
        <View style={s.sliderRow}>
          <Text style={s.sliderLabel}>Consumo mensual estimado</Text>
          <Text style={s.sliderValue}>{consumo.toLocaleString()} Bs</Text>
        </View>
        <View style={s.sliderControls}>
          <TouchableOpacity style={s.sliderBtn} onPress={() => { setConsumo((v) => Math.max(200, v - 200)); setPaso(-1); }}>
            <Text style={s.sliderBtnText}>−</Text>
          </TouchableOpacity>
          <View style={s.sliderTrack}>
            <View style={[s.sliderFill, { width: `${((consumo - 200) / 9800) * 100}%` as any }]} />
          </View>
          <TouchableOpacity style={s.sliderBtn} onPress={() => { setConsumo((v) => Math.min(10000, v + 200)); setPaso(-1); }}>
            <Text style={s.sliderBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={[s.sliderRow, { marginTop: 16 }]}>
          <Text style={s.sliderLabel}>% a adelantar</Text>
          <Text style={s.sliderValue}>{porcentaje}%</Text>
        </View>
        <View style={s.sliderControls}>
          <TouchableOpacity style={s.sliderBtn} onPress={() => { setPorcentaje((v) => Math.max(10, v - 10)); setPaso(-1); }}>
            <Text style={s.sliderBtnText}>−</Text>
          </TouchableOpacity>
          <View style={s.sliderTrack}>
            <View style={[s.sliderFillPurple, { width: `${((porcentaje - 10) / 80) * 100}%` as any }]} />
          </View>
          <TouchableOpacity style={s.sliderBtn} onPress={() => { setPorcentaje((v) => Math.min(90, v + 10)); setPaso(-1); }}>
            <Text style={s.sliderBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[s.card, s.summaryCard]}>
        <Text style={s.sectionTitle}>Resumen del adelanto</Text>
        {[
          { label: 'Cashback estimado mes', value: `${cashbackEstimado.toFixed(2)} Bs` },
          { label: `Adelanto (${porcentaje}%)`, value: `${montoAdelanto.toFixed(2)} Bs` },
          { label: 'Tarifa 3%', value: `-${tarifaMonto.toFixed(2)} Bs`, red: true },
          { label: 'Neto a recibir', value: `${neto.toFixed(2)} Bs`, orange: true },
          { label: 'Equivalente USDT', value: `${netoUsdt.toFixed(4)} USDT`, orange: true },
        ].map((r) => (
          <View key={r.label} style={s.summaryRow}>
            <Text style={s.muted}>{r.label}</Text>
            <Text style={r.orange ? s.orangeText : r.red ? s.redText : s.whiteText}>{r.value}</Text>
          </View>
        ))}
      </View>

      {paso >= 0 && (
        <View style={s.card}>
          <Text style={s.sectionTitle}>Flujo de aprobación</Text>
          <View style={s.pasosRow}>
            {pasos.map((p, i) => (
              <View key={p} style={s.pasoItem}>
                <Text style={{ fontSize: 18 }}>
                  {i < paso ? '✅' : i === paso && loading ? '⏳' : i === paso ? '✅' : '⭕'}
                </Text>
                <Text style={[s.pasoLabel, i <= paso && { color: '#fff' }]}>{p}</Text>
              </View>
            ))}
          </View>
          {!loading && paso === pasos.length - 1 && (
            <Text style={s.successText}>✓ {neto.toFixed(2)} Bs desembolsados a tu wallet</Text>
          )}
        </View>
      )}

      <TouchableOpacity style={[s.mainBtn, (loading || paso === pasos.length - 1) && { opacity: 0.5 }]} onPress={simularFlujo} disabled={loading || paso === pasos.length - 1}>
        {loading ? <ActivityIndicator color="#0E0F19" /> : <Text style={s.mainBtnText}>{paso === -1 ? 'Solicitar adelanto' : 'Solicitud completada'}</Text>}
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
  summaryCard: { borderColor: 'rgba(255,140,0,0.3)' },
  sectionTitle: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 12 },
  sliderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  sliderLabel: { color: C.muted, fontSize: 13 },
  sliderValue: { color: '#fff', fontSize: 13, fontWeight: '600' },
  sliderControls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sliderBtn: { width: 36, height: 36, backgroundColor: C.bg, borderRadius: 8, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  sliderBtnText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  sliderTrack: { flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' },
  sliderFill: { height: 6, backgroundColor: C.orange, borderRadius: 3 },
  sliderFillPurple: { height: 6, backgroundColor: C.primary, borderRadius: 3 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  muted: { color: C.muted, fontSize: 13 },
  whiteText: { color: '#fff', fontSize: 13 },
  orangeText: { color: C.orange, fontSize: 13, fontWeight: '700' },
  redText: { color: '#F87171', fontSize: 13 },
  pasosRow: { flexDirection: 'row', justifyContent: 'space-between' },
  pasoItem: { flex: 1, alignItems: 'center', gap: 4 },
  pasoLabel: { color: C.muted, fontSize: 10, textAlign: 'center' },
  successText: { color: '#34D399', fontSize: 13, fontWeight: '600', textAlign: 'center', marginTop: 12 },
  mainBtn: { backgroundColor: C.orange, borderRadius: 12, padding: 16, alignItems: 'center' },
  mainBtnText: { color: '#0E0F19', fontSize: 14, fontWeight: '700' },
});

import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const C = { bg: '#0E0F19', card: '#161825', orange: '#FF8C00', primary: '#5346F6', muted: '#85889E', border: 'rgba(255,255,255,0.1)' };

const categorias = ['Todos', 'Supermercado', 'Restaurante', 'Farmacia', 'Tecnología', 'Ropa'];
const comercios = [
  { nombre: 'Ketal', categoria: 'Supermercado', vol: 480000, txs: 2140, cashback: 4800 },
  { nombre: 'Hipermaxi', categoria: 'Supermercado', vol: 620000, txs: 3100, cashback: 6200 },
  { nombre: 'Burger King', categoria: 'Restaurante', vol: 180000, txs: 4200, cashback: 1800 },
  { nombre: 'Pizza Hut', categoria: 'Restaurante', vol: 140000, txs: 3600, cashback: 1400 },
  { nombre: 'FarmaBolivia', categoria: 'Farmacia', vol: 95000, txs: 1800, cashback: 950 },
  { nombre: 'Inti Farma', categoria: 'Farmacia', vol: 72000, txs: 1400, cashback: 720 },
  { nombre: 'iCenter', categoria: 'Tecnología', vol: 310000, txs: 820, cashback: 3100 },
  { nombre: 'Mundo Digital', categoria: 'Tecnología', vol: 210000, txs: 640, cashback: 2100 },
  { nombre: 'Mango', categoria: 'Ropa', vol: 130000, txs: 980, cashback: 1300 },
  { nombre: 'H&M Bolivia', categoria: 'Ropa', vol: 165000, txs: 1100, cashback: 1650 },
];

export default function MerchantScreen() {
  const nav = useNavigation();
  const [cat, setCat] = useState('Todos');
  const filtrados = cat === 'Todos' ? comercios : comercios.filter((c) => c.categoria === cat);
  const totalVol = filtrados.reduce((s, c) => s + c.vol, 0);
  const totalTxs = filtrados.reduce((s, c) => s + c.txs, 0);
  const totalCashback = filtrados.reduce((s, c) => s + c.cashback, 0);

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.container}>
      <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}><Text style={s.backText}>← Volver</Text></TouchableOpacity>
      <View style={s.header}>
        <View style={s.iconBox}><Text style={{ fontSize: 24 }}>🏪</Text></View>
        <View>
          <Text style={s.title}>Merchant Economy</Text>
          <Text style={s.subtitle}>Tokens de comercio + marketplace de cashback</Text>
        </View>
      </View>

      <View style={s.statsRow}>
        {[{ label: 'Vol. total Bs', value: `${(totalVol / 1000).toFixed(0)}K` }, { label: 'Transacciones', value: totalTxs.toLocaleString() }, { label: 'Cashback Bs', value: `${(totalCashback / 1000).toFixed(1)}K` }].map((s_) => (
          <View key={s_.label} style={s.statBox}>
            <Text style={s.statLabel}>{s_.label}</Text>
            <Text style={s.statValue}>{s_.value}</Text>
          </View>
        ))}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        {categorias.map((c) => (
          <TouchableOpacity key={c} style={[s.chip, cat === c && s.chipActive]} onPress={() => setCat(c)}>
            <Text style={[s.chipText, cat === c && { color: '#fff' }]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filtrados.map((c) => (
        <View key={c.nombre} style={s.merchantCard}>
          <View>
            <Text style={s.merchantName}>{c.nombre}</Text>
            <Text style={s.merchantCat}>{c.categoria}</Text>
          </View>
          <View style={s.merchantStats}>
            <View style={s.merchantStat}>
              <Text style={s.statLabel}>Volumen</Text>
              <Text style={s.merchantStatVal}>{(c.vol / 1000).toFixed(0)}K Bs</Text>
            </View>
            <View style={s.merchantStat}>
              <Text style={s.statLabel}>Txs</Text>
              <Text style={s.merchantStatVal}>{c.txs.toLocaleString()}</Text>
            </View>
            <View style={s.merchantStat}>
              <Text style={s.statLabel}>Cashback</Text>
              <Text style={[s.merchantStatVal, { color: C.orange }]}>{c.cashback.toLocaleString()} Bs</Text>
            </View>
          </View>
        </View>
      ))}
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
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statBox: { flex: 1, backgroundColor: C.card, borderRadius: 10, borderWidth: 1, borderColor: C.border, padding: 12 },
  statLabel: { color: C.muted, fontSize: 11 },
  statValue: { color: C.orange, fontSize: 18, fontWeight: '700', marginTop: 4 },
  chip: { borderWidth: 1, borderColor: C.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginRight: 6 },
  chipActive: { borderColor: C.orange, backgroundColor: 'rgba(255,140,0,0.1)' },
  chipText: { color: C.muted, fontSize: 12 },
  merchantCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: C.card, borderRadius: 10, borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 8 },
  merchantName: { color: '#fff', fontSize: 13, fontWeight: '600' },
  merchantCat: { color: C.primary, fontSize: 11, marginTop: 2 },
  merchantStats: { flexDirection: 'row', gap: 12 },
  merchantStat: { alignItems: 'flex-end' },
  merchantStatVal: { color: '#fff', fontSize: 12, fontWeight: '600', marginTop: 2 },
});

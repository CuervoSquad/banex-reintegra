import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const C = { bg: '#0E0F19', card: '#161825', orange: '#FF8C00', primary: '#5346F6', muted: '#85889E', border: 'rgba(255,255,255,0.1)' };
const RATE = 6.9;

const partners = [
  { name: 'TigoMoney', categoria: 'Wallet', volumen: 4200000, txs: 18400, fee: 0.0008 },
  { name: 'BNB Comercio', categoria: 'Retail', volumen: 2800000, txs: 9200, fee: 0.001 },
  { name: 'FarmaPlus', categoria: 'Salud', volumen: 1500000, txs: 6800, fee: 0.0012 },
  { name: 'FinanBolivia', categoria: 'Finanzas', volumen: 3900000, txs: 4100, fee: 0.0015 },
  { name: 'MultiRed', categoria: 'Retail', volumen: 980000, txs: 12600, fee: 0.001 },
];

const snippet = `POST https://api.banexcoin.com/v1/cashback/stream
Authorization: Bearer {API_KEY}

{
  "user_id": "usr_A7k29Lm",
  "amount_bs": 250.00,
  "merchant_id": "mer_TigoMoney"
}

// Response 200 OK
{
  "cashback_usdt": 0.0362,
  "level": "Nivel 2",
  "stream_id": "stm_9Xp12Qr"
}`;

export default function ProtocoloScreen() {
  const nav = useNavigation();
  const [expandido, setExpandido] = useState<string | null>(null);
  const revenueTotal = partners.reduce((s, p) => s + p.volumen * p.fee, 0);

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.container}>
      <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}><Text style={s.backText}>← Volver</Text></TouchableOpacity>
      <View style={s.header}>
        <View style={s.iconBox}><Text style={{ fontSize: 24 }}>🌐</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Protocolo B2B2C</Text>
          <Text style={s.subtitle}>Infraestructura abierta para que cualquier empresa ofrezca cashback</Text>
        </View>
      </View>

      <View style={s.statsRow}>
        {[{ label: 'Partners activos', value: String(partners.length) }, { label: 'Revenue total Bs', value: revenueTotal.toFixed(0) }, { label: 'Revenue USDT', value: (revenueTotal / RATE).toFixed(2) }].map((s_) => (
          <View key={s_.label} style={s.statBox}>
            <Text style={s.statLabel}>{s_.label}</Text>
            <Text style={s.statValue}>{s_.value}</Text>
          </View>
        ))}
      </View>

      <View style={s.card}>
        <Text style={s.sectionTitle}>Partners B2B</Text>
        {partners.map((p) => {
          const rev = p.volumen * p.fee;
          const open = expandido === p.name;
          return (
            <View key={p.name} style={s.partnerCard}>
              <TouchableOpacity style={s.partnerHeader} onPress={() => setExpandido(open ? null : p.name)}>
                <View style={s.partnerInfo}>
                  <Text style={s.partnerName}>{p.name}</Text>
                  <View style={s.catBadge}><Text style={s.catText}>{p.categoria}</Text></View>
                </View>
                <View style={s.partnerRight}>
                  <Text style={s.partnerRev}>{rev.toFixed(0)} Bs fee</Text>
                  <Text style={s.chevron}>{open ? '▲' : '▼'}</Text>
                </View>
              </TouchableOpacity>
              {open && (
                <View style={s.partnerDetail}>
                  {[{ l: 'Volumen', v: `${(p.volumen / 1000).toFixed(0)}K Bs` }, { l: 'Transacciones', v: p.txs.toLocaleString() }, { l: 'Fee %', v: `${(p.fee * 100).toFixed(2)}%` }].map((d) => (
                    <View key={d.l} style={s.detailBox}>
                      <Text style={s.statLabel}>{d.l}</Text>
                      <Text style={s.detailVal}>{d.v}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>

      <View style={s.card}>
        <Text style={s.sectionTitle}>API snippet</Text>
        <View style={s.snippetBox}>
          <Text style={s.snippetText}>{snippet}</Text>
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
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statBox: { flex: 1, backgroundColor: C.card, borderRadius: 10, borderWidth: 1, borderColor: C.border, padding: 10 },
  statLabel: { color: C.muted, fontSize: 10 },
  statValue: { color: C.orange, fontSize: 16, fontWeight: '700', marginTop: 4 },
  card: { backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 12 },
  sectionTitle: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 12 },
  partnerCard: { borderWidth: 1, borderColor: C.border, borderRadius: 8, marginBottom: 8, overflow: 'hidden' },
  partnerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 },
  partnerInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  partnerName: { color: '#fff', fontSize: 13, fontWeight: '600' },
  catBadge: { backgroundColor: 'rgba(83,70,246,0.15)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  catText: { color: C.primary, fontSize: 10 },
  partnerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  partnerRev: { color: C.orange, fontSize: 12, fontWeight: '700' },
  chevron: { color: C.muted, fontSize: 10 },
  partnerDetail: { flexDirection: 'row', gap: 8, padding: 12, paddingTop: 0 },
  detailBox: { flex: 1, backgroundColor: C.bg, borderRadius: 6, padding: 8 },
  detailVal: { color: '#fff', fontSize: 12, fontWeight: '600', marginTop: 2 },
  snippetBox: { backgroundColor: C.bg, borderRadius: 8, padding: 12 },
  snippetText: { color: '#34D399', fontSize: 11, fontFamily: 'monospace', lineHeight: 18 },
});

import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { uploadService, type UploadSession } from '../services/uploadService';

const C = { bg: '#0E0F19', card: '#161825', orange: '#FF8C00', green: '#10B981', muted: '#85889E', border: 'rgba(255,255,255,0.1)' };

const statusColor: Record<string, string> = { done: '#10B981', processing: '#FF8C00', pending: '#85889E', error: '#EF4444' };
const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export default function UploadScreen() {
  const nav = useNavigation();
  const [uploads, setUploads] = useState<UploadSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    uploadService.list().then(setUploads).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.container}>
      <View style={s.headerRow}>
        <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}><Text style={s.backText}>← BANEX OS</Text></TouchableOpacity>
        <Text style={s.title}>Carga de transacciones</Text>
      </View>

      <View style={s.infoCard}>
        <Text style={s.infoTitle}>📄 Formato requerido (CSV/Excel)</Text>
        <View style={s.columns}>
          {['user_identifier', 'amount_bs', 'amount_usdt', 'exchange_rate', 'merchant_name', 'transaction_date'].map((col) => (
            <View key={col} style={s.colTag}>
              <Text style={s.colText}>{col}</Text>
            </View>
          ))}
        </View>
        <Text style={s.infoNote}>Para subir archivos, usa la versión web desde un navegador de escritorio.</Text>
      </View>

      <Text style={s.sectionTitle}>Historial de cargas</Text>
      {loading ? (
        <ActivityIndicator color={C.orange} style={{ marginTop: 20 }} />
      ) : uploads.length === 0 ? (
        <View style={s.emptyBox}><Text style={s.muted}>No hay cargas registradas aún.</Text></View>
      ) : uploads.map((u) => (
        <View key={u.id} style={s.uploadCard}>
          <View style={s.uploadHeader}>
            <Text style={s.uploadName} numberOfLines={1}>{u.filename}</Text>
            <View style={[s.statusBadge, { backgroundColor: `${statusColor[u.status] ?? '#85889E'}20` }]}>
              <Text style={[s.statusText, { color: statusColor[u.status] ?? '#85889E' }]}>{u.status}</Text>
            </View>
          </View>
          <View style={s.uploadMeta}>
            <Text style={s.muted}>{meses[(u.period_month ?? 1) - 1]} {u.period_year}</Text>
            <Text style={s.muted}>{u.row_count} filas · {u.rejected_count} rechazadas</Text>
          </View>
          <Text style={s.uploadDate}>{new Date(u.created_at).toLocaleDateString('es-BO')}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { backgroundColor: C.bg },
  container: { padding: 16, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  backBtn: { backgroundColor: C.card, borderRadius: 8, borderWidth: 1, borderColor: C.border, paddingHorizontal: 10, paddingVertical: 6 },
  backText: { color: C.muted, fontSize: 12 },
  title: { color: '#fff', fontSize: 16, fontWeight: '600', flex: 1 },
  infoCard: { backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,140,0,0.3)', padding: 16, marginBottom: 20 },
  infoTitle: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 10 },
  columns: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  colTag: { backgroundColor: C.bg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  colText: { color: '#34D399', fontSize: 11, fontFamily: 'monospace' },
  infoNote: { color: C.muted, fontSize: 12, lineHeight: 17 },
  sectionTitle: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 12 },
  emptyBox: { backgroundColor: C.card, borderRadius: 10, padding: 20, alignItems: 'center' },
  muted: { color: C.muted, fontSize: 12 },
  uploadCard: { backgroundColor: C.card, borderRadius: 10, borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 8 },
  uploadHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  uploadName: { color: '#fff', fontSize: 13, fontWeight: '600', flex: 1, marginRight: 8 },
  statusBadge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: '600' },
  uploadMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  uploadDate: { color: C.muted, fontSize: 11 },
});

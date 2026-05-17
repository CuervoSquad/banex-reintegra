import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { reportService, type MonthlyReport } from '../services/reportService';
import { uploadService, type UploadSession } from '../services/uploadService';

const C = { bg: '#0E0F19', card: '#161825', orange: '#FF8C00', primary: '#5346F6', green: '#10B981', muted: '#85889E', border: 'rgba(255,255,255,0.1)' };

const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export default function ReportsScreen() {
  const nav = useNavigation();
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [uploads, setUploads] = useState<UploadSession[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  useEffect(() => {
    reportService.list().then(setReports).catch(() => {});
    uploadService.list().then(setUploads).catch(() => {});
  }, []);

  async function generateReport() {
    if (!selectedSession) return;
    setGenerating(true);
    setError(null);
    try {
      const report = await reportService.generate(selectedSession);
      setReports((prev) => [report, ...prev]);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Error al generar reporte');
    } finally { setGenerating(false); }
  }

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.container}>
      <View style={s.headerRow}>
        <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}><Text style={s.backText}>← BANEXCOIN</Text></TouchableOpacity>
        <Text style={s.title}>Reportes mensuales</Text>
      </View>

      {error && <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View>}

      {uploads.length > 0 && (
        <View style={s.card}>
          <Text style={s.sectionTitle}>Generar reporte desde carga</Text>
          {uploads.filter((u) => u.status === 'done').map((u) => (
            <TouchableOpacity key={u.id} style={[s.sessionBtn, selectedSession === u.id && s.sessionBtnActive]} onPress={() => setSelectedSession(u.id)}>
              <Text style={{ color: '#fff', fontSize: 13 }}>{u.filename}</Text>
              <Text style={s.muted}>{meses[(u.period_month ?? 1) - 1]} {u.period_year} · {u.row_count} filas</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[s.genBtn, (!selectedSession || generating) && { opacity: 0.5 }]} onPress={generateReport} disabled={!selectedSession || generating}>
            {generating ? <ActivityIndicator color="#0E0F19" /> : <Text style={s.genBtnText}>📊 Generar reporte</Text>}
          </TouchableOpacity>
        </View>
      )}

      <Text style={s.sectionTitle}>Reportes generados</Text>
      {reports.length === 0 ? (
        <View style={s.emptyBox}><Text style={s.muted}>No hay reportes generados aún.</Text></View>
      ) : reports.map((r) => (
        <View key={r.id} style={s.reportCard}>
          <View style={s.reportHeader}>
            <Text style={s.reportTitle}>{meses[r.period_month - 1]} {r.period_year}</Text>
            <View style={s.greenBadge}><Text style={s.greenBadgeText}>Generado</Text></View>
          </View>
          <View style={s.reportGrid}>
            {[
              { label: 'Usuarios', value: String(r.total_users) },
              { label: 'Monto total Bs', value: Number(r.total_amount_bs).toFixed(2) },
              { label: 'Reintegro USDT', value: Number(r.total_reintegro_usdt).toFixed(4) },
              { label: 'Reintegro Bs', value: Number(r.total_reintegro_bs).toFixed(2) },
            ].map((d) => (
              <View key={d.label} style={s.reportStat}>
                <Text style={s.muted}>{d.label}</Text>
                <Text style={s.reportStatVal}>{d.value}</Text>
              </View>
            ))}
          </View>
          <Text style={s.reportDate}>Generado: {new Date(r.generated_at).toLocaleDateString('es-BO')}</Text>
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
  title: { color: '#fff', fontSize: 16, fontWeight: '600' },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 8, padding: 10, marginBottom: 12 },
  errorText: { color: '#FCA5A5', fontSize: 13 },
  card: { backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 16 },
  sectionTitle: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 12 },
  sessionBtn: { borderWidth: 1, borderColor: C.border, borderRadius: 8, padding: 10, marginBottom: 6 },
  sessionBtnActive: { borderColor: C.orange, backgroundColor: 'rgba(255,140,0,0.1)' },
  muted: { color: C.muted, fontSize: 12 },
  genBtn: { backgroundColor: C.orange, borderRadius: 8, padding: 12, alignItems: 'center', marginTop: 10 },
  genBtnText: { color: '#0E0F19', fontSize: 13, fontWeight: '700' },
  emptyBox: { backgroundColor: C.card, borderRadius: 10, padding: 20, alignItems: 'center' },
  reportCard: { backgroundColor: C.card, borderRadius: 10, borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 10 },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  reportTitle: { color: '#fff', fontSize: 15, fontWeight: '600' },
  greenBadge: { backgroundColor: 'rgba(16,185,129,0.15)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  greenBadgeText: { color: C.green, fontSize: 11, fontWeight: '600' },
  reportGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  reportStat: { flex: 1, minWidth: '45%', backgroundColor: C.bg, borderRadius: 8, padding: 8 },
  reportStatVal: { color: '#fff', fontSize: 13, fontWeight: '600', marginTop: 2 },
  reportDate: { color: C.muted, fontSize: 11 },
});

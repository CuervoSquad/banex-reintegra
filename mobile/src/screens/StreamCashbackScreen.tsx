import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStreamCashback } from '../features/cashback/useStreamCashback';
import { formatBob } from '../features/cashback/streamCashback';
import ConfirmationModal from '../components/ConfirmationModal';

const C = { bg: '#0E0F19', card: '#161825', primary: '#5346F6', orange: '#FF8C00', text: '#D1D5DB', muted: '#85889E', border: 'rgba(255,255,255,0.1)' };

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  );
}

export default function StreamCashbackScreen() {
  const nav = useNavigation();
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const { stream, loading, claiming, creatingQr, generatingMonth, selectedLevel, selectedLevelId, cashbackLevels, monthlyPayments, monthlyConsumptionBs, monthlyProgress, snapshot, reportRows, formattedAccumulated, selectLevel, createQrPayment, generateMonthlyQrPayments, claimCashback } = useStreamCashback();

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.container}>
      <View style={s.headerRow}>
        <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
          <Text style={s.backText}>← BANEXCOIN</Text>
        </TouchableOpacity>
        <View style={s.liveTag}>
          <Text style={s.liveText}>● STREAM activo</Text>
        </View>
      </View>

      <View style={s.card}>
        <Text style={s.orangeLabel}>Ficha por pago QR</Text>
        <Text style={s.bigTitle}>Bonificación automática en streaming</Text>
        <Text style={s.desc}>Cada QR genera una ficha independiente: monto pagado en bolivianos, equivalente en USDT, tipo de cambio, nivel mensual y reintegro calculado.</Text>

        <View style={s.innerCard}>
          <Text style={s.muted}>Cashback liberado de este QR</Text>
          <Text style={s.megaNum}>{loading ? '...' : formattedAccumulated}</Text>
          <Text style={s.muted}>{snapshot.accumulatedUsdt.toFixed(4)} USDT liberados de {snapshot.cashbackTotalUsdt.toFixed(4)} USDT</Text>

          <View style={s.rateRow}>
            <View style={s.rateBox}>
              <Text style={[s.rateLabel, { color: '#0E0F19' }]}>Tasa live</Text>
              <Text style={[s.rateNum, { color: '#0E0F19' }]}>+Bs {snapshot.ratePerSecond.toFixed(4)}/s</Text>
            </View>
            <View style={s.levelBox}>
              <Text style={s.muted}>Nivel mensual</Text>
              <Text style={{ color: '#fff', fontWeight: '600' }}>{selectedLevel.name} · {selectedLevel.label}</Text>
            </View>
          </View>

          <View style={s.progressBg}>
            <View style={[s.progressFill, { width: `${snapshot.progress}%` as any }]} />
          </View>
          <View style={s.progressLabels}>
            <Text style={s.muted}>{stream?.qr_payment_id ?? 'QR pendiente'}</Text>
            <Text style={s.muted}>{Math.round(snapshot.progress)}% liberado</Text>
          </View>
        </View>

        <View style={s.innerCard}>
          <Text style={s.sectionTitle}>Reporte operativo del QR</Text>
          {reportRows.map((row) => <InfoRow key={row.label} label={row.label} value={row.value} />)}
        </View>
      </View>

      <View style={s.card}>
        <Text style={s.sectionTitle}>Escoger nivel de demo</Text>
        {cashbackLevels.map((level) => (
          <TouchableOpacity key={level.id} style={[s.levelBtn, selectedLevelId === level.id && s.levelBtnActive]} onPress={() => selectLevel(level.id)}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>{level.name} · {level.label}</Text>
            <Text style={s.muted}>Meta mensual {formatBob(level.targetBs)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.card}>
        <Text style={s.sectionTitle}>Consumo mensual demo</Text>
        <View style={s.progressBg}>
          <View style={[s.progressFill, { width: `${monthlyProgress}%` as any }]} />
        </View>
        <View style={s.progressLabels}>
          <Text style={s.muted}>{formatBob(monthlyConsumptionBs)} generado</Text>
          <Text style={s.muted}>Meta {formatBob(selectedLevel.targetBs)}</Text>
        </View>
        <View style={s.statsRow}>
          <View style={s.statBox}>
            <Text style={s.muted}>Registros QR</Text>
            <Text style={s.statNum}>{monthlyPayments.length}</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.muted}>Cashback estimado</Text>
            <Text style={[s.statNum, { color: C.orange }]}>{formatBob(monthlyConsumptionBs * Number(selectedLevel.percentage))}</Text>
          </View>
        </View>
        <TouchableOpacity style={s.genBtn} onPress={generateMonthlyQrPayments} disabled={generatingMonth}>
          {generatingMonth ? <ActivityIndicator color={C.orange} /> : <Text style={s.genBtnText}>📱 Generar pagos QR random</Text>}
        </TouchableOpacity>
        {monthlyPayments.slice(-5).reverse().map((p) => (
          <View key={p.id} style={s.paymentRow}>
            <Text style={{ color: '#fff', fontSize: 13 }}>{p.merchant_name}</Text>
            <Text style={{ color: C.orange, fontSize: 13, fontWeight: '600' }}>{formatBob(Number(p.payment_amount))}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={s.qrBtn} onPress={() => setShowQrModal(true)} disabled={creatingQr}>
        {creatingQr ? <ActivityIndicator color="#0E0F19" /> : <Text style={s.qrBtnText}>📷 Pagar con QR</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={[s.claimBtn, (!stream || claiming || snapshot.claimableBs <= 0) && { opacity: 0.5 }]} onPress={() => setShowClaimModal(true)} disabled={!stream || claiming || snapshot.claimableBs <= 0}>
        {claiming ? <ActivityIndicator color="#fff" /> : <Text style={s.claimBtnText}>⬇ Aceptar cashback acumulado</Text>}
      </TouchableOpacity>

      <ConfirmationModal
        visible={showClaimModal}
        title="Confirmar aceptación de cashback"
        description={`Estás a punto de aceptar el cashback disponible del stream de ${stream?.merchant_name ?? ''}. Esta operación quedará registrada en el sistema.`}
        amount={formatBob(snapshot.claimableBs)}
        confirmLabel="Aceptar cashback"
        onConfirm={() => { setShowClaimModal(false); claimCashback(); }}
        onCancel={() => setShowClaimModal(false)}
      />

      <ConfirmationModal
        visible={showQrModal}
        title="Confirmar pago QR"
        description={`Se generará un pago QR demo para el nivel ${selectedLevel.name} (${selectedLevel.label}). Se creará un nuevo stream de cashback.`}
        amount={`Nivel ${selectedLevel.name} · ${selectedLevel.label}`}
        confirmLabel="Confirmar pago"
        onConfirm={() => { setShowQrModal(false); createQrPayment(); }}
        onCancel={() => setShowQrModal(false)}
      />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { backgroundColor: C.bg },
  container: { padding: 16, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  backBtn: { backgroundColor: C.card, borderRadius: 8, borderWidth: 1, borderColor: C.border, paddingHorizontal: 12, paddingVertical: 8 },
  backText: { color: C.muted, fontSize: 13 },
  liveTag: { backgroundColor: 'rgba(255,140,0,0.1)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  liveText: { color: C.orange, fontSize: 12, fontWeight: '600' },
  card: { backgroundColor: C.card, borderRadius: 10, borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 12 },
  innerCard: { backgroundColor: C.bg, borderRadius: 8, padding: 14, marginTop: 14 },
  orangeLabel: { color: C.orange, fontSize: 10, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 },
  bigTitle: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 8 },
  desc: { color: C.muted, fontSize: 12, lineHeight: 18, marginBottom: 4 },
  muted: { color: C.muted, fontSize: 12 },
  megaNum: { color: '#fff', fontSize: 36, fontWeight: '700', marginVertical: 6 },
  rateRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  rateBox: { backgroundColor: C.orange, borderRadius: 8, padding: 10, flex: 1 },
  rateLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  rateNum: { fontSize: 15, fontWeight: '900', marginTop: 2 },
  levelBox: { flex: 1, borderWidth: 1, borderColor: 'rgba(83,70,246,0.4)', backgroundColor: 'rgba(83,70,246,0.15)', borderRadius: 8, padding: 10 },
  progressBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden', marginTop: 12 },
  progressFill: { height: 8, backgroundColor: C.orange, borderRadius: 4 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  sectionTitle: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: C.bg, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 4 },
  infoLabel: { color: C.muted, fontSize: 12 },
  infoValue: { color: '#fff', fontSize: 12, fontWeight: '600' },
  levelBtn: { borderWidth: 1, borderColor: C.border, backgroundColor: C.bg, borderRadius: 8, padding: 10, marginBottom: 6 },
  levelBtnActive: { borderColor: C.orange, backgroundColor: 'rgba(255,140,0,0.1)' },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  statBox: { flex: 1, backgroundColor: C.bg, borderRadius: 8, padding: 10 },
  statNum: { color: '#fff', fontSize: 18, fontWeight: '600', marginTop: 2 },
  genBtn: { borderWidth: 1, borderColor: 'rgba(255,140,0,0.5)', backgroundColor: 'rgba(255,140,0,0.1)', borderRadius: 8, padding: 12, alignItems: 'center', marginTop: 10 },
  genBtnText: { color: C.orange, fontSize: 13, fontWeight: '700' },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: C.bg, borderRadius: 6, padding: 8, marginTop: 4 },
  qrBtn: { backgroundColor: C.orange, borderRadius: 10, padding: 16, alignItems: 'center', marginBottom: 10 },
  qrBtnText: { color: '#0E0F19', fontSize: 14, fontWeight: '900' },
  claimBtn: { backgroundColor: C.primary, borderRadius: 10, padding: 16, alignItems: 'center', marginBottom: 10 },
  claimBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});

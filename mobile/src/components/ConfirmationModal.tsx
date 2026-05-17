import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const C = { bg: '#0E0F19', card: '#161825', primary: '#5346F6', orange: '#FF8C00', red: '#EF4444', muted: '#85889E', border: 'rgba(255,255,255,0.1)' };

interface Props {
  visible: boolean;
  title: string;
  description: string;
  amount: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export default function ConfirmationModal({ visible, title, description, amount, confirmLabel = 'Confirmar', onConfirm, onCancel, danger = false }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={s.overlay}>
        <View style={s.card}>
          <Text style={s.title}>{title}</Text>
          <Text style={s.desc}>{description}</Text>

          <View style={s.amountBox}>
            <Text style={s.amountLabel}>Monto a aceptar</Text>
            <Text style={[s.amount, danger && { color: C.red }]}>{amount}</Text>
          </View>

          <Text style={s.warning}>
            ⚠️ Esta acción no se puede deshacer. Verificá el monto antes de confirmar.
          </Text>

          <View style={s.actions}>
            <TouchableOpacity style={s.cancelBtn} onPress={onCancel}>
              <Text style={s.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.confirmBtn, danger && { backgroundColor: C.red }]} onPress={onConfirm}>
              <Text style={s.confirmText}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 24, width: '100%', maxWidth: 400 },
  title: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  desc: { color: C.muted, fontSize: 14, lineHeight: 20, marginBottom: 16 },
  amountBox: { backgroundColor: C.bg, borderRadius: 10, padding: 16, marginBottom: 16, alignItems: 'center' },
  amountLabel: { color: C.muted, fontSize: 12, marginBottom: 4 },
  amount: { color: C.orange, fontSize: 28, fontWeight: '800' },
  warning: { color: '#FCD34D', fontSize: 12, lineHeight: 17, marginBottom: 20, backgroundColor: 'rgba(252,211,77,0.08)', borderRadius: 8, padding: 10 },
  actions: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  cancelText: { color: C.muted, fontSize: 14, fontWeight: '600' },
  confirmBtn: { flex: 1, backgroundColor: C.primary, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  confirmText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});

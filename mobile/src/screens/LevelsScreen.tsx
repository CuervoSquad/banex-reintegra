import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { levelService, type CashbackLevel } from '../services/uploadService';

const C = { bg: '#0E0F19', card: '#161825', primary: '#5346F6', orange: '#FF8C00', muted: '#85889E', border: 'rgba(255,255,255,0.1)' };

export default function LevelsScreen() {
  const nav = useNavigation();
  const [levels, setLevels] = useState<CashbackLevel[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState<Partial<CashbackLevel>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { levelService.list().then(setLevels).catch(() => {}); }, []);

  function startEdit(level: CashbackLevel) { setEditing(level.id); setDraft({ ...level }); setError(null); }
  function cancel() { setEditing(null); setDraft({}); }

  async function save(id: number) {
    setSaving(true);
    setError(null);
    try {
      const updated = await levelService.update(id, draft);
      setLevels((prev) => prev.map((l) => (l.id === id ? updated : l)));
      setEditing(null);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Error al guardar');
    } finally { setSaving(false); }
  }

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.container}>
      <View style={s.headerRow}>
        <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
          <Text style={s.backText}>← BANEXCOIN</Text>
        </TouchableOpacity>
        <Text style={s.title}>Configuración de niveles</Text>
      </View>
      <Text style={s.desc}>Define los rangos de consumo mensual en Bs. y el porcentaje de reintegro correspondiente a cada nivel.</Text>

      {error && <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View>}

      {levels.map((level) => (
        <View key={level.id} style={[s.card, !level.is_active && { opacity: 0.5 }]}>
          {editing === level.id ? (
            <View>
              <View style={s.editGrid}>
                <View style={s.editField}>
                  <Text style={s.editLabel}>Nombre</Text>
                  <TextInput style={s.input} value={draft.name ?? ''} onChangeText={(v) => setDraft((d) => ({ ...d, name: v }))} placeholderTextColor={C.muted} placeholder="Nombre" />
                </View>
                <View style={s.editField}>
                  <Text style={s.editLabel}>Mínimo Bs.</Text>
                  <TextInput style={s.input} value={String(draft.min_amount_bs ?? '')} onChangeText={(v) => setDraft((d) => ({ ...d, min_amount_bs: v }))} keyboardType="numeric" placeholderTextColor={C.muted} />
                </View>
                <View style={s.editField}>
                  <Text style={s.editLabel}>Máximo Bs.</Text>
                  <TextInput style={s.input} value={draft.max_amount_bs ?? ''} onChangeText={(v) => setDraft((d) => ({ ...d, max_amount_bs: v || null }))} keyboardType="numeric" placeholder="∞" placeholderTextColor={C.muted} />
                </View>
                <View style={s.editField}>
                  <Text style={s.editLabel}>% reintegro</Text>
                  <TextInput style={s.input} value={String(Number(draft.percentage ?? 0) * 100)} onChangeText={(v) => setDraft((d) => ({ ...d, percentage: String(Number(v) / 100) }))} keyboardType="numeric" placeholderTextColor={C.muted} />
                </View>
              </View>
              <View style={s.editActions}>
                <TouchableOpacity style={s.cancelBtn} onPress={cancel}>
                  <Text style={s.cancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.5 }]} onPress={() => save(level.id)} disabled={saving}>
                  {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.saveBtnText}>Guardar</Text>}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={s.levelRow}>
              <View>
                <Text style={s.levelName}>{level.name}</Text>
                <Text style={s.levelRange}>
                  Bs {Number(level.min_amount_bs).toLocaleString()} – {level.max_amount_bs ? `Bs ${Number(level.max_amount_bs).toLocaleString()}` : '∞'}
                  <Text style={s.levelPct}>  {(Number(level.percentage) * 100).toFixed(1)}% reintegro</Text>
                </Text>
              </View>
              <TouchableOpacity style={s.editBtn} onPress={() => startEdit(level)}>
                <Text style={s.editBtnText}>✏ Editar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { backgroundColor: C.bg },
  container: { padding: 16, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  backBtn: { backgroundColor: C.card, borderRadius: 8, borderWidth: 1, borderColor: C.border, paddingHorizontal: 10, paddingVertical: 6 },
  backText: { color: C.muted, fontSize: 12 },
  title: { color: '#fff', fontSize: 16, fontWeight: '600', flex: 1 },
  desc: { color: C.muted, fontSize: 12, marginBottom: 16, lineHeight: 18 },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 8, padding: 10, marginBottom: 12 },
  errorText: { color: '#FCA5A5', fontSize: 13 },
  card: { backgroundColor: C.card, borderRadius: 10, borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 10 },
  levelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelName: { color: '#fff', fontSize: 14, fontWeight: '600' },
  levelRange: { color: C.muted, fontSize: 12, marginTop: 4 },
  levelPct: { color: C.orange, fontWeight: '600' },
  editBtn: { borderWidth: 1, borderColor: C.border, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  editBtnText: { color: C.muted, fontSize: 12 },
  editGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  editField: { flex: 1, minWidth: '45%' },
  editLabel: { color: C.muted, fontSize: 11, marginBottom: 4 },
  input: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8, color: '#fff', fontSize: 13 },
  editActions: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
  cancelBtn: { borderWidth: 1, borderColor: C.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  cancelText: { color: C.muted, fontSize: 13 },
  saveBtn: { backgroundColor: C.primary, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  saveBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});

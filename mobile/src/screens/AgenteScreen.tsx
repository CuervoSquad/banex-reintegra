import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const C = { bg: '#0E0F19', card: '#161825', primary: '#5346F6', orange: '#FF8C00', muted: '#85889E', border: 'rgba(255,255,255,0.1)' };

type Msg = { de: 'user' | 'bot'; texto: string };

const respuestas: Record<string, string> = {
  cashback: '¡Hola! Tienes 14.82 Bs acumulados este mes, equivalente a 2.1478 USDT. Tu nivel actual es Nivel 2 (1.5%). ¿Quieres reclamarlo ahora?',
  adelanto: 'Puedo adelantarte hasta el 70% de tu cashback estimado del mes. Eso sería aproximadamente 48.50 Bs (7.03 USDT), con una tarifa del 3%. ¿Te interesa proceder?',
  gasto: 'Tus 3 categorías con más gasto este mes son:\n1. Supermercados — 1.240 Bs\n2. Restaurantes — 680 Bs\n3. Farmacia — 310 Bs\n\nEl 78% de tus pagos son QR. ¡Muy bien!',
  score: 'Tu BanexScore actual es 640/1000 (nivel medio). Para subir al nivel alto necesitas:\n✓ 3 meses más de consistencia\n✓ Aumentar volumen QR a 3.000 Bs/mes\n✓ Diversificar a 5+ comercios',
  nivel: 'Estás en Nivel 2: 1.000 – 2.999 Bs/mes con 1.5% de cashback. Para alcanzar Nivel 3 (2%) te faltan 842 Bs este mes.',
  default: 'Entiendo tu consulta. Puedo ayudarte con:\n• Tu cashback acumulado\n• Solicitar un adelanto\n• Ver en qué gastas más\n• Conocer tu BanexScore\n\n¿Qué necesitas?',
};

const sugerencias = ['¿cuánto cashback tengo?', 'quiero un adelanto', '¿en qué gasto más?', '¿cómo está mi score?'];

function obtenerRespuesta(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('cashback') || m.includes('acumulad') || m.includes('cuánto')) return respuestas.cashback;
  if (m.includes('adelanto') || m.includes('anticipo')) return respuestas.adelanto;
  if (m.includes('gasto') || m.includes('gastar')) return respuestas.gasto;
  if (m.includes('score') || m.includes('puntaje')) return respuestas.score;
  if (m.includes('nivel')) return respuestas.nivel;
  return respuestas.default;
}

export default function AgenteScreen() {
  const nav = useNavigation();
  const [mensajes, setMensajes] = useState<Msg[]>([{ de: 'bot', texto: '¡Hola! Soy tu agente boliviano BANEX 🇧🇴 ¿En qué te ayudo hoy?' }]);
  const [input, setInput] = useState('');
  const [escribiendo, setEscribiendo] = useState(false);
  const listRef = useRef<FlatList>(null);

  useEffect(() => { listRef.current?.scrollToEnd({ animated: true }); }, [mensajes, escribiendo]);

  function enviar(texto: string) {
    if (!texto.trim() || escribiendo) return;
    setMensajes((m) => [...m, { de: 'user', texto }]);
    setInput('');
    setEscribiendo(true);
    setTimeout(() => {
      setMensajes((m) => [...m, { de: 'bot', texto: obtenerRespuesta(texto) }]);
      setEscribiendo(false);
    }, 900);
  }

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => nav.goBack()}><Text style={s.backText}>← Volver</Text></TouchableOpacity>
        <View style={s.agentInfo}>
          <View style={s.agentAvatar}><Text style={{ fontSize: 20 }}>🇧🇴</Text></View>
          <View>
            <Text style={s.agentName}>Agente boliviano</Text>
            <Text style={s.online}>● En línea</Text>
          </View>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={mensajes}
        keyExtractor={(_, i) => String(i)}
        style={s.messageList}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={[s.msgRow, item.de === 'user' ? s.msgRight : s.msgLeft]}>
            <View style={[s.bubble, item.de === 'user' ? s.bubbleUser : s.bubbleBot]}>
              <Text style={s.bubbleText}>{item.texto}</Text>
            </View>
          </View>
        )}
        ListFooterComponent={escribiendo ? (
          <View style={s.msgLeft}>
            <View style={s.bubbleBot}>
              <Text style={s.bubbleText}>...</Text>
            </View>
          </View>
        ) : null}
      />

      <View style={s.suggestions}>
        {sugerencias.map((s_) => (
          <TouchableOpacity key={s_} style={s.chip} onPress={() => enviar(s_)}>
            <Text style={s.chipText}>{s_}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.inputRow}>
        <TextInput style={s.input} value={input} onChangeText={setInput} placeholder="Escribe tu consulta..." placeholderTextColor={C.muted} onSubmitEditing={() => enviar(input)} returnKeyType="send" />
        <TouchableOpacity style={[s.sendBtn, !input.trim() && { opacity: 0.4 }]} onPress={() => enviar(input)} disabled={!input.trim()}>
          <Text style={{ color: '#0E0F19', fontSize: 16 }}>▶</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { padding: 16, borderBottomWidth: 1, borderColor: C.border, paddingTop: 48 },
  backText: { color: C.muted, fontSize: 13, marginBottom: 12 },
  agentInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  agentAvatar: { width: 40, height: 40, backgroundColor: C.orange, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  agentName: { color: '#fff', fontSize: 15, fontWeight: '600' },
  online: { color: '#34D399', fontSize: 12 },
  messageList: { flex: 1 },
  msgRow: { marginBottom: 10 },
  msgRight: { alignItems: 'flex-end' },
  msgLeft: { alignItems: 'flex-start' },
  bubble: { maxWidth: '80%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleUser: { backgroundColor: C.primary, borderBottomRightRadius: 4 },
  bubbleBot: { backgroundColor: C.card, borderBottomLeftRadius: 4 },
  bubbleText: { color: '#D1D5DB', fontSize: 13, lineHeight: 18 },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 12, paddingBottom: 8 },
  chip: { borderWidth: 1, borderColor: C.border, backgroundColor: C.card, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  chipText: { color: C.muted, fontSize: 11 },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: 1, borderColor: C.border, gap: 8 },
  input: { flex: 1, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, color: '#fff', fontSize: 14 },
  sendBtn: { width: 40, height: 40, backgroundColor: C.orange, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});

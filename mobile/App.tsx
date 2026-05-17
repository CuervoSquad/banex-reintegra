import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { checkDeviceIntegrity } from './src/utils/deviceIntegrity';

import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import StreamCashbackScreen from './src/screens/StreamCashbackScreen';
import AdelantoCashbackScreen from './src/screens/AdelantoCashbackScreen';
import AgenteScreen from './src/screens/AgenteScreen';
import BanexScoreScreen from './src/screens/BanexScoreScreen';
import LatamScreen from './src/screens/LatamScreen';
import LevelsScreen from './src/screens/LevelsScreen';
import MerchantScreen from './src/screens/MerchantScreen';
import ProtocoloScreen from './src/screens/ProtocoloScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import TesoreriaScreen from './src/screens/TesoreriaScreen';
import UploadScreen from './src/screens/UploadScreen';
import WellnessScreen from './src/screens/WellnessScreen';
import ZKPrivacidadScreen from './src/screens/ZKPrivacidadScreen';

export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  StreamCashback: undefined;
  AdelantoCashback: undefined;
  Agente: undefined;
  BanexScore: undefined;
  Latam: undefined;
  Levels: undefined;
  Merchant: undefined;
  Protocolo: undefined;
  Reports: undefined;
  Tesoreria: undefined;
  Upload: undefined;
  Wellness: undefined;
  ZKPrivacidad: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const [integrityBlocked, setIntegrityBlocked] = useState(false);

  useEffect(() => {
    checkDeviceIntegrity().then(({ safe }) => {
      if (!safe) {
        setIntegrityBlocked(true);
        Alert.alert(
          'Dispositivo no seguro',
          'Esta app no puede ejecutarse en dispositivos rooteados o con jailbreak por razones de seguridad financiera.',
          [{ text: 'Cerrar', onPress: () => {} }],
          { cancelable: false },
        );
      }
    });
  }, []);

  if (integrityBlocked) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0E0F19', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ color: '#EF4444', fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 12 }}>
          Dispositivo no compatible
        </Text>
        <Text style={{ color: '#85889E', fontSize: 14, textAlign: 'center' }}>
          Por razones de seguridad financiera, esta app no puede ejecutarse en dispositivos rooteados o con jailbreak.
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0E0F19', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#FF8C00" size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0E0F19' } }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="StreamCashback" component={StreamCashbackScreen} />
          <Stack.Screen name="AdelantoCashback" component={AdelantoCashbackScreen} />
          <Stack.Screen name="Agente" component={AgenteScreen} />
          <Stack.Screen name="BanexScore" component={BanexScoreScreen} />
          <Stack.Screen name="Latam" component={LatamScreen} />
          <Stack.Screen name="Levels" component={LevelsScreen} />
          <Stack.Screen name="Merchant" component={MerchantScreen} />
          <Stack.Screen name="Protocolo" component={ProtocoloScreen} />
          <Stack.Screen name="Reports" component={ReportsScreen} />
          <Stack.Screen name="Tesoreria" component={TesoreriaScreen} />
          <Stack.Screen name="Upload" component={UploadScreen} />
          <Stack.Screen name="Wellness" component={WellnessScreen} />
          <Stack.Screen name="ZKPrivacidad" component={ZKPrivacidadScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

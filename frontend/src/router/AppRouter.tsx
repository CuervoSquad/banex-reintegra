import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import StreamCashbackPage from '../pages/StreamCashbackPage';
import UploadPage from '../pages/UploadPage';
import LevelsPage from '../pages/LevelsPage';
import ReportsPage from '../pages/ReportsPage';
import AdelantoCashbackPage from '../pages/AdelantoCashbackPage';
import ProtocoloPage from '../pages/ProtocoloPage';
import TesoreriaPage from '../pages/TesoreriaPage';
import BanexScorePage from '../pages/BanexScorePage';
import ZKPrivacidadPage from '../pages/ZKPrivacidadPage';
import AgentePage from '../pages/AgentePage';
import MerchantPage from '../pages/MerchantPage';
import LatamPage from '../pages/LatamPage';
import WellnessPage from '../pages/WellnessPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/stream-cashback" element={<StreamCashbackPage />} />
            <Route path="/adelanto" element={<AdelantoCashbackPage />} />
            <Route path="/protocolo" element={<ProtocoloPage />} />
            <Route path="/tesoreria" element={<TesoreriaPage />} />
            <Route path="/banexscore" element={<BanexScorePage />} />
            <Route path="/zk-privacidad" element={<ZKPrivacidadPage />} />
            <Route path="/agente-boliviano" element={<AgentePage />} />
            <Route path="/merchant-economy" element={<MerchantPage />} />
            <Route path="/latam-protocol" element={<LatamPage />} />
            <Route path="/wellness-coach" element={<WellnessPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/levels" element={<LevelsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/reports/generate/:sessionId" element={<ReportsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ChatWidget from '../ChatWidget';
import MonthlyConsumptionWidget from '../MonthlyConsumptionWidget';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="text-gray-500 text-sm">Cargando...</span>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <>
      <Outlet />
      <MonthlyConsumptionWidget />
      <ChatWidget />
    </>
  );
}

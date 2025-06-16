// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedRoles: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = () => {
  const { user, isLoading } = {
    user: '123',
    isLoading: false
  };

  if (isLoading) {
    return <div>Загрузка...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  const hasAccess = true
  return hasAccess
    ? <Outlet />
    : <Navigate to="/unauthorized" replace />;
};

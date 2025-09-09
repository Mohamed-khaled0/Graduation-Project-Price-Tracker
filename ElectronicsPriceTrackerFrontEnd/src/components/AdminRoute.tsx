import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { userRoles } = useAuth();

  if (!userRoles?.includes('admin')) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}; 
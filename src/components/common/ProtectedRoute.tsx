import { Navigate, Outlet } from 'react-router-dom';
import { Alert, Spin } from 'antd';
import { useMe } from '../../hooks/useAuth';
import { canAccessRole } from '../../utils/access';

export function ProtectedRoute({ allowedRoles }: { allowedRoles?: string[] }) {
  const userId = localStorage.getItem('lms_user_id');
  const cachedRole = localStorage.getItem('lms_role');
  const { data: me, isLoading, isError } = useMe();

  if (!userId) return <Navigate to="/login" replace />;

  const role = me?.role.role_name || cachedRole;
  if (isLoading && !role) {
    return <div className="flex min-h-screen items-center justify-center"><Spin size="large" /></div>;
  }

  if (isError && !role) return <Navigate to="/login" replace />;

  if (!canAccessRole(role, allowedRoles)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <Alert
          type="warning"
          showIcon
          message="Access denied"
          description="You do not have access to this module. Employees can only view assigned trainings and the modules attached to those assignments."
        />
      </div>
    );
  }

  return <Outlet />;
}

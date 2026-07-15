import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import PageNotFound from '@/lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { roleHome, ROLES } from '@/config/roles';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import SignUp from '@/pages/SignUp';
import ForgotPassword from '@/pages/ForgotPassword';
import Assessment from '@/pages/Assessment';
import Results from '@/pages/Results';
import EmployeeDashboard from '@/pages/employee/EmployeeDashboard';
import ManagerDashboard from '@/pages/manager/ManagerDashboard';
import HRDashboard from '@/pages/hr/HRDashboard';
import SuperAdminDashboard from '@/pages/superadmin/SuperAdminDashboard';

function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? roleHome(user.role) : '/login'} replace />;
}

function AppShell() {
  const { isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route element={<MainLayout />}>
        <Route path="/app" element={<HomeRedirect />} />

        <Route
          path="/app/employe"
          element={
            <ProtectedRoute>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/manager"
          element={
            <ProtectedRoute roles={[ROLES.MANAGER, ROLES.HR_ADMIN, ROLES.SUPER_ADMIN]}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/rh/*"
          element={
            <ProtectedRoute roles={[ROLES.HR_ADMIN, ROLES.SUPER_ADMIN]}>
              <HRDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/admin/*"
          element={
            <ProtectedRoute roles={[ROLES.SUPER_ADMIN]}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/app/evaluation"
          element={
            <ProtectedRoute>
              <Assessment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/evaluation/:assignmentId"
          element={
            <ProtectedRoute>
              <Assessment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/resultats/:id"
          element={
            <ProtectedRoute>
              <Results />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
        <Toaster />
        <SonnerToaster position="top-right" richColors />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;

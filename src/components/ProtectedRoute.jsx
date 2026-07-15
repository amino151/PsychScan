import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { roleHome } from '@/config/roles';

// Route protégée générique.
// - `roles` : liste des rôles autorisés (vide/omis = tout utilisateur authentifié).
// Redirige vers /login si non authentifié, ou vers le tableau de bord du rôle
// si l'utilisateur est authentifié mais non autorisé.
export default function ProtectedRoute({ children, roles }) {
  const { user, isLoadingAuth, authChecked, hasRole } = useAuth();
  const location = useLocation();

  if (isLoadingAuth || !authChecked) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    const returnUrl = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={`/login?return=${encodeURIComponent(returnUrl)}`} replace />;
  }

  if (roles && roles.length > 0 && !hasRole(roles)) {
    return <Navigate to={roleHome(user.role)} replace />;
  }

  return children;
}

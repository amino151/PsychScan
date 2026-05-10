import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

export default function ProtectedUserRoute({ children }) {
  const { user, isLoadingAuth, authChecked } = useAuth();
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

  return children;
}


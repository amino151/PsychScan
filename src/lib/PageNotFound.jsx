import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';

export default function PageNotFound() {
  const location = useLocation();
  const { user } = useAuth();
  const pageName = location.pathname.slice(1) || '(racine)';

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-md w-full">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-7xl font-light text-slate-300">404</h1>
            <div className="h-0.5 w-16 bg-slate-200 mx-auto" />
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-medium text-slate-800">Page introuvable</h2>
            <p className="text-slate-600 leading-relaxed">
              La page <span className="font-medium text-slate-700">&quot;{pageName}&quot;</span>{' '}
              n&apos;existe pas dans cette application.
            </p>
          </div>

          {user?.role === 'admin' && (
            <div className="mt-8 p-4 bg-slate-100 rounded-lg border border-slate-200 text-left">
              <p className="text-sm font-medium text-slate-700 mb-1">Espace admin</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Vérifiez la configuration des routes dans <code className="text-xs">App.jsx</code>.
              </p>
            </div>
          )}

          <div className="pt-6">
            <Button asChild variant="outline">
              <Link to="/">Retour à l&apos;accueil</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

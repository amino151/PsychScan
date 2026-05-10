import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Brain, History, Home, LayoutDashboard, LogIn, LogOut, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';

export default function MainLayout() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 font-semibold font-display">
            <Brain className="w-6 h-6 text-primary" />
            MindScan
          </Link>
          <nav className="hidden sm:flex items-center gap-1 text-sm">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <Home className="w-4 h-4" />
                Accueil
              </Button>
            </Link>
            <Link to="/test">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <Sparkles className="w-4 h-4" />
                Test
              </Button>
            </Link>
            <Link to="/history">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <History className="w-4 h-4" />
                Historique
              </Button>
            </Link>
            {isAdmin && (
              <Link to="/admin">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <LayoutDashboard className="w-4 h-4" />
                  Admin
                </Button>
              </Link>
            )}
          </nav>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <span className="text-xs text-muted-foreground max-w-[140px] truncate hidden md:inline">
                  {user?.full_name}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    logout(false);
                    navigate('/');
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button size="sm" className="gap-1.5 rounded-full">
                  <LogIn className="w-4 h-4" />
                  Connexion
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

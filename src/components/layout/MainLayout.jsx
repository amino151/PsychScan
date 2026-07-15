import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Radar,
  LayoutDashboard,
  Users,
  Building2,
  ClipboardCheck,
  ShieldCheck,
  LogOut,
  LogIn,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import { ROLES, roleLabel } from '@/config/roles';
import { getDepartment } from '@/config/departments';

const NAV_ITEMS = [
  { to: '/app/employe', label: 'Mon espace', icon: LayoutDashboard, roles: null },
  { to: '/app/evaluation', label: 'Évaluation', icon: ClipboardCheck, roles: null },
  { to: '/app/manager', label: 'Mon équipe', icon: Users, roles: [ROLES.MANAGER, ROLES.HR_ADMIN, ROLES.SUPER_ADMIN] },
  { to: '/app/rh', label: 'RH', icon: Building2, roles: [ROLES.HR_ADMIN, ROLES.SUPER_ADMIN] },
  { to: '/app/admin', label: 'Administration', icon: ShieldCheck, roles: [ROLES.SUPER_ADMIN] },
];

export default function MainLayout() {
  const { user, logout, isAuthenticated, isMock } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  const department = user?.department_id ? getDepartment(user.department_id) : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link to="/app" className="flex items-center gap-2 font-semibold font-display">
            <span className="rounded-lg bg-brand-gradient p-1.5">
              <Radar className="w-5 h-5 text-white" />
            </span>
            <span className="hidden sm:inline">PsychoScan IOS</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm">
            {visibleItems.map((item) => {
              const active = location.pathname.startsWith(item.to);
              return (
                <Link key={item.to} to={item.to}>
                  <Button variant={active ? 'secondary' : 'ghost'} size="sm" className="gap-1.5">
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <div className="hidden md:flex flex-col items-end leading-tight">
                  <span className="text-xs font-medium max-w-[160px] truncate">{user?.full_name}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {roleLabel(user?.role)}
                    {department ? ` · ${department.name}` : ''}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    logout(false);
                    navigate('/login');
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Déconnexion</span>
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

        {/* Navigation mobile */}
        <nav className="md:hidden flex items-center gap-1 overflow-x-auto px-4 pb-2 text-sm">
          {visibleItems.map((item) => (
            <Link key={item.to} to={item.to} className="shrink-0">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <item.icon className="w-4 h-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
      </header>

      {isMock ? (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-xs text-center py-1.5 px-4">
          Mode démonstration local (sans Supabase) — les données sont stockées dans votre navigateur.
        </div>
      ) : null}

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

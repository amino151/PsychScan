import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { appApi } from '@/services/appApi';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Brain, ShieldCheck, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import AuthField from '@/components/auth/AuthField';
import { normalizeEmail, passwordErrorMessage, validateEmail, validatePassword } from '@/lib/auth-utils';

const adminPasswordConfigured = Boolean(
  import.meta.env.VITE_ADMIN_PASSWORD && String(import.meta.env.VITE_ADMIN_PASSWORD).length > 0
);

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkUserAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const emailError =
    email.length > 0 && !validateEmail(email) ? 'Veuillez saisir une adresse email valide.' : '';
  const pwdError = password.length > 0 ? passwordErrorMessage(password) : '';
  const formInvalid = !validateEmail(email) || !validatePassword(password) || submitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formInvalid) {
      setError(emailError || pwdError || 'Veuillez corriger le formulaire.');
      return;
    }
    if (adminPassword && !adminPasswordConfigured) {
      setError("L'accès administrateur n'est pas configuré pour cette installation.");
      return;
    }
    if (adminPassword && adminPasswordConfigured && adminPassword !== import.meta.env.VITE_ADMIN_PASSWORD) {
      setError('Mot de passe administrateur incorrect.');
      return;
    }
    try {
      setSubmitting(true);
      await appApi.auth.signIn({
        email: normalizeEmail(email),
        password,
      });
      if (adminPasswordConfigured && adminPassword === import.meta.env.VITE_ADMIN_PASSWORD) {
        await appApi.auth.promoteToAdmin();
      }
      await checkUserAuth();
      const dest = searchParams.get('return') || '/history';
      navigate(dest.startsWith('/') ? dest : '/history', { replace: true });
    } catch (err) {
      setError(err?.message || 'Connexion impossible.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-brand-gradient opacity-[0.08]" />
      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-5"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Link>

          <div className="w-full p-7 md:p-8 rounded-3xl border border-white/45 bg-white/80 backdrop-blur-xl shadow-panel">
            <div className="flex items-center gap-3 mb-5">
              <div className="rounded-xl bg-primary/10 p-2.5">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold">Connexion</h1>
                <p className="text-sm text-muted-foreground">Accès sécurisé à votre compte</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Authentification Supabase. La session reste sur cet appareil après connexion.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AuthField
                id="email"
                label="Email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={setEmail}
                error={emailError}
              />
              <AuthField
                id="password"
                label="Mot de passe"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={setPassword}
                error={pwdError}
              />
              {adminPasswordConfigured && (
                <AuthField
                  id="adminPassword"
                  label={
                    <span className="inline-flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                      Mot de passe admin (optionnel)
                    </span>
                  }
                  type="password"
                  autoComplete="off"
                  value={adminPassword}
                  onChange={setAdminPassword}
                />
              )}
              {error && (
                <p className="text-sm text-destructive rounded-lg bg-destructive/10 px-3 py-2 transition-all">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full rounded-xl" disabled={formInvalid}>
                {submitting ? 'Connexion…' : 'Continuer'}
              </Button>
            </form>

            <div className="mt-6 space-y-2 text-center">
              <Link
                to="/forgot-password"
                className="block text-xs text-primary hover:text-primary/80 transition-colors"
              >
                Mot de passe oublié ?
              </Link>
              <p className="text-xs text-muted-foreground">
                Pas encore de compte ?{' '}
                <Link to="/signup" className="underline underline-offset-2 text-primary">
                  Créer un compte
                </Link>
              </p>
              <p className="text-xs text-muted-foreground">
                <Link to="/" className="underline underline-offset-2">
                  Retour à l&apos;accueil
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

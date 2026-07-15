import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { appApi } from '@/services/appApi';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Radar, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import AuthField from '@/components/auth/AuthField';
import { normalizeEmail, passwordErrorMessage, validateEmail, validatePassword } from '@/lib/auth-utils';
import { roleHome } from '@/config/roles';
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '@/services/mockData';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkUserAuth, isMock } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const emailError = email.length > 0 && !validateEmail(email) ? 'Veuillez saisir une adresse email valide.' : '';
  const pwdError = password.length > 0 ? passwordErrorMessage(password) : '';
  const formInvalid = !validateEmail(email) || !validatePassword(password) || submitting;

  async function performLogin(loginEmail, loginPassword) {
    setError('');
    setSubmitting(true);
    try {
      const user = await appApi.auth.signIn({ email: normalizeEmail(loginEmail), password: loginPassword });
      await checkUserAuth();
      const returnTo = searchParams.get('return');
      const dest = returnTo && returnTo.startsWith('/') ? returnTo : roleHome(user?.role);
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err?.message || 'Connexion impossible.');
    } finally {
      setSubmitting(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formInvalid) {
      setError(emailError || pwdError || 'Veuillez corriger le formulaire.');
      return;
    }
    await performLogin(email, password);
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
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-5">
            <ArrowLeft className="w-4 h-4" />
            Retour à l&apos;accueil
          </Link>

          <div className="w-full p-7 md:p-8 rounded-3xl border border-white/45 bg-white/80 backdrop-blur-xl shadow-panel">
            <div className="flex items-center gap-3 mb-5">
              <div className="rounded-xl bg-brand-gradient p-2.5">
                <Radar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold">Connexion</h1>
                <p className="text-sm text-muted-foreground">Accès à la plateforme PsychoScan IOS</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AuthField id="email" label="Email" type="email" autoComplete="username" value={email} onChange={setEmail} error={emailError} />
              <AuthField id="password" label="Mot de passe" type="password" autoComplete="current-password" value={password} onChange={setPassword} error={pwdError} />
              {error && (
                <p className="text-sm text-destructive rounded-lg bg-destructive/10 px-3 py-2">{error}</p>
              )}
              <Button type="submit" className="w-full rounded-xl" disabled={formInvalid}>
                {submitting ? 'Connexion…' : 'Se connecter'}
              </Button>
            </form>

            {isMock ? (
              <div className="mt-6 rounded-2xl border border-primary/15 bg-primary/5 p-4">
                <p className="text-xs font-medium text-primary mb-3">
                  Comptes de démonstration (mot de passe : <span className="font-mono">{DEMO_PASSWORD}</span>)
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {DEMO_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => {
                        setEmail(acc.email);
                        setPassword(DEMO_PASSWORD);
                        performLogin(acc.email, DEMO_PASSWORD);
                      }}
                      disabled={submitting}
                      className="flex items-center justify-between rounded-lg bg-white/80 border border-primary/10 px-3 py-2 text-left text-xs hover:border-primary/40 transition-colors disabled:opacity-60"
                    >
                      <span className="font-medium">{acc.label}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{acc.email}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-6 space-y-2 text-center">
              <Link to="/forgot-password" className="block text-xs text-primary hover:text-primary/80">
                Mot de passe oublié ?
              </Link>
              <p className="text-xs text-muted-foreground">
                Pas encore de compte ?{' '}
                <Link to="/signup" className="underline underline-offset-2 text-primary">
                  Créer un compte
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

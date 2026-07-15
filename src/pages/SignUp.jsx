import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Radar, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthField from '@/components/auth/AuthField';
import { appApi } from '@/services/appApi';
import { useAuth } from '@/lib/AuthContext';
import {
  normalizeEmail,
  passwordErrorMessage,
  validateEmail,
  validateName,
  validatePassword,
} from '@/lib/auth-utils';

export default function SignUp() {
  const navigate = useNavigate();
  const { checkUserAuth } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const errors = useMemo(() => {
    return {
      name: name.length > 0 && !validateName(name) ? 'Le nom doit contenir au moins 2 caractères.' : '',
      email: email.length > 0 && !validateEmail(email) ? 'Veuillez saisir une adresse email valide.' : '',
      password: password.length > 0 ? passwordErrorMessage(password) : '',
      confirm:
        confirmPassword.length > 0 && confirmPassword !== password
          ? 'La confirmation du mot de passe ne correspond pas.'
          : '',
    };
  }, [name, email, password, confirmPassword]);

  const formInvalid =
    !validateName(name) ||
    !validateEmail(email) ||
    !validatePassword(password) ||
    password !== confirmPassword ||
    submitting;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (formInvalid) {
      setError('Veuillez corriger les erreurs du formulaire.');
      return;
    }

    try {
      setSubmitting(true);
      const sessionUser = await appApi.auth.register({
        full_name: name.trim(),
        email: normalizeEmail(email),
        password,
      });
      await checkUserAuth();
      if (sessionUser) {
        setSuccess('Compte créé avec succès. Redirection…');
        window.setTimeout(() => {
          navigate('/app/employe', { replace: true });
        }, 900);
      } else {
        setSuccess(
          'Compte créé. Si la confirmation email est activée, vérifiez votre boîte pour activer la connexion.'
        );
      }
    } catch (err) {
      setError(err?.message || 'Inscription impossible.');
    } finally {
      setSubmitting(false);
    }
  }

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
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-5"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la connexion
          </Link>

          <div className="w-full p-7 md:p-8 rounded-3xl border border-white/45 bg-white/80 backdrop-blur-xl shadow-panel">
            <div className="flex items-center gap-3 mb-5">
              <div className="rounded-xl bg-brand-gradient p-2.5">
                <Radar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold">Créer un compte</h1>
                <p className="text-sm text-muted-foreground">Nouveau collaborateur PsychoScan IOS</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AuthField id="name" label="Nom" value={name} onChange={setName} error={errors.name} autoComplete="name" />
              <AuthField
                id="email"
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                error={errors.email}
                autoComplete="email"
              />
              <AuthField
                id="password"
                label="Mot de passe"
                type="password"
                value={password}
                onChange={setPassword}
                error={errors.password}
                autoComplete="new-password"
              />
              <AuthField
                id="confirmPassword"
                label="Confirmer le mot de passe"
                type="password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                error={errors.confirm}
                autoComplete="new-password"
              />

              {error ? (
                <p className="text-sm text-destructive rounded-lg bg-destructive/10 px-3 py-2 transition-all">{error}</p>
              ) : null}
              {success ? (
                <p className="text-sm text-emerald-700 rounded-lg bg-emerald-100 px-3 py-2 inline-flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {success}
                </p>
              ) : null}

              <Button type="submit" className="w-full rounded-xl" disabled={formInvalid}>
                {submitting ? 'Création…' : 'Créer mon compte'}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}


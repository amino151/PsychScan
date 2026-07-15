import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MailCheck, MailWarning } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthField from '@/components/auth/AuthField';
import { appApi } from '@/services/appApi';
import { normalizeEmail, validateEmail } from '@/lib/auth-utils';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const emailError = useMemo(
    () => (email.length > 0 && !validateEmail(email) ? 'Veuillez saisir une adresse email valide.' : ''),
    [email]
  );
  const formInvalid = !validateEmail(email) || submitting;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (formInvalid) {
      setError(emailError || 'Veuillez corriger le formulaire.');
      return;
    }

    setSubmitting(true);
    try {
      await appApi.auth.requestPasswordReset(normalizeEmail(email));
      setSuccess(
        'Si cette adresse est enregistrée, un lien de réinitialisation vient d’être envoyé. Vérifiez votre boîte (et les courriers indésirables).'
      );
    } catch (err) {
      setError(err?.message || 'Impossible d’envoyer le lien pour le moment.');
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
            <h1 className="text-2xl font-display font-bold">Mot de passe oublié</h1>
            <p className="text-sm text-muted-foreground mt-1 mb-6">
              Saisissez votre email pour recevoir un lien de réinitialisation.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AuthField
                id="email"
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                error={emailError}
                autoComplete="email"
              />

              {error ? (
                <p className="text-sm text-destructive rounded-lg bg-destructive/10 px-3 py-2 inline-flex items-center gap-2">
                  <MailWarning className="w-4 h-4" />
                  {error}
                </p>
              ) : null}
              {success ? (
                <p className="text-sm text-emerald-700 rounded-lg bg-emerald-100 px-3 py-2 inline-flex items-center gap-2">
                  <MailCheck className="w-4 h-4" />
                  {success}
                </p>
              ) : null}

              <Button type="submit" className="w-full rounded-xl" disabled={formInvalid}>
                {submitting ? 'Envoi…' : 'Envoyer le lien'}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}


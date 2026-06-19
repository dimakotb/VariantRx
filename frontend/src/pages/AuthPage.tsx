import { useState, type FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/ui/Logo';
import { env } from '@/config/env';
import {
  MIN_PASSWORD_LENGTH,
  validateLoginForm,
  validateRegisterForm,
} from '@/utils/validateAuth';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const { login, register, error: authError, loading } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError('');

    const validationError = isLogin
      ? validateLoginForm(email, password)
      : validateRegisterForm(username, email, password);

    if (validationError) {
      setLocalError(validationError);
      return;
    }

    if (isLogin) await login(email.trim(), password);
    else await register(username.trim(), email.trim(), password);
  };

  const displayError = localError || authError;

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,142,255,0.06),var(--bg),var(--bg))] pointer-events-none" />

      <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded p-8 relative z-10">
        <div className="flex flex-col items-center mb-8 gap-2">
          <Logo size={32} />
          <div className="font-mono text-sm font-bold tracking-[0.12em] text-[var(--accent)]">
            {env.appName.toUpperCase()}
          </div>
          <p className="text-[var(--muted)] text-[9px] uppercase tracking-wider font-mono text-center">
            {env.appTagline}
          </p>
        </div>

        <h2 className="text-sm font-bold text-[var(--text)] mb-6 text-center tracking-wide font-mono uppercase">
          {isLogin ? 'Researcher Portal Login' : 'Create Researcher Account'}
        </h2>

        {displayError && (
          <div className="mb-6 p-3 bg-[rgba(255,91,91,0.1)] border border-[rgba(255,91,91,0.3)] text-[var(--danger)] text-xs rounded font-mono">
            {displayError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {!isLogin && (
            <div>
              <label className="block text-[var(--muted)] text-[10px] uppercase tracking-wider mb-2 font-mono">
                Username
              </label>
              <input
                type="text"
                placeholder="e.g. jdoe_lab"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                autoComplete="username"
                className="w-full bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-sm px-4 py-3 rounded font-mono focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
          )}
          <div>
            <label className="block text-[var(--muted)] text-[10px] uppercase tracking-wider mb-2 font-mono">
              Email
            </label>
            <input
              type="email"
              placeholder="name@lab.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
              className="w-full bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-sm px-4 py-3 rounded font-mono focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
          <div>
            <label className="block text-[var(--muted)] text-[10px] uppercase tracking-wider mb-2 font-mono">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              minLength={isLogin ? undefined : MIN_PASSWORD_LENGTH}
              className="w-full bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-sm px-4 py-3 rounded font-mono focus:outline-none focus:border-[var(--accent)]"
            />
            {!isLogin && (
              <p className="mt-1.5 text-[9px] text-[var(--muted2)] font-mono">
                At least {MIN_PASSWORD_LENGTH} characters
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--accent)] hover:opacity-90 text-white text-sm font-semibold py-3 rounded font-mono uppercase tracking-wider cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Processing…' : isLogin ? 'Initialize Session' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setLocalError('');
            }}
            className="text-xs text-[var(--accent)] hover:text-[var(--text)] font-mono uppercase tracking-wider cursor-pointer"
          >
            {isLogin ? 'Need credentials? Register' : 'Existing researcher? Login'}
          </button>
        </div>
      </div>

      <p className="mt-8 text-[var(--muted2)] text-[10px] uppercase tracking-widest font-mono">
        Authorized access only · Session logged
      </p>
    </div>
  );
}

import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Error al iniciar sesión';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0E0F19] px-4 text-white">
      <div className="w-full max-w-md rounded-lg border border-white/10 bg-[#161825] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <div className="mb-6 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#FF8C00]">
            Banexcoin
          </p>
          <h1 className="text-2xl font-bold text-white">BanexReintegra</h1>
          <p className="mt-1 text-sm text-[#85889E]">Ingresa con tu correo electronico</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#0E0F19] px-3 py-2 text-sm text-white outline-none transition placeholder:text-[#85889E] focus:border-[#5346F6] focus:ring-1 focus:ring-[#5346F6]"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#0E0F19] px-3 py-2 text-sm text-white outline-none transition placeholder:text-[#85889E] focus:border-[#5346F6] focus:ring-1 focus:ring-[#5346F6]"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#5346F6] px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_38px_rgba(83,70,246,0.3)] transition hover:bg-[#6257ff] disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}

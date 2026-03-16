import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

const AUTH_HASH = import.meta.env.VITE_AUTH_HASH as string;
const SESSION_KEY = 'portfolio-editor-auth';
const CUSTOM_HASH_KEY = 'portfolio-custom-hash';

export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function getActiveHash(): string {
  return localStorage.getItem(CUSTOM_HASH_KEY) || AUTH_HASH;
}

export function setCustomHash(hash: string) {
  localStorage.setItem(CUSTOM_HASH_KEY, hash);
}

export function isAuthenticated(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === 'true';
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  window.location.reload();
}

interface LoginScreenProps {
  onAuth: () => void;
}

export function LoginScreen({ onAuth }: LoginScreenProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError('');
    try {
      const hash = await sha256(password);
      if (hash === getActiveHash()) {
        sessionStorage.setItem(SESSION_KEY, 'true');
        onAuth();
      } else {
        setError('Incorrect password.');
        setPassword('');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f4f0] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo mark */}
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center">
            <Lock size={18} className="text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center tracking-tight text-gray-900 mb-1">
          Portfolio Editor
        </h1>
        <p className="text-sm text-center text-gray-400 mb-8">
          Private access only
        </p>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoFocus
                className="w-full pr-10 pl-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={!password || loading}
            className="w-full py-2.5 text-sm font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors"
          >
            {loading ? 'Checking…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

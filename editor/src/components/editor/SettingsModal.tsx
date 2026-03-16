import { useState } from 'react';
import { X, Key } from 'lucide-react';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { loadPortfolioFromGitHub } from '../../lib/github';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { token, setToken, setData } = usePortfolio();
  const [draft, setDraft] = useState(token);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleLoadFromGitHub() {
    if (!draft) return;
    setLoading(true);
    setError('');
    try {
      const data = await loadPortfolioFromGitHub(draft);
      setToken(draft);
      setData(data);
      setSuccess('Portfolio loaded from GitHub!');
      setTimeout(onClose, 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  function handleSave() {
    setToken(draft);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-bold text-lg">Settings</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              GitHub Personal Access Token
            </label>
            <div className="relative">
              <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 font-mono"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              Needs <code>repo</code> scope. Stored locally in your browser only.
            </p>
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          {success && <p className="text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">{success}</p>}

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleLoadFromGitHub}
              disabled={!draft || loading}
              className="flex-1 py-2.5 text-sm bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Loading...' : 'Load from GitHub'}
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 text-sm bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Save Token
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

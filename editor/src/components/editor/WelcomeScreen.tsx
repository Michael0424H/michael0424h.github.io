import { useState } from 'react';
import { Download, PenLine, Clock } from 'lucide-react';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { loadPortfolioFromGitHub } from '../../lib/github';
import { SettingsModal } from './SettingsModal';

const STARTER_DATA = {
  site: { title: 'My Portfolio', author: 'Your Name', tagline: 'Designer.' },
  navigation: [{ id: 'home', label: 'Work', slug: '#/', published: true }],
  pages: [
    {
      id: 'home',
      title: 'Home',
      slug: '/',
      status: 'published' as const,
      modules: [
        { id: crypto.randomUUID(), type: 'hero' as const, data: { heading: 'Design that moves people.', subheading: "I'm a designer who believes clarity and craft create experiences worth remembering.", ctaLabel: 'View Work', ctaTarget: '#projects' } },
        { id: crypto.randomUUID(), type: 'project-grid' as const, data: { heading: 'Selected Work', projectIds: [] } },
      ],
    },
  ],
};

export function WelcomeScreen() {
  const { token, setData, hasSavedDraft, loadDraft } = usePortfolio();
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLoadFromGitHub() {
    if (!token) { setShowSettings(true); return; }
    setLoading(true);
    setError('');
    try {
      const data = await loadPortfolioFromGitHub(token);
      setData(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
      setShowSettings(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-6">
        <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <PenLine size={24} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">Portfolio Editor</h1>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          Build and manage your design portfolio. Load your site from GitHub or pick up where you left off.
        </p>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-lg px-4 py-2 mb-4">{error}</p>
        )}

        <div className="flex flex-col gap-3">
          {/* Continue from saved draft — shown when localStorage has data */}
          {hasSavedDraft && (
            <button
              onClick={loadDraft}
              className="flex items-center justify-center gap-2 py-3 px-6 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors"
            >
              <Clock size={16} />
              Continue from saved draft
            </button>
          )}

          <button
            onClick={handleLoadFromGitHub}
            disabled={loading}
            className="flex items-center justify-center gap-2 py-3 px-6 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <Download size={16} />
            {loading ? 'Loading from GitHub...' : 'Load from GitHub'}
          </button>

          <button
            onClick={() => setData(STARTER_DATA)}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors py-2"
          >
            Start with blank portfolio
          </button>
        </div>

        <button
          onClick={() => setShowSettings(true)}
          className="mt-5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          {token ? 'Update GitHub token' : 'Add GitHub token'}
        </button>
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}

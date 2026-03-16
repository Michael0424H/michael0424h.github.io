import { useState, useEffect } from 'react';
import { Eye, Upload, Settings, ExternalLink, Loader2, Check, LogOut, Undo2, Redo2, Globe, Navigation, KeyRound } from 'lucide-react';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { publishPortfolioToGitHub, PORTFOLIO_SITE_URL } from '../../lib/github';
import { SettingsModal } from './SettingsModal';
import { SiteSettingsModal } from './SiteSettingsModal';
import { NavOrderModal } from './NavOrderModal';
import { logout } from '../auth/LoginScreen';
import { ChangePasswordModal } from '../auth/ChangePasswordModal';
import { cn } from '../../lib/utils';

interface EditorHeaderProps {
  onPreviewToggle: () => void;
  isPreviewing: boolean;
}

export function EditorHeader({ onPreviewToggle, isPreviewing }: EditorHeaderProps) {
  const { data, token, isDirty, canUndo, canRedo, undo, redo } = usePortfolio();
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showSiteSettings, setShowSiteSettings] = useState(false);
  const [showNavOrder, setShowNavOrder] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Global keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      // Don't hijack shortcuts when typing in an input/textarea/contenteditable
      const tag = (e.target as HTMLElement).tagName;
      const isEditing = tag === 'INPUT' || tag === 'TEXTAREA' ||
        (e.target as HTMLElement).contentEditable === 'true';

      if (e.key === 'z' && !e.shiftKey) {
        if (isEditing) return; // let native undo work in text fields
        e.preventDefault();
        undo();
      }
      if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
        if (isEditing) return;
        e.preventDefault();
        redo();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [undo, redo]);

  async function handlePublish() {
    if (!data || !token) { setShowSettings(true); return; }
    setPublishing(true);
    setError('');
    try {
      await publishPortfolioToGitHub(token, data);
      setPublished(true);
      setTimeout(() => setPublished(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Publish failed');
    } finally {
      setPublishing(false);
    }
  }

  return (
    <>
      <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-5 shrink-0 z-10">
        {/* Left: wordmark + undo/redo */}
        <div className="flex items-center gap-3">
          <span className="font-bold text-base tracking-tight">MH Portfolio Editor</span>

          {data && (
            <div className="flex items-center gap-0.5">
              <button
                onClick={undo}
                disabled={!canUndo}
                title="Undo (⌘Z)"
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Undo2 size={15} />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                title="Redo (⌘⇧Z)"
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Redo2 size={15} />
              </button>
            </div>
          )}

          {isDirty && (
            <span className="text-xs text-amber-500 font-medium bg-amber-50 px-2 py-0.5 rounded-full">
              Unsaved
            </span>
          )}
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1.5">
          {error && <span className="text-xs text-red-500 mr-2">{error}</span>}

          {/* Site settings */}
          {data && (
            <button
              onClick={() => setShowSiteSettings(true)}
              title="Site Settings"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <Globe size={14} />
              <span className="hidden sm:inline text-xs font-medium">Site</span>
            </button>
          )}

          {/* Nav order */}
          {data && (
            <button
              onClick={() => setShowNavOrder(true)}
              title="Edit Navigation"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <Navigation size={14} />
              <span className="hidden sm:inline text-xs font-medium">Nav</span>
            </button>
          )}

          <div className="w-px h-5 bg-gray-100 mx-0.5" />

          <a
            href={PORTFOLIO_SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors px-2.5 py-1.5"
          >
            <ExternalLink size={14} />
            <span className="hidden sm:inline text-xs">View Site</span>
          </a>

          <button
            onClick={onPreviewToggle}
            className={cn(
              'flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors',
              isPreviewing ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            <Eye size={14} />
            <span className="text-xs">{isPreviewing ? 'Editor' : 'Preview'}</span>
          </button>

          <button
            onClick={handlePublish}
            disabled={publishing}
            className="flex items-center gap-1.5 text-sm bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {publishing ? <Loader2 size={14} className="animate-spin" /> :
             published ? <Check size={14} /> : <Upload size={14} />}
            <span className="text-xs">{published ? 'Published!' : 'Publish'}</span>
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            title="GitHub Settings"
          >
            <Settings size={15} />
          </button>

          <button
            onClick={() => setShowChangePassword(true)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            title="Change Password"
          >
            <KeyRound size={15} />
          </button>

          <button
            onClick={() => { if (confirm('Sign out of the editor?')) logout(); }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            title="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showSiteSettings && <SiteSettingsModal onClose={() => setShowSiteSettings(false)} />}
      {showNavOrder && <NavOrderModal onClose={() => setShowNavOrder(false)} />}
      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}
    </>
  );
}

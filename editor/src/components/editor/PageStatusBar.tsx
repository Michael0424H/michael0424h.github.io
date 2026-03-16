import { useState } from 'react';
import { Radio } from 'lucide-react';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { cn } from '../../lib/utils';

function slugify(raw: string): string {
  return '/' + raw.replace(/^\/+/, '').toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/-$/, '');
}

export function PageStatusBar() {
  const { activePage, data, updatePage, setPageStatus } = usePortfolio();
  const [editingSlug, setEditingSlug] = useState(false);
  const [slugDraft, setSlugDraft] = useState('');

  if (!activePage) return null;

  const isLive = activePage.status === 'published';
  const inNav = data?.navigation.some(n => n.id === activePage.id);

  function handleToggle() {
    setPageStatus(activePage!.id, isLive ? 'draft' : 'published');
  }

  function startSlugEdit() {
    setSlugDraft(activePage!.slug);
    setEditingSlug(true);
  }

  function commitSlug() {
    const clean = slugify(slugDraft || activePage!.slug);
    updatePage(activePage!.id, { slug: clean });
    setEditingSlug(false);
  }

  return (
    <div className="flex items-center justify-between px-6 py-2 bg-white border-b border-gray-100 shrink-0 gap-4">
      {/* Left: title + slug */}
      <div className="flex items-center gap-3 min-w-0">
        <input
          value={activePage.title}
          onChange={e => updatePage(activePage.id, { title: e.target.value })}
          className="text-sm font-semibold text-gray-800 bg-transparent border-none outline-none truncate max-w-[180px]"
          placeholder="Page title"
        />

        {/* Slug */}
        <div className="flex items-center gap-1 min-w-0">
          {editingSlug ? (
            <input
              autoFocus
              value={slugDraft}
              onChange={e => setSlugDraft(e.target.value)}
              onBlur={commitSlug}
              onKeyDown={e => { if (e.key === 'Enter') commitSlug(); if (e.key === 'Escape') setEditingSlug(false); }}
              className="text-xs font-mono text-gray-500 bg-gray-100 border border-gray-300 rounded px-1.5 py-0.5 w-36 outline-none focus:ring-1 focus:ring-gray-900"
            />
          ) : (
            <button
              onClick={startSlugEdit}
              title="Edit URL slug"
              className="text-xs font-mono text-gray-400 hover:text-gray-700 hover:bg-gray-100 px-1.5 py-0.5 rounded transition-colors truncate max-w-[140px]"
            >
              {activePage.slug}
            </button>
          )}
        </div>

        {inNav && (
          <span className="text-xs text-blue-500 font-medium shrink-0">in nav</span>
        )}
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Draft / Live toggle */}
        <button
          onClick={handleToggle}
          title={isLive ? 'Click to set back to Draft' : 'Click to go Live'}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border',
            isLive
              ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
              : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
          )}
        >
          <div className={cn('w-7 h-4 rounded-full flex items-center transition-colors shrink-0', isLive ? 'bg-green-500' : 'bg-amber-300')}>
            <div className={cn('w-3 h-3 rounded-full bg-white shadow-sm transition-transform mx-0.5', isLive ? 'translate-x-3' : 'translate-x-0')} />
          </div>
          <span>{isLive ? 'Live' : 'Draft'}</span>
          {isLive && <Radio size={11} className="animate-pulse" />}
        </button>

        <span className="text-xs text-gray-400 italic">Auto-saved</span>
      </div>
    </div>
  );
}

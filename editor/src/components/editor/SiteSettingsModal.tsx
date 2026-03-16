import { useState } from 'react';
import { X, Globe } from 'lucide-react';
import { usePortfolio } from '../../contexts/PortfolioContext';

interface SiteSettingsModalProps {
  onClose: () => void;
}

const inputCls = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 transition';

export function SiteSettingsModal({ onClose }: SiteSettingsModalProps) {
  const { data, updateSite } = usePortfolio();
  const [title, setTitle] = useState(data?.site.title ?? '');
  const [author, setAuthor] = useState(data?.site.author ?? '');
  const [tagline, setTagline] = useState(data?.site.tagline ?? '');
  const [saved, setSaved] = useState(false);

  function handleSave() {
    updateSite({ title, author, tagline });
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 800);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-gray-400" />
            <h2 className="font-bold text-base">Site Settings</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Site Title</label>
            <input className={inputCls} value={title} onChange={e => setTitle(e.target.value)} placeholder="MH — Design Portfolio" />
            <p className="text-xs text-gray-400 mt-1">Appears in the browser tab.</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Author Name</label>
            <input className={inputCls} value={author} onChange={e => setAuthor(e.target.value)} placeholder="MH" />
            <p className="text-xs text-gray-400 mt-1">Appears in the footer and nav logo.</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Tagline</label>
            <input className={inputCls} value={tagline} onChange={e => setTagline(e.target.value)} placeholder="Designer crafting thoughtful digital experiences." />
            <p className="text-xs text-gray-400 mt-1">Short descriptor shown on the site.</p>
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 text-sm bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            {saved ? 'Saved ✓' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

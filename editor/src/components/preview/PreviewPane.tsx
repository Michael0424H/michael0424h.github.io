import { useEffect, useState } from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { cn } from '../../lib/utils';

const PORTFOLIO_URL = 'https://michael0424h.github.io';
const PREVIEW_KEY = 'portfolio-preview';

type ViewMode = 'desktop' | 'mobile';

export function PreviewPane() {
  const { data } = usePortfolio();
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [key, setKey] = useState(0);

  // Write draft data to localStorage — shared with the portfolio iframe (same origin)
  useEffect(() => {
    if (data) {
      localStorage.setItem(PREVIEW_KEY, JSON.stringify(data));
      setKey(k => k + 1); // reload iframe to pick up new data
    }
    return () => {
      // Clean up preview data when preview pane unmounts
      localStorage.removeItem(PREVIEW_KEY);
    };
  }, [data]);

  const previewSrc = `${PORTFOLIO_URL}/?preview=1`;

  return (
    <div className="flex-1 flex flex-col bg-gray-100">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-100">
        <span className="text-sm font-medium text-gray-600">Draft Preview</span>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('desktop')}
            className={cn('p-1.5 rounded-md transition-colors', viewMode === 'desktop' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-700')}
          >
            <Monitor size={14} />
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            className={cn('p-1.5 rounded-md transition-colors', viewMode === 'mobile' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-700')}
          >
            <Smartphone size={14} />
          </button>
        </div>
        <a
          href={PORTFOLIO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
        >
          Open live site ↗
        </a>
      </div>

      {/* Frame */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
        <div
          className={cn(
            'bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300',
            viewMode === 'desktop' ? 'w-full h-full' : 'w-[390px] h-[844px]'
          )}
        >
          <iframe
            key={key}
            src={previewSrc}
            title="Portfolio Preview"
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        </div>
      </div>

      <div className="px-5 py-2 border-t border-gray-100 bg-white">
        <p className="text-xs text-gray-400">
          Showing your <strong>draft</strong> changes. Click <strong>Publish</strong> to push to the live site.
        </p>
      </div>
    </div>
  );
}

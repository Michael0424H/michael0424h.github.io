import { usePortfolio } from '../../contexts/PortfolioContext';
import { MODULE_LABELS, MODULE_DESCRIPTIONS, MODULE_COLORS, type ModuleType } from '../../types/portfolio';
import { Layout, Grid, Image, User, AlignLeft, Film, Clock, Columns2, Tag, LayoutGrid, Minus, MousePointerClick } from 'lucide-react';
import { cn } from '../../lib/utils';

const ICONS: Record<ModuleType, React.ReactNode> = {
  'hero': <Layout size={14} />,
  'project-grid': <Grid size={14} />,
  'text': <AlignLeft size={14} />,
  'use-case': <Film size={14} />,
  'project-hero': <Image size={14} />,
  'about': <User size={14} />,
  'image': <Image size={14} />,
  'timeline': <Clock size={14} />,
  'two-column': <Columns2 size={14} />,
  'skills': <Tag size={14} />,
  'gallery': <LayoutGrid size={14} />,
  'divider': <Minus size={14} />,
  'cta-button': <MousePointerClick size={14} />,
};

const GROUPS: { label: string; types: ModuleType[] }[] = [
  { label: 'Layout', types: ['hero', 'text', 'two-column', 'divider', 'cta-button'] },
  { label: 'Media', types: ['image', 'gallery'] },
  { label: 'Portfolio', types: ['project-grid', 'project-hero', 'use-case'] },
  { label: 'Resume / About', types: ['about', 'timeline', 'skills'] },
];

export function ModuleToolbox() {
  const { addModule } = usePortfolio();

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-100">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Add Module</span>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {GROUPS.map(group => (
          <div key={group.label}>
            <p className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-300 uppercase tracking-widest">{group.label}</p>
            {group.types.map(type => (
              <button
                key={type}
                onClick={() => addModule(type)}
                className="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50 text-left transition-colors group"
              >
                <span className={cn('mt-0.5 p-1 rounded shrink-0 transition-colors', MODULE_COLORS[type])}>
                  {ICONS[type]}
                </span>
                <div>
                  <div className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                    {MODULE_LABELS[type]}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5 leading-tight">
                    {MODULE_DESCRIPTIONS[type]}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

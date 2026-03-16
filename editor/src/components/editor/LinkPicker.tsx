import { usePortfolio } from '../../contexts/PortfolioContext';

interface LinkPickerProps {
  value: string;
  onChange: (value: string) => void;
  onTypeChange?: (type: 'internal' | 'external') => void;
}

const inputCls = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 transition';
const selectCls = inputCls;

function isExternal(value: string) {
  return value.startsWith('http') || value.startsWith('mailto:') || value.startsWith('//');
}

function slugToHash(slug: string) {
  if (slug === '/') return '#/';
  return `#${slug}`;
}

export function LinkPicker({ value, onChange, onTypeChange }: LinkPickerProps) {
  const { data } = usePortfolio();
  const type = isExternal(value) ? 'external' : 'internal';

  const pages = data?.pages ?? [];
  const allProjects = pages.flatMap(p => p.projects ?? []);

  const switchTo = (next: 'internal' | 'external') => {
    if (next === type) return;
    if (next === 'internal') {
      onChange('#/');
    } else {
      onChange('https://');
    }
    onTypeChange?.(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-1 p-0.5 bg-gray-100 rounded-lg">
        {(['internal', 'external'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => switchTo(t)}
            className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors capitalize ${
              type === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'internal' ? 'Internal link' : 'External URL'}
          </button>
        ))}
      </div>

      {type === 'internal' ? (
        <select
          className={selectCls}
          value={value}
          onChange={e => onChange(e.target.value)}
        >
          <option value="">— Select destination —</option>
          <optgroup label="Pages">
            {pages.map(p => (
              <option key={p.id} value={slugToHash(p.slug)}>
                {p.title}
              </option>
            ))}
          </optgroup>
          {allProjects.length > 0 && (
            <optgroup label="Projects">
              {allProjects.map(p => (
                <option key={p.id} value={`#/project/${p.id}`}>
                  {p.title}
                </option>
              ))}
            </optgroup>
          )}
          <optgroup label="Anchors">
            <option value="#projects">#projects</option>
            <option value="#about">#about</option>
          </optgroup>
        </select>
      ) : (
        <input
          className={inputCls}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="https://example.com"
        />
      )}
    </div>
  );
}

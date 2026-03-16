import { usePortfolio } from '../../contexts/PortfolioContext';
import type {
  Module, HeroData, ProjectGridData, TextData, UseCaseData, ProjectHeroData,
  AboutData, ImageData, TimelineData, TwoColumnData, SkillsData, GalleryData,
  DividerData, CtaButtonData, LiveDemoData,
} from '../../types/portfolio';
import { RichTextEditor } from './RichTextEditor';
import { ImageUploader } from './ImageUploader';
import { LinkPicker } from './LinkPicker';
import { Plus, Trash2 } from 'lucide-react';

interface ModuleEditorProps {
  module: Module;
  onUpdate?: (key: string, value: unknown) => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 transition';
const selectCls = inputCls;

export function ModuleEditor({ module, onUpdate: externalUpdate }: ModuleEditorProps) {
  const { updateModule, data } = usePortfolio();
  const update = (key: string, value: unknown) => {
    if (externalUpdate) externalUpdate(key, value);
    else updateModule(module.id, { [key]: value });
  };

  switch (module.type) {

    case 'hero': {
      const d = module.data as HeroData;
      return (
        <div className="space-y-4">
          <Field label="Heading">
            <input className={inputCls} value={d.heading} onChange={e => update('heading', e.target.value)} />
          </Field>
          <Field label="Subheading">
            <RichTextEditor value={d.subheading} onChange={v => update('subheading', v)} placeholder="Add a subheading…" minHeight="60px" />
          </Field>
          <Field label="CTA Label">
            <input className={inputCls} value={d.ctaLabel} onChange={e => update('ctaLabel', e.target.value)} />
          </Field>
          <Field label="CTA Target">
            <LinkPicker value={d.ctaTarget} onChange={v => update('ctaTarget', v)} />
          </Field>
        </div>
      );
    }

    case 'project-grid': {
      const d = module.data as ProjectGridData;
      const allProjects = (data?.pages ?? []).flatMap(p => p.projects ?? []);
      return (
        <div className="space-y-4">
          <Field label="Section Heading">
            <input className={inputCls} value={d.heading} onChange={e => update('heading', e.target.value)} />
          </Field>
          <Field label="Projects">
            {allProjects.length === 0 ? (
              <p className="text-sm text-gray-400 italic px-1">No projects yet. Create a project page first, then return here to add it to the grid.</p>
            ) : (
              <div className="space-y-0.5">
                {allProjects.map(proj => {
                  const checked = d.projectIds.includes(proj.id);
                  return (
                    <label key={proj.id} className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={e => {
                          const ids = e.target.checked
                            ? [...d.projectIds, proj.id]
                            : d.projectIds.filter(id => id !== proj.id);
                          update('projectIds', ids);
                        }}
                        className="rounded shrink-0"
                      />
                      <span className="flex-1 text-sm text-gray-700 truncate">{proj.title}</span>
                      {proj.category && <span className="text-xs text-gray-400 shrink-0">{proj.category}</span>}
                      {proj.status === 'draft' && (
                        <span className="text-xs bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded shrink-0">draft</span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          </Field>
        </div>
      );
    }

    case 'text': {
      const d = module.data as TextData;
      return (
        <div className="space-y-4">
          <Field label="Label">
            <input className={inputCls} value={d.label} onChange={e => update('label', e.target.value)} />
          </Field>
          <Field label="Heading">
            <input className={inputCls} value={d.heading} onChange={e => update('heading', e.target.value)} />
          </Field>
          <Field label="Body">
            <RichTextEditor value={d.body} onChange={v => update('body', v)} placeholder="Write your content here…" />
          </Field>
        </div>
      );
    }

    case 'use-case': {
      const d = module.data as UseCaseData;
      return (
        <div className="space-y-4">
          <Field label="Label">
            <input className={inputCls} value={d.label} onChange={e => update('label', e.target.value)} />
          </Field>
          <Field label="Heading">
            <input className={inputCls} value={d.heading} onChange={e => update('heading', e.target.value)} />
          </Field>
          <Field label="Body">
            <RichTextEditor value={d.body} onChange={v => update('body', v)} placeholder="Describe this use case…" />
          </Field>
          <ImageUploader label="Image" value={d.image} onChange={url => update('image', url)} />
          <Field label="Image Position">
            <select className={selectCls} value={d.imagePosition ?? 'right'} onChange={e => update('imagePosition', e.target.value)}>
              <option value="right">Right</option>
              <option value="left">Left</option>
            </select>
          </Field>
        </div>
      );
    }

    case 'project-hero': {
      const d = module.data as ProjectHeroData;
      return (
        <div className="space-y-4">
          <Field label="Title"><input className={inputCls} value={d.title} onChange={e => update('title', e.target.value)} /></Field>
          <Field label="Category"><input className={inputCls} value={d.category} onChange={e => update('category', e.target.value)} /></Field>
          <Field label="Year"><input className={inputCls} value={d.year} onChange={e => update('year', e.target.value)} /></Field>
          <ImageUploader label="Hero Image" value={d.image} onChange={url => update('image', url)} />
        </div>
      );
    }

    case 'about': {
      const d = module.data as AboutData;
      return (
        <div className="space-y-4">
          <Field label="Heading">
            <input className={inputCls} value={d.heading} onChange={e => update('heading', e.target.value)} />
          </Field>
          <Field label="Bio">
            <RichTextEditor value={d.body} onChange={v => update('body', v)} placeholder="Tell your story…" minHeight="120px" />
          </Field>
          <ImageUploader label="Photo" value={d.image} onChange={url => update('image', url)} />
        </div>
      );
    }

    case 'image': {
      const d = module.data as ImageData;
      return (
        <div className="space-y-4">
          <ImageUploader label="Image" value={d.src} onChange={url => update('src', url)} />
          <Field label="Alt Text"><input className={inputCls} value={d.alt} onChange={e => update('alt', e.target.value)} /></Field>
          <Field label="Caption"><input className={inputCls} value={d.caption ?? ''} onChange={e => update('caption', e.target.value)} /></Field>
        </div>
      );
    }

    case 'timeline': {
      const d = module.data as TimelineData;
      return (
        <div className="space-y-4">
          <Field label="Section Heading">
            <input className={inputCls} value={d.heading} onChange={e => update('heading', e.target.value)} />
          </Field>
          <Field label="Entries">
            <div className="space-y-3">
              {d.items.map((item, i) => (
                <div key={item.id} className="p-3 bg-gray-50 rounded-lg space-y-2">
                  <div className="flex gap-2">
                    <input className={inputCls} placeholder="Role / Title" value={item.role} onChange={e => {
                      const items = [...d.items]; items[i] = { ...item, role: e.target.value }; update('items', items);
                    }} />
                    <button onClick={() => update('items', d.items.filter((_, j) => j !== i))}
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <input className={inputCls} placeholder="Company / Organization" value={item.company} onChange={e => {
                    const items = [...d.items]; items[i] = { ...item, company: e.target.value }; update('items', items);
                  }} />
                  <input className={inputCls} placeholder="Dates (e.g. 2022 – Present)" value={item.dates} onChange={e => {
                    const items = [...d.items]; items[i] = { ...item, dates: e.target.value }; update('items', items);
                  }} />
                  <textarea className={`${inputCls} resize-none`} rows={2} placeholder="Description" value={item.description} onChange={e => {
                    const items = [...d.items]; items[i] = { ...item, description: e.target.value }; update('items', items);
                  }} />
                </div>
              ))}
              <button
                onClick={() => update('items', [...d.items, { id: crypto.randomUUID(), role: '', company: '', dates: '', description: '' }])}
                className="w-full py-2 text-sm text-gray-500 border-2 border-dashed border-gray-200 rounded-lg hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center gap-1"
              >
                <Plus size={13} /> Add Entry
              </button>
            </div>
          </Field>
        </div>
      );
    }

    case 'two-column': {
      const d = module.data as TwoColumnData;
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Left Column</p>
              <div className="space-y-3">
                <input className={inputCls} placeholder="Heading" value={d.leftHeading} onChange={e => update('leftHeading', e.target.value)} />
                <RichTextEditor value={d.leftBody} onChange={v => update('leftBody', v)} placeholder="Left column content…" minHeight="80px" />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Right Column</p>
              <div className="space-y-3">
                <input className={inputCls} placeholder="Heading" value={d.rightHeading} onChange={e => update('rightHeading', e.target.value)} />
                <RichTextEditor value={d.rightBody} onChange={v => update('rightBody', v)} placeholder="Right column content…" minHeight="80px" />
              </div>
            </div>
          </div>
        </div>
      );
    }

    case 'skills': {
      const d = module.data as SkillsData;
      return (
        <div className="space-y-4">
          <Field label="Section Heading">
            <input className={inputCls} value={d.heading} onChange={e => update('heading', e.target.value)} />
          </Field>
          <Field label="Skill Groups">
            <div className="space-y-2">
              {d.groups.map((group, i) => (
                <div key={group.id} className="p-3 bg-gray-50 rounded-lg space-y-2">
                  <div className="flex gap-2">
                    <input className={inputCls} placeholder="Group label (e.g. Design)" value={group.label} onChange={e => {
                      const groups = [...d.groups]; groups[i] = { ...group, label: e.target.value }; update('groups', groups);
                    }} />
                    <button onClick={() => update('groups', d.groups.filter((_, j) => j !== i))}
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <input className={inputCls} placeholder="Skills (comma-separated)" value={group.items} onChange={e => {
                    const groups = [...d.groups]; groups[i] = { ...group, items: e.target.value }; update('groups', groups);
                  }} />
                </div>
              ))}
              <button
                onClick={() => update('groups', [...d.groups, { id: crypto.randomUUID(), label: '', items: '' }])}
                className="w-full py-2 text-sm text-gray-500 border-2 border-dashed border-gray-200 rounded-lg hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center gap-1"
              >
                <Plus size={13} /> Add Group
              </button>
            </div>
          </Field>
        </div>
      );
    }

    case 'gallery': {
      const d = module.data as GalleryData;
      return (
        <div className="space-y-4">
          <Field label="Section Heading">
            <input className={inputCls} value={d.heading} onChange={e => update('heading', e.target.value)} placeholder="Optional heading" />
          </Field>
          <Field label="Images">
            <div className="space-y-2">
              {d.images.map((img, i) => (
                <div key={img.id} className="p-3 bg-gray-50 rounded-lg space-y-2">
                  <div className="flex gap-2 items-start">
                    <div className="flex-1 space-y-2">
                      <ImageUploader label="Image" value={img.src} onChange={url => {
                        const images = [...d.images]; images[i] = { ...img, src: url }; update('images', images);
                      }} />
                      <input className={inputCls} placeholder="Alt text" value={img.alt} onChange={e => {
                        const images = [...d.images]; images[i] = { ...img, alt: e.target.value }; update('images', images);
                      }} />
                      <input className={inputCls} placeholder="Caption (optional)" value={img.caption} onChange={e => {
                        const images = [...d.images]; images[i] = { ...img, caption: e.target.value }; update('images', images);
                      }} />
                    </div>
                    <button onClick={() => update('images', d.images.filter((_, j) => j !== i))}
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors shrink-0 mt-6">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => update('images', [...d.images, { id: crypto.randomUUID(), src: '', alt: '', caption: '' }])}
                className="w-full py-2 text-sm text-gray-500 border-2 border-dashed border-gray-200 rounded-lg hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center gap-1"
              >
                <Plus size={13} /> Add Image
              </button>
            </div>
          </Field>
        </div>
      );
    }

    case 'divider': {
      const d = module.data as DividerData;
      return (
        <div className="space-y-4">
          <Field label="Style">
            <select className={selectCls} value={d.style} onChange={e => update('style', e.target.value)}>
              <option value="line">Horizontal line</option>
              <option value="space">Blank space</option>
            </select>
          </Field>
          <Field label="Size">
            <select className={selectCls} value={d.size} onChange={e => update('size', e.target.value)}>
              <option value="sm">Small (1rem)</option>
              <option value="md">Medium (3rem)</option>
              <option value="lg">Large (6rem)</option>
            </select>
          </Field>
        </div>
      );
    }

    case 'cta-button': {
      const d = module.data as CtaButtonData;
      return (
        <div className="space-y-4">
          <Field label="Button Label">
            <input className={inputCls} value={d.label} onChange={e => update('label', e.target.value)} />
          </Field>
          <Field label="URL">
            <LinkPicker
              value={d.url}
              onChange={v => update('url', v)}
              onTypeChange={t => { if (t === 'internal') update('openNewTab', false); }}
            />
          </Field>
          <Field label="Style">
            <select className={selectCls} value={d.style} onChange={e => update('style', e.target.value)}>
              <option value="primary">Primary (filled)</option>
              <option value="outline">Outline</option>
            </select>
          </Field>
          {(d.url.startsWith('http') || d.url.startsWith('//') || d.url.startsWith('mailto:')) && (
            <Field label="Behaviour">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" checked={d.openNewTab} onChange={e => update('openNewTab', e.target.checked)} className="rounded" />
                Open in new tab
              </label>
            </Field>
          )}
        </div>
      );
    }

    case 'live-demo': {
      const d = module.data as LiveDemoData;
      const TAGS = ['Lovable', 'Claude Artifact', 'Figma Export', 'GitHub Pages', 'Other'];
      return (
        <div className="space-y-4">
          <Field label="Title">
            <input className={inputCls} value={d.title} onChange={e => update('title', e.target.value)} />
          </Field>
          <Field label="Description">
            <textarea className={`${inputCls} resize-none`} rows={2} value={d.description} onChange={e => update('description', e.target.value)} />
          </Field>
          <ImageUploader label="Thumbnail" value={d.thumbnail} onChange={url => update('thumbnail', url)} />
          <Field label="Type / Tag">
            <div className="flex gap-1.5 flex-wrap mb-2">
              {TAGS.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => update('tag', t)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${d.tag === t ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <input className={inputCls} value={d.tag} onChange={e => update('tag', e.target.value)} placeholder="Custom tag…" />
          </Field>
          <Field label="Live Demo URL">
            <input className={inputCls} value={d.demoUrl} onChange={e => update('demoUrl', e.target.value)} placeholder="https://lovable.dev/projects/…" />
          </Field>
          <Field label="Source / Repo URL">
            <input className={inputCls} value={d.repoUrl} onChange={e => update('repoUrl', e.target.value)} placeholder="https://github.com/…" />
          </Field>
        </div>
      );
    }

    default:
      return <p className="text-sm text-gray-400">No editor for this module type.</p>;
  }
}

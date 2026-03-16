import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ChevronUp, Trash2, Pencil, Plus, Image, Copy, Layers, ArrowLeft, Radio } from 'lucide-react';
import { usePortfolio } from '../../contexts/PortfolioContext';
import type { Module, ModuleType, ProjectDetail } from '../../types/portfolio';
import { MODULE_LABELS, MODULE_COLORS, createDefaultModule } from '../../types/portfolio';
import { ModuleEditor } from './ModuleEditor';
import { ImageUploader } from './ImageUploader';
import { cn } from '../../lib/utils';

// ─── Sortable module card ───────────────────────────────────────────────────

function SortableModuleCard({ module }: { module: Module }) {
  const { removeModule, duplicateModule } = usePortfolio();
  const [expanded, setExpanded] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-white border border-gray-200 rounded-xl overflow-hidden transition-shadow',
        isDragging && 'shadow-2xl'
      )}
    >
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
        <button {...attributes} {...listeners} data-drag-handle
          className="p-0.5 rounded text-gray-300 hover:text-gray-600 transition-colors">
          <GripVertical size={15} />
        </button>
        <span className={cn('text-xs px-1.5 py-0.5 rounded font-semibold shrink-0', MODULE_COLORS[module.type])}>
          {MODULE_LABELS[module.type]}
        </span>
        <div className="flex items-center gap-1">
          <button onClick={() => duplicateModule(module.id)}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors"
            title="Duplicate module">
            <Copy size={14} />
          </button>
          <button onClick={() => { if (confirm('Remove this module?')) removeModule(module.id); }}
            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            title="Delete module">
            <Trash2 size={14} />
          </button>
          <button onClick={() => setExpanded(v => !v)}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors"
            title={expanded ? 'Collapse' : 'Edit module'}>
            {expanded ? <ChevronUp size={14} /> : <Pencil size={14} />}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="p-4">
          <ModuleEditor module={module} />
        </div>
      )}
    </div>
  );
}

// ─── Project detail module card (uses explicit callbacks, not context) ───────

function SortableProjectModuleCard({
  module,
  onRemove,
  onDuplicate,
  onUpdate,
}: {
  module: Module;
  onRemove: () => void;
  onDuplicate: () => void;
  onUpdate: (key: string, value: unknown) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: module.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn('bg-white border border-gray-200 rounded-xl overflow-hidden transition-shadow', isDragging && 'shadow-2xl')}
    >
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
        <button {...attributes} {...listeners} data-drag-handle
          className="p-0.5 rounded text-gray-300 hover:text-gray-600 transition-colors">
          <GripVertical size={15} />
        </button>
        <span className={cn('text-xs px-1.5 py-0.5 rounded font-semibold shrink-0', MODULE_COLORS[module.type])}>
          {MODULE_LABELS[module.type]}
        </span>
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={onDuplicate}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors"
            title="Duplicate module">
            <Copy size={14} />
          </button>
          <button onClick={() => { if (confirm('Remove this module?')) onRemove(); }}
            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            title="Delete module">
            <Trash2 size={14} />
          </button>
          <button onClick={() => setExpanded(v => !v)}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors"
            title={expanded ? 'Collapse' : 'Edit module'}>
            {expanded ? <ChevronUp size={14} /> : <Pencil size={14} />}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="p-4">
          <ModuleEditor module={module} onUpdate={onUpdate} />
        </div>
      )}
    </div>
  );
}

// ─── Module groups available in a project detail page ────────────────────────

const PROJECT_MODULE_GROUPS: { label: string; types: ModuleType[] }[] = [
  { label: 'Content', types: ['project-hero', 'text', 'two-column', 'use-case'] },
  { label: 'Media', types: ['image', 'gallery'] },
  { label: 'Other', types: ['divider', 'cta-button'] },
];

// ─── Project detail editor ───────────────────────────────────────────────────

function ProjectDetailEditor({
  project,
  onUpdate,
  onBack,
}: {
  project: ProjectDetail;
  onUpdate: (updated: ProjectDetail) => void;
  onBack: () => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const modules = project.modules || [];

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = modules.findIndex(m => m.id === active.id);
    const newIndex = modules.findIndex(m => m.id === over.id);
    onUpdate({ ...project, modules: arrayMove(modules, oldIndex, newIndex) });
  }

  function addModule(type: ModuleType) {
    onUpdate({ ...project, modules: [...modules, createDefaultModule(type)] });
  }

  function removeModule(moduleId: string) {
    onUpdate({ ...project, modules: modules.filter(m => m.id !== moduleId) });
  }

  function duplicateModule(moduleId: string) {
    const idx = modules.findIndex(m => m.id === moduleId);
    if (idx === -1) return;
    const copy = { ...modules[idx], id: crypto.randomUUID() };
    const next = [...modules];
    next.splice(idx + 1, 0, copy);
    onUpdate({ ...project, modules: next });
  }

  function updateModuleField(moduleId: string, key: string, value: unknown) {
    onUpdate({
      ...project,
      modules: modules.map(m => m.id === moduleId ? { ...m, data: { ...m.data, [key]: value } } : m),
    });
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Breadcrumb header */}
      <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-2 z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>All Projects</span>
        </button>
        <span className="text-gray-300 text-sm">/</span>
        <span className="text-sm font-semibold text-gray-800 truncate">{project.title}</span>
      </div>

      <div className="p-6 max-w-2xl mx-auto">
        {modules.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl mb-6">
            <p className="text-gray-400 text-sm">No content modules yet.</p>
            <p className="text-gray-300 text-xs mt-1">Add modules below to build this project's detail page.</p>
          </div>
        )}

        <div className="space-y-3 mb-6">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={modules.map(m => m.id)} strategy={verticalListSortingStrategy}>
              {modules.map(module => (
                <SortableProjectModuleCard
                  key={module.id}
                  module={module}
                  onRemove={() => removeModule(module.id)}
                  onDuplicate={() => duplicateModule(module.id)}
                  onUpdate={(key, value) => updateModuleField(module.id, key, value)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Add Module</p>
          {PROJECT_MODULE_GROUPS.map(group => (
            <div key={group.label} className="mb-4">
              <p className="text-xs text-gray-300 uppercase tracking-widest mb-2">{group.label}</p>
              <div className="grid grid-cols-3 gap-2">
                {group.types.map(type => (
                  <button
                    key={type}
                    onClick={() => addModule(type)}
                    className="flex items-center gap-1.5 px-2 py-2 rounded-lg border border-gray-200 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className={cn('text-xs px-1.5 py-0.5 rounded font-semibold shrink-0', MODULE_COLORS[type])}>
                      {MODULE_LABELS[type]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Projects editor (for project-detail page) ─────────────────────────────

function ProjectCard({
  project,
  onChange,
  onRemove,
  onEditContent,
}: {
  project: ProjectDetail;
  onChange: (updated: ProjectDetail) => void;
  onRemove: () => void;
  onEditContent: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const inputCls = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 transition';

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
        <Image size={14} className="text-gray-400 shrink-0" />
        <span className="flex-1 text-sm font-semibold text-gray-700 truncate">{project.title || 'Untitled Project'}</span>
        <button
          onClick={() => onChange({ ...project, status: project.status === 'published' ? 'draft' : 'published' })}
          className={cn(
            'flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold border transition-all',
            project.status === 'published'
              ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
              : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
          )}
          title="Toggle project live/draft"
        >
          <div className={cn('w-6 h-3.5 rounded-full flex items-center transition-colors shrink-0', project.status === 'published' ? 'bg-green-500' : 'bg-amber-300')}>
            <div className={cn('w-2.5 h-2.5 rounded-full bg-white shadow-sm transition-transform mx-0.5', project.status === 'published' ? 'translate-x-2.5' : 'translate-x-0')} />
          </div>
          <span>{project.status === 'published' ? 'Live' : 'Draft'}</span>
          {project.status === 'published' && <Radio size={10} className="animate-pulse" />}
        </button>
        <div className="flex items-center gap-1">
          <button onClick={() => setExpanded(v => !v)}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors"
            title={expanded ? 'Collapse' : 'Edit metadata'}>
            {expanded ? <ChevronUp size={14} /> : <Pencil size={14} />}
          </button>
          <button
            onClick={onEditContent}
            className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors text-xs font-medium"
            title="Edit page content & modules"
          >
            <Layers size={13} />
            <span>Edit Content</span>
          </button>
          <button onClick={onRemove}
            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            title="Remove project">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-3">
          {[
            { label: 'Title', key: 'title' },
            { label: 'Category', key: 'category' },
            { label: 'Year', key: 'year' },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</label>
              <input
                className={inputCls}
                value={(project as unknown as Record<string, string>)[key] ?? ''}
                onChange={e => onChange({ ...project, [key]: e.target.value })}
              />
            </div>
          ))}

          <ImageUploader label="Cover Image" value={project.image} onChange={url => onChange({ ...project, image: url })} />

          {/* Badge */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Badge</label>
            <select
              className={inputCls}
              value={project.badge ?? ''}
              onChange={e => onChange({ ...project, badge: (e.target.value as ProjectDetail['badge']) || undefined })}
            >
              <option value="">None</option>
              <option value="featured">Featured</option>
              <option value="coming-soon">Coming Soon</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Password protection */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Password Protection
            </label>
            <input
              className={inputCls}
              type="password"
              placeholder="Leave blank for no password"
              onChange={async e => {
                const val = e.target.value;
                if (!val) { onChange({ ...project, passwordHash: undefined }); return; }
                const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(val));
                const hash = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
                onChange({ ...project, passwordHash: hash });
              }}
            />
            {project.passwordHash && <p className="text-xs text-green-600 mt-1">Password set.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectsCanvas() {
  const { activePage, updatePage } = usePortfolio();
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  if (!activePage) return null;

  const page = activePage; // non-null alias for closures
  const projects: ProjectDetail[] = page.projects ?? [];

  if (editingProjectId) {
    const project = projects.find(p => p.id === editingProjectId);
    if (project) {
      return (
        <ProjectDetailEditor
          project={project}
          onUpdate={updated => updatePage(page.id, { projects: projects.map(p => p.id === updated.id ? updated : p) })}
          onBack={() => setEditingProjectId(null)}
        />
      );
    }
  }

  function updateProject(index: number, updated: ProjectDetail) {
    const next = [...projects];
    next[index] = updated;
    updatePage(page.id, { projects: next });
  }

  function removeProject(index: number) {
    if (!confirm('Remove this project?')) return;
    updatePage(page.id, { projects: projects.filter((_, i) => i !== index) });
  }

  function addProject() {
    const newProject: ProjectDetail = {
      id: crypto.randomUUID(),
      title: 'New Project',
      category: 'Category',
      year: String(new Date().getFullYear()),
      image: 'https://placehold.co/800x600/1a1a1a/ffffff?text=FPO',
      status: 'draft',
      modules: [
        { id: crypto.randomUUID(), type: 'project-hero', data: { title: 'New Project', category: 'Category', year: String(new Date().getFullYear()), image: 'https://placehold.co/1200x700/1a1a1a/ffffff?text=Project+Hero' } },
        { id: crypto.randomUUID(), type: 'text', data: { label: 'Overview', heading: 'Project Overview', body: 'Describe your project here.' } },
      ],
    };
    updatePage(page.id, { projects: [...projects, newProject] });
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto space-y-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Projects</h2>
            <p className="text-xs text-gray-400 mt-0.5">Each project becomes a detail page at <code>#/project/id</code></p>
          </div>
          <button
            onClick={addProject}
            className="flex items-center gap-1.5 text-xs font-medium bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Plus size={12} /> Add Project
          </button>
        </div>

        {projects.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
            <p className="text-gray-400 text-sm">No projects yet.</p>
            <p className="text-gray-300 text-xs mt-1">Click "Add Project" to create your first project detail page.</p>
          </div>
        )}

        {projects.map((project, i) => (
          <ProjectCard
            key={project.id}
            project={project}
            onChange={updated => updateProject(i, updated)}
            onRemove={() => removeProject(i)}
            onEditContent={() => setEditingProjectId(project.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main canvas ────────────────────────────────────────────────────────────

export function EditorCanvas() {
  const { activePage, reorderModules } = usePortfolio();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (!activePage) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        Select or create a page to start editing.
      </div>
    );
  }

  // Project-detail pages are identified by their reserved slug
  const isProjectPage = activePage.slug === '/project/:id';
  if (isProjectPage) return <ProjectsCanvas />;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const modules = activePage!.modules;
    const oldIndex = modules.findIndex(m => m.id === active.id);
    const newIndex = modules.findIndex(m => m.id === over.id);
    reorderModules(arrayMove(modules, oldIndex, newIndex));
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto space-y-3">
        {activePage.modules.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
            <p className="text-gray-400 text-sm">No modules yet.</p>
            <p className="text-gray-300 text-xs mt-1">Add modules from the panel on the left.</p>
          </div>
        )}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={activePage.modules.map(m => m.id)} strategy={verticalListSortingStrategy}>
            {activePage.modules.map(module => (
              <SortableModuleCard key={module.id} module={module} />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

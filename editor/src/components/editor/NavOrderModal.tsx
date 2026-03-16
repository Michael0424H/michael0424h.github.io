import { useState } from 'react';
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, arrayMove, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, GripVertical, Plus, Minus, Navigation } from 'lucide-react';
import { usePortfolio } from '../../contexts/PortfolioContext';
import type { PortfolioData } from '../../types/portfolio';
import { cn } from '../../lib/utils';

type NavItem = PortfolioData['navigation'][number];

function SortableNavItem({
  item,
  pageStatus,
  onLabelChange,
  onRemove,
}: {
  item: NavItem;
  pageStatus: 'published' | 'draft';
  onLabelChange: (label: string) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className={cn(
        'flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-lg',
        isDragging && 'shadow-lg'
      )}
    >
      <button {...attributes} {...listeners} className="p-0.5 text-gray-300 hover:text-gray-600 cursor-grab transition-colors">
        <GripVertical size={14} />
      </button>
      <input
        value={item.label}
        onChange={e => onLabelChange(e.target.value)}
        className="flex-1 text-sm font-medium text-gray-700 bg-transparent border-none outline-none"
        placeholder="Nav label"
      />
      <span className={cn(
        'text-xs rounded-full px-1.5 py-0.5 font-medium shrink-0',
        pageStatus === 'published' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-500'
      )}>
        {pageStatus === 'published' ? 'Live' : 'Draft → Will go Live'}
      </span>
      <button
        onClick={onRemove}
        className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors shrink-0"
        title={pageStatus === 'published' ? 'Remove from nav (will go Draft)' : 'Remove from navigation'}
      >
        <Minus size={13} />
      </button>
    </div>
  );
}

interface NavOrderModalProps {
  onClose: () => void;
}

export function NavOrderModal({ onClose }: NavOrderModalProps) {
  const { data, syncNavAndStatus } = usePortfolio();
  const [nav, setNav] = useState<NavItem[]>(data?.navigation ?? []);

  const navIds = new Set(nav.map(n => n.id));
  const pagesNotInNav = (data?.pages ?? []).filter(p => !navIds.has(p.id));
  const pageStatusMap = new Map((data?.pages ?? []).map(p => [p.id, p.status]));

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = nav.findIndex(n => n.id === active.id);
    const newIndex = nav.findIndex(n => n.id === over.id);
    setNav(arrayMove(nav, oldIndex, newIndex));
  }

  function handleLabelChange(id: string, label: string) {
    setNav(prev => prev.map(n => n.id === id ? { ...n, label } : n));
  }

  function handleRemove(id: string) {
    setNav(prev => prev.filter(n => n.id !== id));
  }

  function handleAdd(page: typeof pagesNotInNav[number]) {
    setNav(prev => [...prev, { id: page.id, label: page.title, slug: `#${page.slug}`, published: true }]);
  }

  function handleSave() {
    syncNavAndStatus(nav);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <Navigation size={16} className="text-gray-400" />
            <h2 className="font-bold text-base">Navigation</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Active nav items — drag to reorder */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Navigation Order <span className="text-gray-300 font-normal normal-case">(drag to reorder)</span>
            </p>
            {nav.length === 0 && (
              <p className="text-sm text-gray-400 py-4 text-center border-2 border-dashed border-gray-100 rounded-lg">
                No pages in navigation yet.
              </p>
            )}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={nav.map(n => n.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {nav.map(item => (
                    <SortableNavItem
                      key={item.id}
                      item={item}
                      pageStatus={pageStatusMap.get(item.id) ?? 'draft'}
                      onLabelChange={label => handleLabelChange(item.id, label)}
                      onRemove={() => handleRemove(item.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {/* Pages not in nav */}
          {pagesNotInNav.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Add to Navigation</p>
              <div className="space-y-2">
                {pagesNotInNav.map(page => (
                  <div key={page.id} className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-lg">
                    <span className="flex-1 text-sm text-gray-500">{page.title}</span>
                    <span className={cn(
                      'text-xs rounded-full px-1.5 py-0.5 font-medium',
                      page.status === 'published' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-500'
                    )}>
                      {page.status === 'published' ? 'Live' : 'Draft → Will go Live'}
                    </span>
                    <button
                      onClick={() => handleAdd(page)}
                      className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors"
                      title="Add to nav"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2 flex gap-2 shrink-0 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 text-sm bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            Save Navigation
          </button>
        </div>
      </div>
    </div>
  );
}

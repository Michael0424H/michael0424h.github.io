import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
  arrayMove, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2, FileText, GripVertical, Copy } from 'lucide-react';
import { usePortfolio } from '../../contexts/PortfolioContext';
import type { Page } from '../../types/portfolio';
import { cn } from '../../lib/utils';

function SortablePage({ page, isActive }: { page: Page; isActive: boolean }) {
  const { setActivePageId, removePage, duplicatePage, setPageStatus } = usePortfolio();
  const isLive = page.status === 'published';

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: page.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => setActivePageId(page.id)}
      className={cn(
        'group flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors',
        isActive ? 'bg-gray-100' : 'hover:bg-gray-50'
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes} {...listeners}
        onClick={e => e.stopPropagation()}
        className="p-0.5 text-gray-200 hover:text-gray-400 transition-colors shrink-0 cursor-grab active:cursor-grabbing"
      >
        <GripVertical size={13} />
      </button>

      <FileText size={13} className={cn('shrink-0', isActive ? 'text-gray-700' : 'text-gray-400')} />

      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium truncate', isActive ? 'text-gray-900' : 'text-gray-600')}>
          {page.title}
        </p>
        <button
          onClick={e => { e.stopPropagation(); setPageStatus(page.id, isLive ? 'draft' : 'published'); }}
          title={isLive ? 'Click to set Draft' : 'Click to go Live'}
          className={cn(
            'mt-0.5 text-xs rounded-full px-1.5 py-0.5 font-medium transition-colors',
            isLive ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-amber-50 text-amber-500 hover:bg-amber-100'
          )}
        >
          {isLive ? 'Live' : 'Draft'}
        </button>
      </div>

      {/* Duplicate — always visible */}
      <button
        onClick={e => { e.stopPropagation(); duplicatePage(page.id); }}
        className="p-1 rounded hover:bg-gray-200 text-gray-300 hover:text-gray-600 transition-colors shrink-0"
        title="Duplicate page"
      >
        <Copy size={12} />
      </button>
      {/* Delete — hover only */}
      <button
        onClick={e => { e.stopPropagation(); if (confirm('Remove this page?')) removePage(page.id); }}
        className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
        title="Delete page"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}

export function PageList() {
  const { data, activePage, addPage, reorderPages } = usePortfolio();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (!data) return null;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = data!.pages.findIndex(p => p.id === active.id);
    const newIndex = data!.pages.findIndex(p => p.id === over.id);
    reorderPages(arrayMove(data!.pages, oldIndex, newIndex));
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pages</span>
        <button
          onClick={addPage}
          className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          title="Add page"
        >
          <Plus size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={data.pages.map(p => p.id)} strategy={verticalListSortingStrategy}>
            {data.pages.map(page => (
              <SortablePage
                key={page.id}
                page={page}
                isActive={page.id === activePage?.id}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

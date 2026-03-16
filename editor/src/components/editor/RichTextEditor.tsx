import { useEffect, useRef } from 'react';
import { Bold, Italic, List, ListOrdered, Link, RemoveFormatting } from 'lucide-react';
import { cn } from '../../lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const btnCls = 'p-1.5 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-colors';
const activeBtnCls = 'bg-gray-200 text-gray-900';

export function RichTextEditor({ value, onChange, placeholder = 'Write something…', minHeight = '100px' }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const internalChange = useRef(false);

  useEffect(() => {
    if (!editorRef.current || internalChange.current) {
      internalChange.current = false;
      return;
    }
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  function exec(cmd: string, val?: string) {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val ?? undefined);
    emit();
  }

  function emit() {
    if (!editorRef.current) return;
    internalChange.current = true;
    onChange(editorRef.current.innerHTML);
  }

  function handleLink() {
    const url = prompt('Enter URL (include https://)');
    if (url) exec('createLink', url);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'b') { e.preventDefault(); exec('bold'); }
    if ((e.metaKey || e.ctrlKey) && e.key === 'i') { e.preventDefault(); exec('italic'); }
  }

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-gray-900">
      {/* Toolbar */}
      <div className="flex items-center flex-wrap gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-200">
        {/* Heading buttons */}
        <button type="button" onClick={() => exec('formatBlock', 'h2')} className={cn(btnCls, 'text-xs font-bold px-2')} title="Heading 2">H2</button>
        <button type="button" onClick={() => exec('formatBlock', 'h3')} className={cn(btnCls, 'text-xs font-semibold px-2')} title="Heading 3">H3</button>
        <button type="button" onClick={() => exec('formatBlock', 'p')} className={cn(btnCls, 'text-xs px-2')} title="Normal text">¶</button>
        <div className="w-px h-4 bg-gray-200 mx-1" />
        {/* Inline formatting */}
        <button type="button" onClick={() => exec('bold')} className={btnCls} title="Bold (⌘B)"><Bold size={13} /></button>
        <button type="button" onClick={() => exec('italic')} className={btnCls} title="Italic (⌘I)"><Italic size={13} /></button>
        <div className="w-px h-4 bg-gray-200 mx-1" />
        {/* Lists */}
        <button type="button" onClick={() => exec('insertUnorderedList')} className={btnCls} title="Bullet list"><List size={13} /></button>
        <button type="button" onClick={() => exec('insertOrderedList')} className={btnCls} title="Numbered list"><ListOrdered size={13} /></button>
        <div className="w-px h-4 bg-gray-200 mx-1" />
        {/* Link */}
        <button type="button" onClick={handleLink} className={btnCls} title="Insert link"><Link size={13} /></button>
        <button type="button" onClick={() => exec('removeFormat')} className={cn(btnCls, 'ml-auto')} title="Clear formatting"><RemoveFormatting size={13} /></button>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        className="px-3 py-2.5 text-sm text-gray-700 leading-relaxed outline-none rich-text-editor"
        style={{ minHeight }}
      />
    </div>
  );
}

// Export a re-usable active button helper for consumers
export { activeBtnCls };

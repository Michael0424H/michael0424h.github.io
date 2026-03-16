import { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { uploadImageToGitHub } from '../../lib/github';

const inputCls = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 transition';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUploader({ value, onChange, label = 'Image URL' }: ImageUploaderProps) {
  const { token } = usePortfolio();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!token) { setError('Add a GitHub token first (Settings gear)'); return; }
    setUploading(true);
    setError('');
    try {
      const url = await uploadImageToGitHub(token, file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</label>
      <div className="flex gap-2">
        <input
          className={`${inputCls} flex-1`}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Paste URL or upload →"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors shrink-0"
        >
          {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {value && (
        <img
          src={value}
          alt="Preview"
          className="mt-1.5 rounded-lg w-full h-20 object-cover border border-gray-100"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      )}
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </div>
  );
}

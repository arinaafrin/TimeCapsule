import { useState, type FormEvent } from 'react';
import { useUploadMediaMutation } from '../../api/mediaApi';
import type { MediaAssetType, MediaSourceType } from '../../types/media';

interface MediaUploadFormProps {
  experienceId: string;
  onUploaded?: () => void;
}

const TYPE_OPTIONS: { value: MediaAssetType; label: string }[] = [
  { value: 'panorama_360', label: '360° Panorama' },
  { value: 'still_image', label: 'Still Image' },
  { value: 'thumbnail', label: 'Thumbnail' },
  { value: '3d_model', label: '3D Model' },
];

export function MediaUploadForm({ experienceId, onUploaded }: MediaUploadFormProps) {
  const [type, setType] = useState<MediaAssetType>('panorama_360');
  const [attributionText, setAttributionText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadMedia, { isLoading, error, isSuccess }] = useUploadMediaMutation();

  const sourceType: MediaSourceType = 'partner_upload';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;

    await uploadMedia({ experienceId, type, sourceType, attributionText: attributionText || undefined, file }).unwrap();
    setFile(null);
    setAttributionText('');
    onUploaded?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-md border border-slate-200 p-4">
      <h3 className="text-sm font-semibold text-slate-900">Upload media</h3>

      <div>
        <label htmlFor="media-type" className="block text-sm font-medium text-slate-700">
          Asset type
        </label>
        <select
          id="media-type"
          value={type}
          onChange={(e) => setType(e.target.value as MediaAssetType)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="media-file" className="block text-sm font-medium text-slate-700">
          File
        </label>
        <input
          id="media-file"
          type="file"
          accept="image/jpeg,image/png,.glb,.gltf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="mt-1 w-full text-sm"
        />
      </div>

      <div>
        <label htmlFor="media-attribution" className="block text-sm font-medium text-slate-700">
          Attribution (optional)
        </label>
        <input
          id="media-attribution"
          type="text"
          value={attributionText}
          onChange={(e) => setAttributionText(e.target.value)}
          placeholder="e.g. Photo courtesy of..."
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">Upload failed. Check the file type and try again.</p>
      )}
      {isSuccess && <p className="text-sm text-emerald-600">Uploaded successfully.</p>}

      <button
        type="submit"
        disabled={!file || isLoading}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
      >
        {isLoading ? 'Uploading...' : 'Upload'}
      </button>
    </form>
  );
}

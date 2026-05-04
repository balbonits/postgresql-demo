'use client';

import { useState } from 'react';
import { Video } from '@/types';
import { X } from 'lucide-react';

interface VideoFormProps {
  video?: Video;
  onClose: () => void;
  onSave: () => void;
}

export function VideoForm({ video, onClose, onSave }: VideoFormProps) {
  const [form, setForm] = useState({
    title: video?.title ?? '',
    description: video?.description ?? '',
    video_url: video?.video_url ?? '',
    thumbnail_url: video?.thumbnail_url ?? '',
    duration: video?.duration?.toString() ?? '',
    category: video?.category ?? '',
    tags: video?.tags?.join(', ') ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      title: form.title,
      description: form.description || null,
      video_url: form.video_url,
      thumbnail_url: form.thumbnail_url || null,
      duration: form.duration ? Number(form.duration) : null,
      category: form.category || null,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : null,
    };

    try {
      const res = await fetch(
        video ? `/api/videos/${video.id}` : '/api/videos',
        {
          method: video ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error(await res.text());
      onSave();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" data-modal="video-form">
      <div className="w-full max-w-lg rounded-3xl border border-zinc-700 bg-zinc-900 p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{video ? 'Edit Video' : 'Add Video'}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-zinc-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Title *" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} />
          <Field label="Video URL *" value={form.video_url} onChange={v => setForm(f => ({ ...f, video_url: v }))} />
          <Field label="Thumbnail URL" value={form.thumbnail_url} onChange={v => setForm(f => ({ ...f, thumbnail_url: v }))} />
          <Field label="Description" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} multiline />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Duration (seconds)" value={form.duration} onChange={v => setForm(f => ({ ...f, duration: v }))} type="number" />
            <Field label="Category" value={form.category} onChange={v => setForm(f => ({ ...f, category: v }))} />
          </div>
          <Field label="Tags (comma-separated)" value={form.tags} onChange={v => setForm(f => ({ ...f, tags: v }))} />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="mt-2 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-xl px-5 py-2 text-sm text-zinc-400 hover:text-white">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !form.title || !form.video_url}
              className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {saving ? 'Saving...' : video ? 'Save Changes' : 'Add Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, multiline, type,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  type?: string;
}) {
  const id = label.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const className = "w-full rounded-xl bg-zinc-800 px-4 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-indigo-500";
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs text-zinc-400">{label}</label>
      {multiline ? (
        <textarea id={id} value={value} onChange={e => onChange(e.target.value)} rows={3} className={className} />
      ) : (
        <input id={id} type={type ?? 'text'} value={value} onChange={e => onChange(e.target.value)} className={className} />
      )}
    </div>
  );
}

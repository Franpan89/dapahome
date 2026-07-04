'use client';

import Image from 'next/image';
import { useState, useRef } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase/client';
import { imageUrl } from '@/lib/supabase/image';
import { revalidateHomeAction } from '@/app/admin/actions';
import type { Testimonial } from '@/lib/supabase/types';

const EMPTY_FORM = {
  name: '',
  role: '',
  body: '',
  rating: 5,
  featured: false,
  status: 'active' as 'active' | 'draft',
};

type FormState = typeof EMPTY_FORM;

export function AdminTestimonialsManager({ items: initial }: { items: Testimonial[] }) {
  const sb = createSupabaseBrowser();
  const [items, setItems] = useState<Testimonial[]>(
    [...initial].sort((a, b) => a.sort_order - b.sort_order),
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function openCreate() {
    setCreating(true);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setPendingPhoto(null);
    setPhotoPreview(null);
  }

  function openEdit(t: Testimonial) {
    setEditingId(t.id);
    setCreating(false);
    setForm({
      name: t.name,
      role: t.role ?? '',
      body: t.body,
      rating: t.rating,
      featured: t.featured,
      status: t.status,
    });
    setPendingPhoto(null);
    setPhotoPreview(t.photo_path ? imageUrl(t.photo_path) : null);
  }

  function cancel() {
    setCreating(false);
    setEditingId(null);
    setPendingPhoto(null);
    setPhotoPreview(null);
  }

  function onPhotoChange(file: File | null) {
    setPendingPhoto(file);
    if (file) setPhotoPreview(URL.createObjectURL(file));
  }

  async function uploadPhoto(id: string, oldPath: string | null): Promise<string | null> {
    if (!pendingPhoto) return oldPath;
    const ext = pendingPhoto.name.split('.').pop() ?? 'jpg';
    const path = `testimonials/${id}/${crypto.randomUUID()}.${ext}`;
    const { error } = await sb.storage.from('products').upload(path, pendingPhoto, { upsert: false });
    if (error) { alert('Error subiendo foto: ' + error.message); return oldPath; }
    if (oldPath && !oldPath.startsWith('http')) {
      await sb.storage.from('products').remove([oldPath]);
    }
    return path;
  }

  async function saveCreate() {
    if (!form.name.trim() || !form.body.trim()) {
      alert('Nombre y testimonio son obligatorios.');
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await sb
        .from('testimonials')
        .insert({
          name: form.name.trim(),
          role: form.role.trim() || null,
          body: form.body.trim(),
          rating: form.rating,
          featured: form.featured,
          status: form.status,
          sort_order: items.length,
        })
        .select('*')
        .single();
      if (error) { alert(error.message); return; }
      const newItem = data as Testimonial;
      const photo_path = await uploadPhoto(newItem.id, null);
      if (photo_path !== null) {
        await sb.from('testimonials').update({ photo_path }).eq('id', newItem.id);
        newItem.photo_path = photo_path;
      }
      setItems((prev) => [...prev, newItem]);
      setCreating(false);
      setPendingPhoto(null);
      setPhotoPreview(null);
      revalidateHomeAction();
    } finally {
      setSaving(false);
    }
  }

  async function saveEdit() {
    if (!editingId) return;
    if (!form.name.trim() || !form.body.trim()) {
      alert('Nombre y testimonio son obligatorios.');
      return;
    }
    setSaving(true);
    try {
      const existing = items.find((i) => i.id === editingId)!;
      const photo_path = await uploadPhoto(editingId, existing.photo_path);
      const patch = {
        name: form.name.trim(),
        role: form.role.trim() || null,
        body: form.body.trim(),
        rating: form.rating,
        featured: form.featured,
        status: form.status,
        photo_path,
      };
      await sb.from('testimonials').update(patch).eq('id', editingId);
      setItems((prev) =>
        prev.map((i) => (i.id === editingId ? { ...i, ...patch } : i)),
      );
      setEditingId(null);
      setPendingPhoto(null);
      setPhotoPreview(null);
      revalidateHomeAction();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('¿Eliminar este testimonio?')) return;
    const it = items.find((i) => i.id === id);
    if (it?.photo_path && !it.photo_path.startsWith('http')) {
      await sb.storage.from('products').remove([it.photo_path]);
    }
    await sb.from('testimonials').delete().eq('id', id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (editingId === id) cancel();
    revalidateHomeAction();
  }

  async function move(id: string, dir: -1 | 1) {
    const idx = items.findIndex((i) => i.id === id);
    const j = idx + dir;
    if (idx < 0 || j < 0 || j >= items.length) return;
    const next = [...items];
    [next[idx], next[j]] = [next[j], next[idx]];
    setItems(next);
    await Promise.all(
      next.map((it, k) => sb.from('testimonials').update({ sort_order: k }).eq('id', it.id)),
    );
    revalidateHomeAction();
  }

  return (
    <div className="space-y-6">
      {/* Create form */}
      {creating ? (
        <TestimonialForm
          form={form}
          setForm={setForm}
          photoPreview={photoPreview}
          pendingPhoto={pendingPhoto}
          onPhotoChange={onPhotoChange}
          onSave={saveCreate}
          onCancel={cancel}
          saving={saving}
          fileRef={fileRef}
          title="Nuevo testimonio"
        />
      ) : (
        <button onClick={openCreate} className="btn btn-primary">
          + Nuevo testimonio
        </button>
      )}

      {/* List */}
      <div className="grid gap-4">
        {items.map((t, idx) =>
          editingId === t.id ? (
            <TestimonialForm
              key={t.id}
              form={form}
              setForm={setForm}
              photoPreview={photoPreview}
              pendingPhoto={pendingPhoto}
              onPhotoChange={onPhotoChange}
              onSave={saveEdit}
              onCancel={cancel}
              saving={saving}
              fileRef={fileRef}
              title={`Editando: ${t.name}`}
            />
          ) : (
            <div key={t.id} className="card p-4 flex gap-4 items-start">
              {/* Photo */}
              <div className="flex-shrink-0 h-14 w-14 rounded-full overflow-hidden bg-ink-100 grid place-items-center">
                {t.photo_path ? (
                  <Image
                    src={imageUrl(t.photo_path)}
                    alt={t.name}
                    width={56}
                    height={56}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="font-display font-semibold text-ink-400 text-lg">{t.name[0]}</span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{t.name}</span>
                  {t.role && <span className="text-xs text-ink-600">{t.role}</span>}
                  <Stars rating={t.rating} />
                  <span className={`text-2xs px-2 py-0.5 rounded-full font-medium ${t.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-ink-200 text-ink-600'}`}>
                    {t.status === 'active' ? 'Publicado' : 'Borrador'}
                  </span>
                  {t.featured && <span className="text-2xs px-2 py-0.5 rounded-full bg-secondary/20 text-secondary font-medium">Destacado</span>}
                </div>
                <p className="mt-1 text-sm text-ink-700 line-clamp-2">&ldquo;{t.body}&rdquo;</p>
              </div>

              {/* Actions */}
              <div className="flex-shrink-0 flex flex-col gap-1">
                <button onClick={() => openEdit(t)} className="text-xs px-3 py-1.5 rounded bg-ink-100 hover:bg-ink-200">Editar</button>
                <button onClick={() => move(t.id, -1)} disabled={idx === 0} className="text-xs px-3 py-1.5 rounded bg-ink-100 hover:bg-ink-200 disabled:opacity-40">↑</button>
                <button onClick={() => move(t.id, 1)} disabled={idx === items.length - 1} className="text-xs px-3 py-1.5 rounded bg-ink-100 hover:bg-ink-200 disabled:opacity-40">↓</button>
                <button onClick={() => remove(t.id)} className="text-xs px-3 py-1.5 rounded text-danger hover:bg-danger/10">Eliminar</button>
              </div>
            </div>
          ),
        )}

        {items.length === 0 && !creating && (
          <div className="card p-10 text-center text-sm text-ink-600">
            Aún no hay testimonios. Crea el primero para que aparezcan en la home.
          </div>
        )}
      </div>
    </div>
  );
}

function TestimonialForm({
  form,
  setForm,
  photoPreview,
  onPhotoChange,
  onSave,
  onCancel,
  saving,
  fileRef,
  title,
}: {
  form: {
    name: string; role: string; body: string;
    rating: number; featured: boolean; status: 'active' | 'draft';
  };
  setForm: React.Dispatch<React.SetStateAction<typeof form>>;
  photoPreview: string | null;
  pendingPhoto: File | null;
  onPhotoChange: (f: File | null) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  fileRef: React.RefObject<HTMLInputElement | null>;
  title: string;
}) {
  return (
    <div className="card p-6 space-y-4 border-2 border-primary/30">
      <h3 className="font-display text-lg font-medium">{title}</h3>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label mb-1">Nombre *</label>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="input w-full"
            placeholder="Ana García"
          />
        </div>
        <div>
          <label className="label mb-1">Cargo / Ciudad</label>
          <input
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            className="input w-full"
            placeholder="Arquitecta — Quito"
          />
        </div>
      </div>

      <div>
        <label className="label mb-1">Testimonio *</label>
        <textarea
          value={form.body}
          onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          rows={3}
          className="input w-full resize-none"
          placeholder="El servicio fue excelente y los productos superaron mis expectativas..."
        />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {/* Rating */}
        <div>
          <label className="label mb-2">Calificación</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setForm((f) => ({ ...f, rating: n }))}
                className="transition-transform hover:scale-110"
                aria-label={`${n} estrellas`}
              >
                <svg viewBox="0 0 20 20" className="h-6 w-6" aria-hidden>
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    fill={n <= form.rating ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth={n <= form.rating ? 0 : 1.5}
                    className={n <= form.rating ? 'text-secondary' : 'text-ink-300'}
                  />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="label mb-1">Estado</label>
          <select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as 'active' | 'draft' }))}
            className="input w-full"
          >
            <option value="active">Publicado</option>
            <option value="draft">Borrador</option>
          </select>
        </div>

        {/* Featured */}
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
              className="h-4 w-4 rounded border-ink-300 text-primary"
            />
            <span className="text-sm">Destacado</span>
          </label>
        </div>
      </div>

      {/* Photo upload */}
      <div>
        <label className="label mb-2">Foto del cliente</label>
        <div className="flex items-center gap-4">
          {photoPreview ? (
            <div className="relative h-16 w-16 rounded-full overflow-hidden border border-ink-200 flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="h-16 w-16 rounded-full bg-ink-100 flex items-center justify-center text-ink-400 flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
          )}
          <div className="flex-1 space-y-1">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={(e) => onPhotoChange(e.target.files?.[0] ?? null)}
              className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-white hover:file:bg-primary-soft file:cursor-pointer"
            />
            {photoPreview && (
              <button
                type="button"
                onClick={() => { onPhotoChange(null); if (fileRef.current) fileRef.current.value = ''; }}
                className="text-xs text-danger hover:underline"
              >
                Quitar foto
              </button>
            )}
            <p className="text-2xs text-ink-600">JPG o PNG recomendado. Se mostrará en círculo.</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onSave}
          disabled={saving}
          className="btn btn-primary"
        >
          {saving ? 'Guardando…' : 'Guardar testimonio'}
        </button>
        <button onClick={onCancel} className="btn">Cancelar</button>
      </div>
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${rating} estrellas`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-3.5 w-3.5" aria-hidden>
          <path
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            fill={i < rating ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={i < rating ? 0 : 1.5}
            className={i < rating ? 'text-secondary' : 'text-ink-300'}
          />
        </svg>
      ))}
    </span>
  );
}

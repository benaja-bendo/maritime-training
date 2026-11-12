import { useCallback, useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { ImagePlus } from 'lucide-react';
import { loadAdminCatalog, saveCatalog } from '@/lib/admin-data';
import { PhotoError, prepareCourseImage } from '@/lib/image';
import type { Course } from '@/types';
import { ErrorBox, NoticeBox } from '@/pages/admin/ui';

// Téléverse une image et l'applique à une ou plusieurs formations qui n'en ont pas.
export default function CourseImagesPanel({ email }: { email: string }) {
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [version, setVersion] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const state = await loadAdminCatalog();
      setCourses(state.courses);
      setVersion(state.version);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Catalogue illisible.');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const without = (courses ?? []).filter((c) => !c.image_url);

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !courses || picked.length === 0) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const image = await prepareCourseImage(file);
      const next = courses.map((c) => (picked.includes(c.id) ? { ...c, image_url: image } : c));
      const chars = next.reduce((n, c) => n + (c.image_url?.startsWith('data:') ? c.image_url.length : 0), 0);
      if (chars > 700_000) throw new Error('Trop d’images téléversées pour le catalogue (limite 1 Mo) : utilisez plutôt une adresse https:// dans l’onglet Formations.');
      await saveCatalog(next, { courses, version }, email);
      setNotice(`Image appliquée à ${picked.length} formation(s).`);
      setPicked([]);
      await load();
    } catch (err) {
      setError(err instanceof PhotoError || err instanceof Error ? err.message : 'Enregistrement impossible.');
    }
    setBusy(false);
  };

  if (!courses) return error ? <ErrorBox>{error}</ErrorBox> : null;

  return (
    <details className="card p-4">
      <summary className="cursor-pointer font-semibold text-white">
        Images des formations ({without.length} sans image)
      </summary>
      <div className="mt-4 space-y-3">
        {error && <ErrorBox>{error}</ErrorBox>}
        {notice && <NoticeBox>{notice}</NoticeBox>}
        {without.length === 0 ? (
          <p className="text-sm text-slate-400">Toutes les formations ont une image.</p>
        ) : (
          <>
            <p className="text-xs text-slate-400">
              Cochez une ou plusieurs formations, puis téléversez une photo (JPG, PNG ou WebP) : elle est recadrée, allégée et publiée sur le site.
            </p>
            <ul className="max-h-60 overflow-y-auto space-y-1 text-sm text-slate-200">
              {without.map((c) => (
                <li key={c.id}>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="accent-[#e1b936]"
                      checked={picked.includes(c.id)}
                      onChange={(e) => setPicked((p) => (e.target.checked ? [...p, c.id] : p.filter((x) => x !== c.id)))}
                    />
                    {c.name}
                  </label>
                </li>
              ))}
            </ul>
            <label className={`btn-secondary inline-flex items-center gap-2 cursor-pointer ${picked.length === 0 || busy ? 'opacity-50 pointer-events-none' : ''}`}>
              <ImagePlus className="w-4 h-4" />
              {busy ? 'Envoi…' : `Téléverser une photo (${picked.length})`}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={onFile} />
            </label>
          </>
        )}
      </div>
    </details>
  );
}

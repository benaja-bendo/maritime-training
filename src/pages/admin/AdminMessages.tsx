import { useCallback, useEffect, useState } from 'react';
import { listMessages, setMessageHandled } from '@/lib/admin-data';
import type { AdminMessage } from '@/types/admin';
import { ErrorBox } from '@/pages/admin/ui';
import { fmtDateTime } from '@/pages/admin/ui-helpers';

export default function AdminMessages({ email }: { email: string }) {
  const [list, setList] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setList(await listMessages());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lecture impossible.');
    }
    setLoading(false);
  }, []);
  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggle = async (m: AdminMessage) => {
    try {
      await setMessageHandled(m.id, !m.handled, email);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Enregistrement impossible.');
    }
  };

  const todo = list.filter((m) => !m.handled).length;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-white">
        Messages <span className="text-sm text-slate-400">({todo} à traiter sur {list.length})</span>
      </h1>
      {error && <ErrorBox>{error}</ErrorBox>}
      {loading ? (
        <p className="text-sm text-slate-400">Chargement…</p>
      ) : list.length === 0 ? (
        <div className="card p-6 text-sm text-slate-400">Aucun message.</div>
      ) : (
        <ul className="space-y-3">
          {list.map((m) => (
            <li key={m.id} className={`card p-4 ${m.handled ? 'opacity-70' : ''}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-medium text-white">{m.name}</span>{' '}
                  <a href={`mailto:${m.email}`} className="text-sm text-[#e1b936] hover:underline">{m.email}</a>
                </div>
                <span className="text-xs text-slate-400">{fmtDateTime(m.created_at)}</span>
              </div>
              {m.subject && <p className="mt-1 text-sm font-medium text-slate-200">{m.subject}</p>}
              <p className="mt-2 text-sm text-slate-300 whitespace-pre-wrap">{m.message}</p>
              <button onClick={() => toggle(m)} className="mt-3 text-xs btn-secondary !py-1.5 !px-3">
                {m.handled ? `Traité par ${m.handled_by} — rouvrir` : 'Marquer comme traité'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

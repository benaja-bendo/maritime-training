import { useEffect, useState } from 'react';
import { listAudit } from '@/lib/admin-data';
import type { AuditEntry } from '@/types/admin';
import { ErrorBox } from '@/pages/admin/ui';
import { fmtDateTime } from '@/pages/admin/ui-helpers';

export default function AdminAudit() {
  const [list, setList] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listAudit()
      .then(setList)
      .catch((e) => setError(e instanceof Error ? e.message : 'Lecture impossible.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-white">Journal des actions</h1>
      <p className="text-sm text-slate-400">
        Chaque enregistrement de fiche, publication, révocation ou changement d’inscription est tracé ici. Ce
        journal ne peut être ni modifié ni effacé depuis le site.
      </p>
      {error && <ErrorBox>{error}</ErrorBox>}
      {loading ? (
        <p className="text-sm text-slate-400">Chargement…</p>
      ) : list.length === 0 ? (
        <div className="card p-6 text-sm text-slate-400">Aucune action enregistrée.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-slate-400">
              <tr><th className="p-3">Date</th><th className="p-3">Par</th><th className="p-3">Type</th><th className="p-3">Détail</th></tr>
            </thead>
            <tbody className="divide-y divide-[#294769]">
              {list.map((a) => (
                <tr key={a.id} className="align-top">
                  <td className="p-3 whitespace-nowrap text-slate-300">{fmtDateTime(a.at)}</td>
                  <td className="p-3 text-slate-200">{a.actor}</td>
                  <td className="p-3 text-slate-300">{a.action}{a.registration && <span className="block font-mono text-xs text-[#e1b936]">{a.registration}</span>}</td>
                  <td className="p-3 text-slate-200">{a.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

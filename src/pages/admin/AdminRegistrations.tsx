import { useCallback, useEffect, useState } from 'react';
import { listRegistrations, updateRegistration } from '@/lib/admin-data';
import { formatUsd } from '@/lib/pricing';
import type { AdminRegistration, RegistrationStatus } from '@/types/admin';
import { ErrorBox, Lbl, NoticeBox } from '@/pages/admin/ui';
import { REGISTRATION_STATUS, fmtDateTime, inputCls } from '@/pages/admin/ui-helpers';

export default function AdminRegistrations({ email }: { email: string }) {
  const [list, setList] = useState<AdminRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [openRef, setOpenRef] = useState<string | null>(null);
  const [edit, setEdit] = useState<AdminRegistration | null>(null);
  const [filter, setFilter] = useState<'all' | RegistrationStatus>('all');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setList(await listRegistrations());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lecture impossible.');
    }
    setLoading(false);
  }, []);
  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggle = (r: AdminRegistration) => {
    setNotice(null);
    if (openRef === r.reference) {
      setOpenRef(null);
      setEdit(null);
    } else {
      setOpenRef(r.reference);
      setEdit(JSON.parse(JSON.stringify(r)));
    }
  };

  const save = async () => {
    if (!edit) return;
    const orig = list.find((r) => r.reference === edit.reference);
    if (!orig) return;
    setBusy(true);
    setError(null);
    try {
      await updateRegistration(orig, { status: edit.status, payments: edit.payments, admin_notes: edit.admin_notes }, email);
      setNotice(`Inscription ${edit.reference} enregistrée.`);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Enregistrement impossible.');
    }
    setBusy(false);
  };

  const shown = list.filter((r) => filter === 'all' || r.status === filter);
  const pay = (k: keyof AdminRegistration['payments'], v: string | number | null) =>
    setEdit((e) => (e ? { ...e, payments: { ...e.payments, [k]: v } } : e));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-white">Inscriptions <span className="text-sm text-slate-400">({shown.length})</span></h1>
        <select className={`${inputCls} max-w-xs`} value={filter} onChange={(e) => setFilter(e.target.value as 'all' | RegistrationStatus)} aria-label="Filtrer par statut">
          <option value="all">Tous les statuts</option>
          {Object.entries(REGISTRATION_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>
      {error && <ErrorBox>{error}</ErrorBox>}
      {notice && <NoticeBox>{notice}</NoticeBox>}
      {loading ? (
        <p className="text-sm text-slate-400">Chargement…</p>
      ) : shown.length === 0 ? (
        <div className="card p-6 text-sm text-slate-400">Aucune inscription.</div>
      ) : (
        <ul className="space-y-3">
          {shown.map((r) => {
            const st = REGISTRATION_STATUS[r.status];
            const isOpen = openRef === r.reference && edit;
            return (
              <li key={r.reference} className="card">
                <button onClick={() => toggle(r)} className="w-full text-left p-4 flex flex-wrap items-center gap-x-6 gap-y-1">
                  <span className="font-mono text-[#e1b936] text-sm">{r.reference}</span>
                  <span className="font-medium text-white">{r.first_names} {r.last_name}</span>
                  <span className="text-xs text-slate-400">{fmtDateTime(r.created_at)}</span>
                  <span className="text-xs text-slate-300">{r.courses.length} formation(s){r.quote_total_usd != null && ` · ${formatUsd(r.quote_total_usd)}`}</span>
                  <span className={`ml-auto px-2 py-0.5 rounded text-xs font-semibold ${st.cls}`}>{st.label}</span>
                </button>
                {isOpen && edit && (
                  <div className="border-t border-[#294769] p-4 grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="space-y-2 text-sm">
                      {r.photo_data_url && <img src={r.photo_data_url} alt="Photo d’identité" className="w-28 aspect-[7/9] object-cover rounded-sm border border-[#385371]" />}
                      <p className="text-slate-200">{r.email}</p>
                      <p className="text-slate-300">{r.nationality}</p>
                      <p className="text-slate-300">{r.id_type === 'passport' ? 'Passeport' : 'Carte d’identité'} : <span className="font-mono">{r.id_number}</span></p>
                    </div>
                    <div className="text-sm">
                      <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Formations</p>
                      <ul className="space-y-1 text-slate-200">
                        {r.courses.map((c) => (
                          <li key={c.id} className="flex justify-between gap-3"><span>{c.name}</span><span className="text-slate-300 whitespace-nowrap">{c.price_usd != null ? formatUsd(c.price_usd) : '—'}</span></li>
                        ))}
                      </ul>
                      <div className="mt-3 pt-3 border-t border-[#294769] space-y-1 text-slate-300">
                        {r.quote_discount_usd > 0 && <p>Remise pack : −{formatUsd(r.quote_discount_usd)}</p>}
                        <p>Total indicatif : {r.quote_total_usd != null ? formatUsd(r.quote_total_usd) : 'à confirmer'}</p>
                        <p>Avance indicative : {r.quote_deposit_usd != null ? formatUsd(r.quote_deposit_usd) : 'à confirmer'}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Lbl label="Statut">
                        <select className={inputCls} value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value as RegistrationStatus })}>
                          {Object.entries(REGISTRATION_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                      </Lbl>
                      <div className="grid grid-cols-2 gap-2">
                        <Lbl label="Avance reçue (USD)"><input type="number" min="0" step="0.01" className={inputCls} value={edit.payments.deposit_usd ?? ''} onChange={(e) => pay('deposit_usd', e.target.value === '' ? null : Number(e.target.value))} /></Lbl>
                        <Lbl label="Le"><input type="date" className={inputCls} value={edit.payments.deposit_on} onChange={(e) => pay('deposit_on', e.target.value)} /></Lbl>
                        <Lbl label="Solde reçu (USD)"><input type="number" min="0" step="0.01" className={inputCls} value={edit.payments.balance_usd ?? ''} onChange={(e) => pay('balance_usd', e.target.value === '' ? null : Number(e.target.value))} /></Lbl>
                        <Lbl label="Le"><input type="date" className={inputCls} value={edit.payments.balance_on} onChange={(e) => pay('balance_on', e.target.value)} /></Lbl>
                      </div>
                      <Lbl label="Notes internes"><textarea rows={2} className={inputCls} value={edit.admin_notes} onChange={(e) => setEdit({ ...edit, admin_notes: e.target.value })} /></Lbl>
                      <button onClick={save} disabled={busy} className="btn-primary !py-2 text-sm disabled:opacity-60">{busy ? 'Enregistrement…' : 'Enregistrer'}</button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

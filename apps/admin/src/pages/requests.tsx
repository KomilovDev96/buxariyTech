import { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { statuses, priorities, type Page, type Lead, type SafeUser } from '@buhariy/contracts';
import { api, save } from '../lib/api';
import { Button, ErrorBox, Loading, Empty, Modal, Badge } from '../components/ui';
const labels: Record<string, string> = {
  NEW: 'Yangi',
  REVIEWING: 'Ko‘rib chiqilmoqda',
  CONTACTED: 'Bog‘lanildi',
  DISCUSSION: 'Muhokama',
  PROPOSAL: 'Taklif berildi',
  NEGOTIATION: 'Muzokara',
  WON: 'Mijozga aylandi',
  REJECTED: 'Rad etildi',
};
export default function Requests() {
  const [data, setData] = useState<Page<Lead> | null>(null),
    [page, setPage] = useState(1),
    [status, setStatus] = useState(''),
    [selected, setSelected] = useState<Lead | null>(null),
    [users, setUsers] = useState<SafeUser[]>([]),
    [note, setNote] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const load = () => api<Page<Lead>>(`/admin/requests?page=${page}&status=${status}`).then(setData);
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [page, status]);
  useEffect(() => {
    api<SafeUser[]>('/admin/users')
      .then(setUsers)
      .catch((e) => setError(e.message));
  }, []);
  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError('');
    try {
      await fn();
      if (selected) setSelected(await api<Lead>(`/admin/requests/${selected.id}`));
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Xatolik');
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">HAMKORLIK</p>
          <h1>Arizalar</h1>
          <p>Birinchi murojaatdan hamkorlikkacha.</p>
        </div>
        <Badge>{data?.total || 0} ariza</Badge>
      </div>
      <div className="toolbar">
        <label>
          Holat bo‘yicha
          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
          >
            <option value="">Barchasi</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {labels[s]}
              </option>
            ))}
          </select>
        </label>
      </div>
      {!selected && <ErrorBox message={error} />}
      <section className="panel">
        {!data ? (
          error ? (
            <Empty text="Ma’lumotni yuklab bo‘lmadi." />
          ) : (
            <Loading />
          )
        ) : data.items.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Mijoz</th>
                  <th>Xizmat</th>
                  <th>Holat</th>
                  <th>Muhimlik</th>
                  <th>Sana</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.items.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <button
                        className="table-link"
                        onClick={() => {
                          setSelected(lead);
                          setError('');
                          setNote('');
                        }}
                      >
                        {lead.name}
                      </button>
                      <small className="block">{lead.company || lead.phone}</small>
                    </td>
                    <td>{lead.service}</td>
                    <td>
                      <Badge
                        tone={
                          lead.status === 'WON'
                            ? 'green'
                            : lead.status === 'NEW'
                              ? 'gold'
                              : 'neutral'
                        }
                      >
                        {labels[lead.status]}
                      </Badge>
                    </td>
                    <td>{lead.priority}</td>
                    <td>{new Date(lead.createdAt).toLocaleDateString('uz-UZ')}</td>
                    <td>
                      <Button
                        variant="ghost"
                        aria-label="Arizani ochish"
                        onClick={() => {
                          setSelected(lead);
                          setError('');
                          setNote('');
                        }}
                      >
                        <ArrowUpRight size={19} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty text="Bu holatdagi arizalar yo‘q." />
        )}
      </section>
      {data && data.pages > 1 && (
        <div className="pagination">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>
            ←
          </Button>
          {page} / {data.pages}
          <Button variant="outline" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>
            →
          </Button>
        </div>
      )}
      <Modal
        open={Boolean(selected)}
        onOpenChange={() => setSelected(null)}
        title={selected?.name || 'Ariza'}
        description={selected ? new Date(selected.createdAt).toLocaleString('uz-UZ') : undefined}
        wide
      >
        {selected && (
          <>
            <ErrorBox message={error} />
            <div className="lead-facts">
              <div>
                <small>Telefon</small>
                <a href={`tel:${selected.phone.replace(/[^+0-9]/g, '')}`}>{selected.phone}</a>
              </div>
              <div>
                <small>Telegram</small>
                {selected.telegram || '—'}
              </div>
              <div>
                <small>Kompaniya</small>
                {selected.company || '—'}
              </div>
              <div>
                <small>Xizmat</small>
                {selected.service}
              </div>
              <div>
                <small>Budjet</small>
                {selected.budget || '—'}
              </div>
            </div>
            <div className="lead-description">{selected.description}</div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const f = new FormData(event.currentTarget);
                void run(() =>
                  save(
                    `/admin/requests/${selected.id}`,
                    {
                      status: f.get('status'),
                      priority: f.get('priority'),
                      assignedToId: f.get('assignedToId') || null,
                    },
                    'PATCH',
                  ),
                );
              }}
            >
              <div className="fields-grid" key={`${selected.id}-${selected.updatedAt}`}>
                <label>
                  Holat
                  <select aria-label="Holat" name="status" defaultValue={selected.status}>
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {labels[s]}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Muhimlik
                  <select aria-label="Muhimlik" name="priority" defaultValue={selected.priority}>
                    {priorities.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Mas’ul
                  <select
                    aria-label="Mas’ul"
                    name="assignedToId"
                    defaultValue={selected.assignedToId || ''}
                  >
                    <option value="">Tayinlanmagan</option>
                    {users
                      .filter((u) => u.active && u.role === 'ADMIN')
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                  </select>
                </label>
              </div>
              <Button disabled={busy}>O‘zgarishlarni saqlash</Button>
            </form>
            <div className="notes">
              <h3>Ichki qaydlar</h3>
              <p className="muted">Faqat administratorlarga ko‘rinadi.</p>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void run(async () => {
                    await save(`/admin/requests/${selected.id}/notes`, { body: note });
                    setNote('');
                  });
                }}
              >
                <label className="sr-only" htmlFor="note">
                  Ichki qayd
                </label>
                <textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  required
                  minLength={1}
                  maxLength={5000}
                  rows={3}
                />
                <Button variant="outline" disabled={busy}>
                  Qayd qo‘shish
                </Button>
              </form>
              {selected.notes.map((n) => (
                <article className="note" key={n.id}>
                  <div>
                    <strong>{n.author.name}</strong>
                    <time>{new Date(n.createdAt).toLocaleString('uz-UZ')}</time>
                  </div>
                  <p>{n.body}</p>
                </article>
              ))}
            </div>
            <div className="consent-info">
              <strong>Rozilik ma’lumoti</strong>
              <span>
                {selected.consentGiven ? 'Rozilik berilgan' : 'Rozilik yo‘q'} ·{' '}
                {new Date(selected.consentAt).toLocaleString('uz-UZ')}
              </span>
              <span>Siyosat versiyasi: {selected.privacyPolicyVersion}</span>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}

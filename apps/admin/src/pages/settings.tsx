import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Setting, PrivacyPolicy } from '@buhariy/contracts';
import { policySchema, settingSchema } from '@buhariy/contracts';
import { api, save } from '../lib/api';
import { Button, ErrorBox, Badge } from '../components/ui';
export default function Settings() {
  const [settings, setSettings] = useState<Setting[]>([]),
    [policies, setPolicies] = useState<PrivacyPolicy[]>([]),
    [error, setError] = useState(''),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false);
  const load = () =>
    Promise.all([
      api<Setting[]>('/admin/settings').then(setSettings),
      api<PrivacyPolicy[]>('/admin/privacy').then(setPolicies),
    ]);
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);
  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await fn();
      await load();
      setMessage('Saqlandi.');
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
          <p className="eyebrow">TIZIM</p>
          <h1>Sozlamalar</h1>
          <p>Ommaviy parametrlar va maxfiylik siyosati.</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/users">Foydalanuvchilar ↗</Link>
        </Button>
      </div>
      <ErrorBox message={error} />
      {message && (
        <p className="success-message" role="status">
          {message}
        </p>
      )}
      <div className="settings-grid">
        <section className="panel">
          <h2>Parametrlar</h2>
          <p className="muted">
            Maxfiy kalitlar bu yerda saqlanmaydi. Ommaviy deb belgilangan qiymatlar API orqali
            ko‘rinadi.
          </p>
          {settings.map((s) => (
            <div className="setting-row" key={s.key}>
              <strong>{s.key}</strong>
              <span>{s.value}</span>
              <Badge>{s.public ? 'Ommaviy' : 'Ichki'}</Badge>
            </div>
          ))}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              void run(() =>
                save(
                  '/admin/settings',
                  settingSchema.parse({
                    key: f.get('key'),
                    value: f.get('value'),
                    public: f.get('public') === 'on',
                  }),
                  'PATCH',
                ),
              );
            }}
          >
            <label>
              Kalit
              <input name="key" required pattern="[a-z][a-zA-Z0-9_]*" />
            </label>
            <label>
              Qiymat
              <textarea name="value" required rows={3} />
            </label>
            <label className="check-label">
              <input name="public" type="checkbox" />
              Ommaviy qiymat
            </label>
            <Button disabled={busy}>Saqlash</Button>
          </form>
        </section>
        <section className="panel">
          <h2>Maxfiylik siyosati</h2>
          <p className="muted">
            Versiyalar o‘zgarmas saqlanadi. Yangi faol versiya avvalgisini almashtiradi. Arizalarda
            eski rozilik versiyasi saqlanib qoladi.
          </p>
          {policies.map((p) => (
            <div className="setting-row" key={p.version}>
              <strong>{p.version}</strong>
              <Badge tone={p.active ? 'green' : 'neutral'}>{p.active ? 'Faol' : 'Arxiv'}</Badge>
              <details>
                <summary>Matnni o‘qish</summary>
                <p className="policy-text">{p.content}</p>
              </details>
            </div>
          ))}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const form = event.currentTarget,
                f = new FormData(form);
              void run(async () => {
                await save(
                  '/admin/privacy',
                  policySchema.parse({
                    version: f.get('version'),
                    title: f.get('title'),
                    content: f.get('content'),
                    active: f.get('active') === 'on',
                  }),
                );
                form.reset();
              });
            }}
          >
            <label>
              Yangi versiya
              <input name="version" required placeholder="2026-09-v1" />
            </label>
            <label>
              Sarlavha
              <input name="title" required />
            </label>
            <label>
              Tasdiqlangan matn
              <textarea name="content" required minLength={100} rows={7} />
            </label>
            <label className="check-label">
              <input name="active" type="checkbox" />
              Faol siyosat qilish
            </label>
            <Button disabled={busy}>Yangi versiyani saqlash</Button>
          </form>
        </section>
      </div>
    </>
  );
}

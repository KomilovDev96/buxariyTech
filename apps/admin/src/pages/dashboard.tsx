import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, Inbox, Users, Eye, FileEdit, ArrowUpRight } from 'lucide-react';
import type { Dashboard } from '@buhariy/contracts';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Loading, ErrorBox, Button, Empty } from '../components/ui';
function activityLabel(entity: string) {
  if (entity.includes('/images')) return 'Loyiha rasmlari';
  if (entity.includes('/notes')) return 'Ichki qaydlar';
  const names: Record<string, string> = {
    projects: 'Loyihalar',
    requests: 'Arizalar',
    users: 'Foydalanuvchilar',
    team: 'Jamoa',
    services: 'Xizmatlar',
    categories: 'Toifalar',
    technologies: 'Texnologiyalar',
    settings: 'Sozlamalar',
    privacy: 'Maxfiylik siyosati',
  };
  return names[entity.split('/')[2]] || 'Boshqaruv';
}
const actionNames: Record<string, string> = {
  POST: 'Qo‘shildi',
  PATCH: 'Yangilandi',
  PUT: 'Almashtirildi',
  DELETE: 'O‘chirildi',
};
export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null),
    [error, setError] = useState('');
  const { user } = useAuth();
  useEffect(() => {
    api<Dashboard>('/admin/dashboard')
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);
  if (!data) return error ? <ErrorBox message={error} /> : <Loading />;
  const stats: [string, number, typeof FolderKanban][] = [
    ['Loyihalar', data.projects, FolderKanban],
    ['Nashr qilingan', data.published, Eye],
    ['Qoralamalar', data.drafts, FileEdit],
    ['Jamoa a’zolari', data.team, Users],
    ...(user?.role === 'ADMIN'
      ? [
          ['Yangi arizalar', data.newRequests, Inbox] as [string, number, typeof Inbox],
          ['Jarayonda', data.inProgress, FolderKanban] as [string, number, typeof Inbox],
        ]
      : []),
  ];
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">BOSHQARUV MARKAZI</p>
          <h1>Xush kelibsiz, {user?.name}.</h1>
          <p>Kontent, loyihalar va hamkorlik — bir joyda.</p>
        </div>
        <Button asChild>
          <Link to="/projects/new">
            Loyiha qo‘shish <ArrowUpRight size={17} />
          </Link>
        </Button>
      </div>
      <div className="stat-grid">
        {stats.map(([title, value, Icon]) => (
          <div className="stat-card" key={title}>
            <div>
              <span>{title}</span>
              <Icon size={20} />
            </div>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <h2>Tezkor amallar</h2>
          <Link className="action-row" to="/projects">
            Portfolio boshqaruvi <ArrowUpRight size={19} />
          </Link>
          {user?.role === 'ADMIN' && (
            <Link className="action-row" to="/requests">
              Arizalarni ko‘rib chiqish <ArrowUpRight size={19} />
            </Link>
          )}
          <Link className="action-row" to="/team">
            Jamoani yangilash <ArrowUpRight size={19} />
          </Link>
          <a
            className="action-row"
            href={import.meta.env.VITE_WEB_URL || 'http://localhost:3100'}
            target="_blank"
            rel="noreferrer"
          >
            Saytni ko‘rish <ArrowUpRight size={19} />
          </a>
        </section>
        {user?.role === 'ADMIN' && (
          <section className="panel">
            <h2>So‘nggi faoliyat</h2>
            {data.activity.length ? (
              data.activity.map((a) => (
                <div className="activity" key={a.id}>
                  <span>
                    {a.user?.name || 'Tizim'} · {actionNames[a.action] || 'O‘zgartirildi'}
                  </span>
                  <small>{activityLabel(a.entity)}</small>
                  <time>{new Date(a.createdAt).toLocaleString('uz-UZ')}</time>
                </div>
              ))
            ) : (
              <Empty text="Bajarilgan amallar shu yerda ko‘rinadi." />
            )}
          </section>
        )}
      </div>
    </>
  );
}

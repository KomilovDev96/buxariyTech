import { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate, Outlet, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Layers,
  Inbox,
  Workflow,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Code2,
  ArrowUpRight,
  LockKeyhole,
} from 'lucide-react';
import { AuthProvider, useAuth } from './lib/auth';
import { Button, Loading, ErrorBox } from './components/ui';
const Dashboard = lazy(() => import('./pages/dashboard')),
  Projects = lazy(() => import('./pages/projects')),
  ProjectEditor = lazy(() => import('./pages/project-editor')),
  Resources = lazy(() => import('./pages/resources')),
  Requests = lazy(() => import('./pages/requests')),
  SiteBlocksPage = lazy(() => import('./pages/site-blocks')),
  SettingsPage = lazy(() => import('./pages/settings')),
  UsersPage = lazy(() => import('./pages/users'));
function Login() {
  const { user, login, loading } = useAuth();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  if (loading) return <Loading />;
  if (user) return <Navigate to="/" replace />;
  return (
    <div className="login-page">
      <div className="login-brand">
        <Link to="/" className="wordmark">
          BUHARIY<span>TECH</span>
        </Link>
        <p>Qadriyatlardan kelajakka.</p>
      </div>
      <form
        className="login-card"
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          setBusy(true);
          setError('');
          try {
            await login(String(f.get('email')), String(f.get('password')));
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Kirish amalga oshmadi');
          } finally {
            setBusy(false);
          }
        }}
      >
        <LockKeyhole className="gold" size={27} />
        <p className="eyebrow">BOSHQARUV PANELI</p>
        <h1>Xush kelibsiz.</h1>
        <p className="muted">Davom etish uchun hisobingizga kiring.</p>
        <ErrorBox message={error} />
        <label>
          Email
          <input name="email" type="email" autoComplete="username" required />
        </label>
        <label>
          Parol
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        <Button disabled={busy}>
          {busy ? 'Kirilmoqda…' : 'Tizimga kirish'}
          <ArrowUpRight size={18} />
        </Button>
        <small>Faqat vakolatli jamoa a’zolari uchun.</small>
      </form>
    </div>
  );
}
function AdminOnly() {
  return useAuth().user?.role === 'ADMIN' ? <Outlet /> : <Navigate to="/" replace />;
}
function Layout() {
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false),
    [error, setError] = useState('');
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  const links = [
    ['/', 'Dashboard', LayoutDashboard],
    ['/projects', 'Loyihalar', FolderKanban],
    ['/categories', 'Toifalar', Layers],
    ['/technologies', 'Texnologiyalar', Code2],
    ...(user.role === 'ADMIN' ? [['/requests', 'Arizalar', Inbox]] : []),
    ['/services', 'Xizmatlar', Workflow],
    ['/solutions', 'Tayyor yechimlar', Layers],
    ['/team', 'Jamoa', Users],
    ['/site-blocks', 'Sayt bloklari', LayoutDashboard],
    ...(user.role === 'ADMIN' ? [['/settings', 'Sozlamalar', Settings]] : []),
  ] as const;
  return (
    <div className="admin-shell">
      <button
        className="mobile-menu"
        onClick={() => setOpen(!open)}
        aria-label="Menyu"
        aria-expanded={open}
      >
        {open ? <X /> : <Menu />}
      </button>
      {open && (
        <button
          className="sidebar-backdrop"
          aria-label="Menyuni yopish"
          onClick={() => setOpen(false)}
        />
      )}
      <aside className={open ? 'sidebar sidebar-open' : 'sidebar'}>
        <Link to="/" className="wordmark">
          BUHARIY<span>TECH</span>
        </Link>
        <p className="sidebar-label">WORKSPACE</p>
        <nav aria-label="Boshqaruv navigatsiyasi">
          {links.map(([path, label, Icon]) => {
            const I = Icon as typeof Menu;
            return (
              <NavLink
                to={path as string}
                key={path as string}
                end={path === '/'}
                onClick={() => setOpen(false)}
              >
                <I size={18} />
                {label as string}
              </NavLink>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="user-avatar">{user.name.slice(0, 1).toUpperCase()}</div>
          <div>
            <strong>{user.name}</strong>
            <small>{user.role}</small>
          </div>
          <button aria-label="Chiqish" onClick={() => logout().catch((e) => setError(e.message))}>
            <LogOut size={18} />
          </button>
        </div>
      </aside>
      <div className="admin-body">
        <header className="admin-topbar">
          <span>
            BUHARIY TECH <span className="muted">/ Boshqaruv</span>
          </span>
          <a
            href={import.meta.env.VITE_WEB_URL || 'http://localhost:3100'}
            target="_blank"
            rel="noreferrer"
          >
            Saytni ko‘rish <ArrowUpRight size={15} />
          </a>
        </header>
        <main className="admin-main">
          <ErrorBox message={error} />
          <Suspense fallback={<Loading />}>
            <Outlet />
          </Suspense>
        </main>
        <footer className="admin-footer">BUHARIY TECH · Qadriyatlardan kelajakka</footer>
      </div>
    </div>
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="site-blocks" element={<SiteBlocksPage />} />
            <Route path="projects/:id" element={<ProjectEditor />} />
            {['categories', 'technologies', 'services', 'team', 'solutions'].map((r) => (
              <Route path={r} key={r} element={<Resources resource={r} key={r} />} />
            ))}
            <Route element={<AdminOnly />}>
              <Route path="requests" element={<Requests />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="users" element={<UsersPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

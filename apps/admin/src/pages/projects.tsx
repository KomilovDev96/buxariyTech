import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ArrowUpRight } from 'lucide-react';
import type { Page, Project } from '@buhariy/contracts';
import { api } from '../lib/api';
import { Badge, Button, Empty, ErrorBox, Loading } from '../components/ui';
export default function Projects() {
  const [page, setPage] = useState(1),
    [data, setData] = useState<Page<Project> | null>(null),
    [error, setError] = useState('');
  useEffect(() => {
    setError('');
    api<Page<Project>>(`/admin/projects?page=${page}`)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [page]);
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">PORTFOLIO</p>
          <h1>Loyihalar</h1>
          <p>Konseptdan nashrgacha — har bir loyiha nazoratda.</p>
        </div>
        <Button asChild>
          <Link to="/projects/new">
            <Plus size={17} />
            Loyiha qo‘shish
          </Link>
        </Button>
      </div>
      <ErrorBox message={error} />
      {!data && !error ? (
        <Loading />
      ) : data?.items.length ? (
        <>
          <div className="admin-project-grid">
            {data.items.map((p) => (
              <Link to={`/projects/${p.id}`} className="admin-project-card" key={p.id}>
                <div className="admin-cover">
                  {p.images.length ? (
                    <img src={(p.images.find((i) => i.isCover) || p.images[0]).url} alt={p.title} />
                  ) : (
                    <strong>{p.title}</strong>
                  )}
                  <Badge tone={p.published ? 'green' : 'gold'}>
                    {p.published ? 'Nashr qilingan' : 'Qoralama'}
                  </Badge>
                </div>
                <div className="admin-project-body">
                  <div className="flex-between">
                    <h2>{p.title}</h2>
                    <ArrowUpRight size={20} />
                  </div>
                  <p>{p.shortDescription}</p>
                  <div className="flex-between">
                    <small>{p.category?.name || 'Toifasiz'}</small>
                    <small>{p.images.length} / 5 rasm</small>
                  </div>
                  {p.concept && <Badge>Concept Project</Badge>}
                </div>
              </Link>
            ))}
          </div>
          <div className="pagination">
            <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>
              ← Oldingi
            </Button>
            <span>
              {page} / {data.pages || 1}
            </span>
            <Button
              variant="outline"
              disabled={page >= data.pages}
              onClick={() => setPage(page + 1)}
            >
              Keyingi →
            </Button>
          </div>
        </>
      ) : (
        !error && <Empty />
      )}
    </>
  );
}

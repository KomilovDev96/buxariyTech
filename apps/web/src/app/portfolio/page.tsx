import Link from 'next/link';
import type { Page, Project } from '@buhariy/contracts';
import { api } from '@/lib/api';
import { getDictionary } from '@/lib/i18n';
import { seo } from '@/lib/metadata';
import type { Metadata } from 'next';
import { SectionHeading, ProjectCard, CTA } from '@/components/content';
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}): Promise<Metadata> {
  const { category, page } = await searchParams;
  const hasFilters = Boolean(category || (page && page !== '1'));
  return {
    ...seo(
      'Portfolio',
      'Biznes uchun raqamli mahsulotlar va BUHARIY TECH konsept loyihalari.',
      '/portfolio',
    ),
    ...(hasFilters ? { robots: { index: false, follow: true } } : {}),
  };
}
export default async function Portfolio({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const { category = '', page = '1' } = await searchParams;
  const safePage = /^[1-9][0-9]{0,4}$/.test(page) ? page : '1';
  const [t, projects] = await Promise.all([
    getDictionary(),
    api<Page<Project>>(
      `/projects?limit=12&page=${safePage}&category=${encodeURIComponent(category)}`,
    ),
  ]);
  const filters = [
    ['', t.all],
    ['web', 'Web'],
    ['telegram', 'Telegram'],
    ['automation', 'Automation'],
    ['ai', 'AI'],
    ['business-systems', 'Business Systems'],
  ];
  return (
    <>
      <section className="section container page-intro">
        <SectionHeading
          headingAs="h1"
          number="02"
          label="PORTFOLIO"
          title={t.work}
          description={t.workIntro}
        />
        <nav className="filters" aria-label="Portfolio toifalari">
          {filters.map(([value, label]) => (
            <Link
              aria-current={category === value ? 'page' : undefined}
              className={category === value ? 'active' : ''}
              key={value}
              href={`/portfolio${value ? '?category=' + value : ''}`}
            >
              {label}
            </Link>
          ))}
        </nav>
        {projects.items.length ? (
          <div className="project-grid portfolio-grid">
            {projects.items.map((p) => (
              <ProjectCard project={p} key={p.id} />
            ))}
          </div>
        ) : (
          <div className="empty-state">{t.empty}</div>
        )}
        <div className="pagination">
          {projects.page > 1 && (
            <Link
              className="button outline"
              href={`?category=${category}&page=${projects.page - 1}`}
            >
              ← {t.back}
            </Link>
          )}
          {projects.pages > 1 && (
            <span>
              {projects.page} / {projects.pages}
            </span>
          )}
          {projects.page < projects.pages && (
            <Link
              className="button outline"
              href={`?category=${category}&page=${projects.page + 1}`}
            >
              →
            </Link>
          )}
        </div>
      </section>
      <CTA t={t} />
    </>
  );
}

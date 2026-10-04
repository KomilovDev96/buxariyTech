import type { Service } from '@buhariy/contracts';
import Link from 'next/link';
import { api } from '@/lib/api';
import { getDictionary } from '@/lib/i18n';
import { editorial as e } from '@/lib/editorial';
import { seo } from '@/lib/metadata';
import { CTA } from '@/components/content';
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const s = await api<Service>(`/services/${encodeURIComponent(slug)}`);
  return seo(s.title, s.description, `/services/${s.slug}`);
}
export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const [s, t] = await Promise.all([
    api<Service>(`/services/${encodeURIComponent(slug)}`),
    getDictionary(),
  ]);
  return (
    <>
      <article className="section container page-intro">
        <Link className="text-link gold" href="/services">
          ← {t.allServices}
        </Link>
        <p className="eyebrow spaced">BUHARIY TECH / XIZMATLAR</p>
        <h1>{s.title}</h1>
        <p className="lead-text">{s.description}</p>
        <div className="service-detail">
          <div className="prose">
            {s.body
              .split('\n')
              .filter(Boolean)
              .map((p, i) => (
                <p key={i}>{p}</p>
              ))}
          </div>
          <aside className="detail-aside">
            <p className="eyebrow">INDIVIDUAL YONDASHUV</p>
            <h3>{e.pricingTitle}</h3>
            <p>{e.pricing}</p>
            <Link href="/contact" className="button">
              {t.start} ↗
            </Link>
          </aside>
        </div>
      </article>
      <CTA t={t} />
    </>
  );
}

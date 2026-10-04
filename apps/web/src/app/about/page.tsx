import type { TeamMember } from '@buhariy/contracts';
import { api } from '@/lib/api';
import { getDictionary } from '@/lib/i18n';
import { seo } from '@/lib/metadata';
import { editorial as e } from '@/lib/editorial';
import { Team, CTA, Story, Why } from '@/components/content';
export const metadata = seo(
  'Biz haqimizda',
  'Buxorodan — kelajakka. BUHARIY TECH biznes uchun zamonaviy raqamli tizimlar yaratadi.',
  '/about',
);
export default async function About() {
  const [t, team] = await Promise.all([getDictionary(), api<TeamMember[]>('/team')]);
  return (
    <>
      <section className="section container page-intro">
        <p className="eyebrow">BUHARIY TECH</p>
        <h1>{t.footer}</h1>
        <p className="lead-text">{e.complexityText}</p>
      </section>
      <Story t={t} />
      <Why />
      <Team members={team} t={t} />
      <CTA t={t} />
    </>
  );
}

import { solutionCopy } from '@/lib/solution-copy';
import type { BusinessSolution, PrivacyPolicy } from '@buhariy/contracts';
import { api } from '@/lib/api';
import { getDictionary, getLocale } from '@/lib/i18n';
import { seo } from '@/lib/metadata';
import { editorial as e } from '@/lib/editorial';
import { ContactForm } from '@/components/contact-form';
export const metadata = seo(
  'Bog‘lanish',
  'Loyihangizni BUHARIY TECH bilan muhokama qiling. Har bir loyiha individual baholanadi.',
  '/contact',
);
export default async function Contact({
  searchParams,
}: {
  searchParams: Promise<{ solution?: string | string[] }>;
}) {
  const [t, locale, policy] = await Promise.all([
    getDictionary(),
    getLocale(),
    api<PrivacyPolicy>('/privacy', true),
  ]);
  const query = (await searchParams).solution;
  const solutions =
    typeof query === 'string' && query.length <= 120
      ? await api<BusinessSolution[]>(`/solutions?locale=${locale}`, true)
      : [];
  const selected = solutions.find((item) => item.slug === query);
  const copy = solutionCopy[locale];
  const initialDescription = selected
    ? `${selected.readiness === 'AVAILABLE' ? copy.interest : copy.planned}: ${selected.title}.`
    : '';
  return (
    <section className="section container page-intro contact-layout">
      <div>
        <p className="eyebrow">BIRINCHI QADAM</p>
        <h1>{t.contact}</h1>
        <p className="lead-text">{t.contactIntro}</p>
        <div className="contact-pricing">
          <h3>{e.pricingTitle}</h3>
          <p>{e.pricing}</p>
          <span className="gold">Buxoro, O‘zbekiston</span>
        </div>
      </div>
      <ContactForm
        key={selected?.id || 'general'}
        version={policy.version}
        locale={locale}
        initialDescription={initialDescription}
        selectedTitle={selected ? `${copy.selected}: ${selected.title}` : ''}
      />
    </section>
  );
}

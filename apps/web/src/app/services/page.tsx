import type { Service } from '@buhariy/contracts';
import { api } from '@/lib/api';
import { getDictionary } from '@/lib/i18n';
import { seo } from '@/lib/metadata';
import { SectionHeading, ServiceGrid, CTA } from '@/components/content';
export const metadata = seo(
  'Xizmatlar',
  'Biznes avtomatlashtirish, web dasturlash, Telegram botlar, AI, CRM va integratsiyalar.',
  '/services',
);
export default async function Services() {
  const [t, services] = await Promise.all([getDictionary(), api<Service[]>('/services')]);
  return (
    <>
      <section className="section container page-intro">
        <SectionHeading
          headingAs="h1"
          number="01"
          label="XIZMATLAR"
          title={t.services}
          description={t.servicesIntro}
        />
        <ServiceGrid services={services} />
      </section>
      <CTA t={t} />
    </>
  );
}

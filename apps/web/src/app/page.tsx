import { SolutionsSection } from '@/components/solutions-section';
import Link from 'next/link';
import { ArrowUpRight, ArrowRight, Minus } from 'lucide-react';
import type { Page, Project, Service, TeamMember, PrivacyPolicy } from '@buhariy/contracts';
import { getDictionary, getLocale } from '@/lib/i18n';
import { editorial as e } from '@/lib/editorial';
import { api } from '@/lib/api';
import { seo } from '@/lib/metadata';
import { Hero } from '@/components/hero';
import {
  SectionHeading,
  ServiceGrid,
  ProjectCard,
  Team,
  CTA,
  Story,
  Why,
} from '@/components/content';
import { Reveal } from '@/components/reveal';
import { ContactForm } from '@/components/contact-form';
export const metadata = seo(
  'BUHARIY TECH — Biznes uchun raqamli yechimlar',
  'BUHARIY TECH — biznes avtomatlashtirish, Telegram botlar, web-saytlar, AI yechimlar va maxsus raqamli tizimlar yaratadi.',
  '/',
);
export default async function Home() {
  const [t, locale, services, projects, team, policy] = await Promise.all([
    getDictionary(),
    getLocale(),
    api<Service[]>('/services'),
    api<Page<Project>>('/projects?limit=3'),
    api<TeamMember[]>('/team'),
    api<PrivacyPolicy>('/privacy', true),
  ]);
  return (
    <>
      <Hero t={t} />
      <section className="section container">
        <SectionHeading
          number="01"
          label="XIZMATLAR"
          title={t.services}
          description={t.servicesIntro}
        >
          <Link className="text-link" href="/services">
            {t.allServices}
            <ArrowUpRight size={18} />
          </Link>
        </SectionHeading>
        <ServiceGrid services={services} />
      </section>
      <SolutionsSection />
      <Reveal>
        <section className="problem-section">
          <div className="container problem-layout">
            <div>
              <p className="eyebrow">02 / MUAMMODAN YECHIMGA</p>
              <h2>{e.problemsTitle}</h2>
              <p className="gold statement">{e.problemsAnswer}</p>
            </div>
            <div className="problem-list">
              {e.problems.map((p) => (
                <div key={p}>
                  <Minus size={18} />
                  {p}
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>
      <section className="section container complexity">
        <SectionHeading
          number="03"
          label="IMKONIYATLAR"
          title={e.complexityTitle}
          description={e.complexityText}
        />
        <div className="complexity-flow">
          {e.layers.map((l, i) => (
            <div key={l}>
              <span className="flow-number">0{i + 1}</span>
              <h3>{l}</h3>
              {i < e.layers.length - 1 && <ArrowRight size={17} />}
            </div>
          ))}
        </div>
      </section>
      <section className="section container process">
        <SectionHeading number="04" label="JARAYON" title={e.processTitle} />
        <div className="process-grid">
          {e.steps.map(([title, body], i) => (
            <article key={title}>
              <span>0{i + 1}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="portfolio-section">
        <div className="container section">
          <SectionHeading number="05" label="PORTFOLIO" title={t.work} description={t.workIntro}>
            <Link className="text-link" href="/portfolio">
              {t.portfolio}
              <ArrowUpRight size={18} />
            </Link>
          </SectionHeading>
          <div className="project-grid">
            {projects.items.map((p) => (
              <ProjectCard project={p} key={p.id} />
            ))}
          </div>
        </div>
      </section>
      <Reveal>
        <section className="section container">
          <SectionHeading number="06" label="NATIJA" title={e.benefitsTitle} />
          <div className="benefit-grid">
            {e.benefits.map(([title, body], i) => (
              <article key={title}>
                <span>0{i + 1} /</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>
      </Reveal>
      <Why />
      <Story t={t} />
      <Team members={team} t={t} />
      <section className="pricing container">
        <div>
          <p className="eyebrow">HAMKORLIK</p>
          <h2>{e.pricingTitle}</h2>
        </div>
        <div>
          <p>{e.pricing}</p>
          <p>{e.pricingSecond}</p>
          <Link href="/contact" className="text-link gold">
            Loyihani muhokama qilish <ArrowUpRight size={20} />
          </Link>
        </div>
      </section>
      <CTA t={t} />
      <section className="section container contact-layout" id="contact">
        <div>
          <p className="eyebrow">10 / BOG‘LANISH</p>
          <h2>{t.contact}</h2>
          <p className="section-description">{t.contactIntro}</p>
        </div>
        <ContactForm version={policy.version} locale={locale} />
      </section>
    </>
  );
}

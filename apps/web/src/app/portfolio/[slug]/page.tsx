import {
  Target,
  Building2,
  CircleAlert,
  Workflow,
  BrainCircuit,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';
import { ProjectGallery } from '@/components/project-gallery';
import Link from 'next/link';
import type { Project } from '@buhariy/contracts';
import { api } from '@/lib/api';
import { getDictionary, getLocale } from '@/lib/i18n';
import { seo } from '@/lib/metadata';
import { CTA } from '@/components/content';
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const p = await api<Project>(`/projects/${encodeURIComponent(slug)}`);
  const cover = p.images.find((i) => i.isCover) || p.images[0];
  const meta = seo(p.title, p.shortDescription, `/portfolio/${p.slug}`);
  return {
    ...meta,
    openGraph: { ...meta.openGraph, images: cover ? [cover.url] : [] },
    twitter: { ...meta.twitter, images: cover ? [cover.url] : [] },
  };
}
export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const [p, t, locale] = await Promise.all([
    api<Project>(`/projects/${encodeURIComponent(slug)}`),
    getDictionary(),
    getLocale(),
  ]);
  const copy = {
    uz: {
      goal: 'Loyiha maqsadi',
      business: 'Biznes konteksti',
      ai: 'AI qanday yordam beradi',
      overview: 'Loyiha haqida',
      contents: 'Keys mazmuni',
      client: 'Mijoz / soha',
      stack: 'Texnologiyalar',
      concept:
        'Konsept: haqiqiy mijoz loyihasi emas. Quyida taklif etilgan yechim va kutilayotgan natijalar tasvirlangan.',
      open: 'Kattalashtirish',
      close: 'Yopish',
      previous: 'Oldingi rasm',
      next: 'Keyingi rasm',
      image: 'Rasm',
    },
    ru: {
      goal: 'Цель проекта',
      business: 'Бизнес-контекст',
      ai: 'Как помогает AI',
      overview: 'О проекте',
      contents: 'Содержание кейса',
      client: 'Клиент / отрасль',
      stack: 'Технологии',
      concept:
        'Концепт: это не проект реального клиента. Ниже описаны предлагаемое решение и ожидаемые результаты.',
      open: 'Увеличить',
      close: 'Закрыть',
      previous: 'Предыдущее изображение',
      next: 'Следующее изображение',
      image: 'Изображение',
    },
    en: {
      goal: 'Project goal',
      business: 'Business context',
      ai: 'The role of AI',
      overview: 'Project overview',
      contents: 'Inside the case',
      client: 'Client / industry',
      stack: 'Technology stack',
      concept:
        'Concept: this is not a real client engagement. The proposed solution and expected outcomes are described below.',
      open: 'Expand image',
      close: 'Close',
      previous: 'Previous image',
      next: 'Next image',
      image: 'Image',
    },
  }[locale];
  const sections = [
    { id: 'goal', title: copy.goal, body: p.goal, Icon: Target },
    { id: 'business', title: copy.business, body: p.businessContext, Icon: Building2 },
    { id: 'challenge', title: t.challenge, body: p.challenge, Icon: CircleAlert },
    { id: 'solution', title: t.solution, body: p.solution, Icon: Workflow },
    { id: 'ai', title: copy.ai, body: p.aiContribution, Icon: BrainCircuit },
    { id: 'result', title: t.result, body: p.result, Icon: TrendingUp },
  ].filter((section) => section.body?.trim());
  return (
    <>
      <article className="container case-study">
        <header className="case-intro">
          <Link className="text-link gold" href="/portfolio">
            ← {t.work}
          </Link>
          <div className="case-heading-row">
            <p className="eyebrow">
              {p.category?.name || 'BUHARIY TECH'} / {p.year}
            </p>
            <span className="case-type">
              {p.concept ? 'Concept Project' : 'Case Study'} <ArrowUpRight size={15} />
            </span>
          </div>
          <h1>{p.title}</h1>
          <p className="case-summary">{p.shortDescription}</p>
          {p.concept && <p className="concept-notice">{copy.concept}</p>}
          <div className="case-facts">
            {p.client && (
              <div>
                <span>{copy.client}</span>
                <strong>{p.client}</strong>
              </div>
            )}
            {p.technologies.length > 0 && (
              <div>
                <span>{copy.stack}</span>
                <div className="tags">
                  {p.technologies.map((tech) => (
                    <span key={tech.id}>{tech.name}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>
        {p.images.length > 0 ? (
          <ProjectGallery images={p.images.slice(0, 5)} title={p.title} labels={copy} />
        ) : (
          <div className="case-blueprint">
            <span className="eyebrow">
              {p.concept ? 'CONCEPT / PRODUCT DESIGN' : 'BUHARIY TECH / ENGINEERING'}
            </span>
            <strong>
              {p.title}
              <ArrowUpRight />
            </strong>
            <div className="blueprint-flow">
              <span>{copy.goal}</span>
              <i>→</i>
              <span>{t.solution}</span>
              <i>→</i>
              <span>{t.result}</span>
            </div>
          </div>
        )}
        <div className="case-layout">
          <nav className="case-index" aria-label={copy.contents}>
            <span className="eyebrow">{copy.contents}</span>
            <a href="#overview">
              00 <span>{copy.overview}</span>
            </a>
            {sections.map((section, i) => (
              <a href={`#${section.id}`} key={section.id}>
                {String(i + 1).padStart(2, '0')} <span>{section.title}</span>
              </a>
            ))}
          </nav>
          <div className="case-narrative">
            <section className="case-chapter" id="overview">
              <span className="eyebrow">00 / OVERVIEW</span>
              <h2>{copy.overview}</h2>
              <div className="case-prose">
                {p.description
                  .split(/\n+/)
                  .filter(Boolean)
                  .map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
              </div>
            </section>
            {sections.map(({ id, title, body, Icon }, i) => (
              <div className="case-reveal" key={id}>
                <section className={`case-chapter chapter-${id}`} id={id}>
                  <div className="chapter-label">
                    <span className="eyebrow">
                      {String(i + 1).padStart(2, '0')} / {id.toUpperCase()}
                    </span>
                    <Icon size={25} strokeWidth={1.3} />
                  </div>
                  <h2>{title}</h2>
                  <div className="case-prose">
                    {body
                      .split(/\n+/)
                      .filter(Boolean)
                      .map((line, n) => (
                        <p key={n}>{line}</p>
                      ))}
                  </div>
                </section>
              </div>
            ))}
          </div>
        </div>
      </article>
      <CTA t={t} />
    </>
  );
}

import { getSiteBlock } from '@/lib/site-blocks';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowUpRight,
  Code2,
  Bot,
  Workflow,
  BrainCircuit,
  Database,
  Plug,
  ArrowRight,
  Check,
} from 'lucide-react';
import type { Service, Project, TeamMember } from '@buhariy/contracts';
import type { Dictionary } from '@/lib/i18n';
import { editorial as e } from '@/lib/editorial';
const icons = {
  code: Code2,
  bot: Bot,
  workflow: Workflow,
  brain: BrainCircuit,
  database: Database,
  plug: Plug,
};
export function SectionHeading({
  number,
  label,
  title,
  description,
  children,
  headingAs = 'h2',
}: {
  headingAs?: 'h1' | 'h2';
  number: string;
  label: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  const Heading = headingAs;
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">
          {number} / {label}
        </p>
        <Heading>{title}</Heading>
        {description && <p className="section-description">{description}</p>}
      </div>
      {children}
    </div>
  );
}
export function ServiceGrid({ services }: { services: Service[] }) {
  return (
    <div className="service-grid">
      {services.map((s, i) => {
        const Icon = icons[s.icon] || Code2;
        return (
          <Link href={`/services/${s.slug}`} className="service-card" key={s.id}>
            <div className="service-card-top">
              <Icon size={28} strokeWidth={1.2} />
              <span>0{i + 1}</span>
            </div>
            <h3>{s.title}</h3>
            <p>{s.description}</p>
            <ArrowUpRight className="card-arrow" size={21} />
          </Link>
        );
      })}
    </div>
  );
}
export function ProjectCard({ project: p }: { project: Project }) {
  const cover = p.images.find((i) => i.isCover) || p.images[0];
  return (
    <Link href={`/portfolio/${p.slug}`} className="project-card">
      <div className={`project-cover concept-${p.category?.slug || 'web'}`}>
        {cover ? (
          <Image
            src={cover.url}
            alt={cover.alt || p.title}
            fill
            sizes="(max-width:768px) 90vw, 45vw"
          />
        ) : (
          <div className="concept-diagram">
            <span className="concept-top">
              {p.concept ? 'CONCEPT / PRODUCT DESIGN' : 'BUHARIY TECH / PROJECT'}
            </span>
            <strong>
              {p.title}
              <span>↗</span>
            </strong>
            <div className="diagram-flow">
              <span>Input</span>
              <ArrowRight size={18} />
              <span>{p.category?.name || 'System'}</span>
              <ArrowRight size={18} />
              <span>Result</span>
            </div>
          </div>
        )}
        {p.concept && <span className="concept-badge">Concept Project</span>}
      </div>
      <div className="project-meta">
        <span>{p.category?.name}</span>
        <span>{p.year}</span>
      </div>
      <div className="project-title">
        <h3>{p.title}</h3>
        <ArrowUpRight size={24} />
      </div>
      <p>{p.shortDescription}</p>
      <div className="tags">
        {p.technologies.map((t) => (
          <span key={t.id}>{t.name}</span>
        ))}
      </div>
    </Link>
  );
}
export function Team({ members, t }: { members: TeamMember[]; t: Dictionary }) {
  return (
    <section className="section container">
      <SectionHeading number="09" label="JAMOA" title={t.team} description={t.teamIntro} />
      {members.length ? (
        <div className="team-grid">
          {members.map((m) => (
            <article className="team-card" key={m.id}>
              {m.photo && (
                <img src={m.photo} alt={m.name} loading="lazy" width={400} height={400} />
              )}
              <h3>{m.name}</h3>
              <p className="gold">{m.position}</p>
              <p>{m.bio}</p>
              <div className="tags">
                {m.skills.map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
              <div className="team-social">
                {m.linkedin && (
                  <a href={m.linkedin} target="_blank" rel="noopener noreferrer">
                    LinkedIn ↗
                  </a>
                )}
                {m.telegram && (
                  <a href={m.telegram} target="_blank" rel="noopener noreferrer">
                    Telegram ↗
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">{e.teamEmpty}</div>
      )}
    </section>
  );
}
export async function CTA({ t }: { t: Dictionary }) {
  const block = await getSiteBlock('cta');
  return (
    <section className={`cta-section container ${block.imageUrl ? 'cta-with-image' : ''}`}>
      {block.imageUrl && (
        <Image
          className="cta-background"
          src={block.imageUrl}
          alt={block.imageAlt}
          fill
          sizes="90vw"
        />
      )}
      <p className="eyebrow">{block.label}</p>
      <h2>{block.title}</h2>
      <p>{block.body}</p>
      <Link className="button" href="/contact">
        {t.start}
        <ArrowUpRight size={20} />
      </Link>
    </section>
  );
}
export async function Story({ t }: { t: Dictionary }) {
  const block = await getSiteBlock('story');
  return (
    <section className="story section container">
      <div className="story-image">
        <Image
          src={block.imageUrl}
          alt={block.imageAlt}
          fill
          sizes="(max-width:768px) 90vw, 40vw"
        />
        <span>BUXORO, O‘ZBEKISTON</span>
      </div>
      <div>
        <p className="eyebrow">{block.label}</p>
        <h2>{block.title}</h2>
        <p className="preserve-lines">{block.body}</p>
        <blockquote>{t.tagline}.</blockquote>
      </div>
    </section>
  );
}
export function Why() {
  return (
    <section className="section container">
      <SectionHeading number="07" label="YONDASHUVIMIZ" title={e.whyTitle} />
      <div className="why-grid">
        {e.why.map((s) => (
          <div key={s}>
            <Check size={21} />
            <h3>{s}</h3>
          </div>
        ))}
      </div>
    </section>
  );
}

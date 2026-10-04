import { getSiteBlock } from '@/lib/site-blocks';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, ArrowDownRight, Layers3, Check } from 'lucide-react';
import type { Dictionary } from '@/lib/i18n';
export async function Hero({ t }: { t: Dictionary }) {
  const block = await getSiteBlock('hero');
  const lines = block.title.split('\n');
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="gold-line" />
            {block.label}
          </p>
          <h1>
            {lines.map((line, index) => (
              <span className="hero-line" key={index}>
                {index === 1 ? <em>{line}</em> : line}
              </span>
            ))}
          </h1>
          <p className="hero-description">{block.body}</p>
          <div className="button-row">
            <Link href="/contact" className="button">
              {t.start}
              <ArrowUpRight size={20} />
            </Link>
            <Link href="/portfolio" className="text-link">
              {t.portfolio}
              <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="hero-foot">
            <span>01 —</span>
            <p>{t.heroNote}</p>
            <ArrowDownRight size={24} />
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-label">
            <span>HERITAGE × TECHNOLOGY</span>
            <span>39°46′ N · 64°25′ E</span>
          </div>
          <div className="arch-photo">
            <Image
              src={block.imageUrl}
              alt={block.imageAlt}
              fill
              loading="eager"
              fetchPriority="high"
              sizes="(max-width: 768px) 90vw, 40vw"
            />
            <div className="photo-shade" />
          </div>
          <div className="heritage-caption">
            <span>BUKHARA → FUTURE</span>
            <p>{t.tagline}.</p>
          </div>
          <div className="system-chip">
            <Layers3 size={22} />
            <div>
              <strong>G‘oya → Tizim → Natija</strong>
              <span>BUHARIY TECH / ENGINEERING</span>
            </div>
          </div>
          <span className="visual-coordinate">EST. IN BUKHARA · BUILT FOR BUSINESS</span>
        </div>
      </section>
      <div className="trust-bar container">
        {t.trust.map((s, i) => (
          <div key={s}>
            <Check size={17} />
            <span>{s}</span>
            <small>0{i + 1}</small>
          </div>
        ))}
      </div>
    </>
  );
}

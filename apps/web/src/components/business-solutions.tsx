'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  Factory,
  Store,
  Wrench,
  Network,
  Check,
  ArrowUpRight,
  ArrowRight,
  Plus,
  Blocks,
} from 'lucide-react';
import type { BusinessSolution } from '@buhariy/contracts';
import { solutionSectors } from '@buhariy/contracts';
import { solutionCopy } from '@/lib/solution-copy';
import type { Locale } from '@/lib/i18n';
const icons = { FINANCE: Network, MANUFACTURING: Factory, TRADE: Store, SERVICES: Wrench };
export function BusinessSolutions({
  items,
  locale,
}: {
  items: BusinessSolution[];
  locale: Locale;
}) {
  const [sector, setSector] = useState<string>('ALL');
  const t = solutionCopy[locale];
  const visible = sector === 'ALL' ? items : items.filter((item) => item.sector === sector);
  return (
    <>
      <div className="solution-filters" role="group" aria-label={t.all}>
        <button type="button" aria-pressed={sector === 'ALL'} onClick={() => setSector('ALL')}>
          {t.all}
          <span>{items.length}</span>
        </button>
        {solutionSectors
          .filter((s) => items.some((item) => item.sector === s))
          .map((s) => {
            const Icon = icons[s];
            return (
              <button
                key={s}
                type="button"
                aria-pressed={sector === s}
                onClick={() => setSector(s)}
              >
                <Icon size={16} />
                {t.sectors[s]}
              </button>
            );
          })}
      </div>
      <div className="solution-grid" aria-live="polite">
        {visible.map((item) => {
          const Icon = icons[item.sector],
            available = item.readiness === 'AVAILABLE';
          return (
            <article
              className={`solution-card ${item.featured ? 'solution-featured' : ''}`}
              key={item.id}
            >
              <div className="solution-card-top">
                <div className="solution-icon">
                  <Icon size={28} strokeWidth={1.3} />
                </div>
                <span className={`solution-status ${available ? 'available' : ''}`}>
                  {available ? t.available : t.concept}
                </span>
              </div>
              <p className="eyebrow">{t.sectors[item.sector]}</p>
              <h3>{item.title}</h3>
              <p className="solution-description">{item.description}</p>
              <div className="solution-audience">
                <span>{t.for}</span>
                <p>{item.audience}</p>
              </div>
              <h4>{available ? t.included : t.proposed}</h4>
              <ul>
                {item.features.map((feature, i) => (
                  <li key={i}>
                    <Check size={16} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              {(item.workflow.length > 0 || item.outcome) && (
                <details className="solution-details">
                  <summary>
                    {t.details}
                    <Plus size={17} />
                  </summary>
                  {item.workflow.length > 0 && (
                    <>
                      <p className="eyebrow">{t.flow}</p>
                      <ol className="solution-workflow">
                        {item.workflow.map((step, i) => (
                          <li key={i}>
                            <span>{String(i + 1).padStart(2, '0')}</span>
                            {step}
                            {i < item.workflow.length - 1 && <ArrowRight size={14} />}
                          </li>
                        ))}
                      </ol>
                    </>
                  )}
                  {item.outcome && <p className="solution-outcome">{item.outcome}</p>}
                </details>
              )}
              <div className="solution-card-bottom">
                <p>{item.priceLabel || t.price}</p>
                <Link
                  className={item.featured ? 'button' : 'button outline'}
                  href={`/contact?solution=${encodeURIComponent(item.slug)}`}
                >
                  {available ? t.action : t.conceptAction}
                  <ArrowUpRight size={18} />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
      <div className="solution-launch">
        <div>
          <Blocks size={24} />
          <h3>{t.budgetTitle}</h3>
          <p>{t.budgetBody}</p>
        </div>
        <ol>
          {t.steps.map((step, i) => (
            <li key={step}>
              <span>0{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}

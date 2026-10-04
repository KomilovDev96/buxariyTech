import Image from 'next/image';
import type { BusinessSolution } from '@buhariy/contracts';
import { api } from '@/lib/api';
import { getLocale } from '@/lib/i18n';
import { getSiteBlock } from '@/lib/site-blocks';
import { BusinessSolutions } from './business-solutions';
export async function SolutionsSection() {
  const [locale, block] = await Promise.all([getLocale(), getSiteBlock('solutions')]);
  const items = await api<BusinessSolution[]>(`/solutions?locale=${locale}`, true);
  if (!items.length) return null;
  return (
    <section className="solutions-section" id="solutions">
      <div className="container section">
        <div className={`solutions-heading ${block.imageUrl ? 'solutions-heading-image' : ''}`}>
          <div>
            <p className="eyebrow">{block.label}</p>
            <h2>{block.title}</h2>
            <p className="section-description">{block.body}</p>
          </div>
          {block.imageUrl && (
            <Image
              src={block.imageUrl}
              alt={block.imageAlt}
              width={800}
              height={500}
              sizes="(max-width:768px) 90vw, 35vw"
            />
          )}
        </div>
        <BusinessSolutions items={items} locale={locale} />
      </div>
    </section>
  );
}

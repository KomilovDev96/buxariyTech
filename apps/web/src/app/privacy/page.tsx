import type { PrivacyPolicy } from '@buhariy/contracts';
import { api } from '@/lib/api';
import { seo } from '@/lib/metadata';
export const metadata = seo(
  'Maxfiylik siyosati',
  'Murojaatlar va shaxsiy ma’lumotlarni qayta ishlash haqida ma’lumot.',
  '/privacy',
);
export default async function Privacy() {
  const p = await api<PrivacyPolicy>('/privacy', true);
  return (
    <article className="section container page-intro privacy-page">
      <p className="eyebrow">VERSIYA / {p.version}</p>
      <h1>{p.title}</h1>
      <div className="prose">
        {p.content
          .split('\n')
          .filter(Boolean)
          .map((s, i) => (
            <p key={i}>{s}</p>
          ))}
      </div>
    </article>
  );
}

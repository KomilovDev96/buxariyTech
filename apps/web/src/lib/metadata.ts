import type { Metadata } from 'next';

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3100').replace(
  /\/$/,
  '',
);

export function seo(title: string, description: string, path: string): Metadata {
  return {
    title: path === '/' ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: `${siteUrl}${path}`,
      type: 'website',
      images: [{ url: `${siteUrl}/images/bukhara.webp`, alt: 'Buxoro shahri' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${siteUrl}/images/bukhara.webp`],
    },
  };
}

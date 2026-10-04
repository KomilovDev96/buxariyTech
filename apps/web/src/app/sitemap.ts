import type { MetadataRoute } from 'next';
import type { Project, Service, Page } from '@buhariy/contracts';
import { api } from '@/lib/api';
import { siteUrl } from '@/lib/metadata';
export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl;
  const services = await api<Service[]>('/services');
  let projects: Project[] = [];
  let page = 1;
  do {
    const data = await api<Page<Project>>(`/projects?limit=100&page=${page}`);
    projects.push(...data.items);
    if (page >= data.pages) break;
    page++;
  } while (page < 10000);
  return [
    ...['', '/services', '/portfolio', '/about', '/contact', '/privacy'].map((path) => ({
      url: base + path,
    })),
    ...services.map((s) => ({ url: `${base}/services/${s.slug}` })),
    ...projects.map((p) => ({
      url: `${base}/portfolio/${p.slug}`,
      lastModified: new Date(p.updatedAt),
    })),
  ];
}

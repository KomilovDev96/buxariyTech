import 'server-only';
import { notFound } from 'next/navigation';
export async function api<T>(path: string, fresh = false): Promise<T> {
  const response = await fetch(
    `${process.env.API_INTERNAL_URL || 'http://localhost:4100'}${path}`,
    {
      ...(fresh ? { cache: 'no-store' as const } : { next: { revalidate: 30 } }),
      signal: AbortSignal.timeout(8000),
    },
  );
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error('Content service unavailable');
  return response.json();
}
